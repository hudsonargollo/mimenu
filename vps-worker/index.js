#!/usr/bin/env node
/**
 * mimenu VPS AR Background Worker
 * -------------------------------------------------------------
 * Polls Cloudflare KV-backed task queue (via the /api/ar/* functions),
 * fetches generated models from Meshy AI, downloads the .glb / .usdz
 * files to the nginx static dir, and reports completion back to the
 * Cloudflare Functions which persist the URLs in KV.
 *
 * Zero runtime npm dependencies (Node >= 18: global fetch).
 *
 * Configuration (environment):
 *   AR_WORKER_URL      e.g. https://mimenu.clubemkt.digital   (required)
 *   AR_WORKER_TOKEN    shared secret with CF functions        (required)
 *   MESHY_API_KEY      Meshy API key (only needed for local status
 *                      polling; not required - CF functions proxy it)
 *   MODELS_DIR         default /var/www/mimenu/models
 *   MODELS_BASE_URL    public origin serving MODELS_DIR,
 *                      e.g. https://mimenu-models.clubemkt.digital (required)
 *   PORT               enqueue HTTP port, default 8787
 *   STATE_FILE         default <worker dir>/state.json
 *   POLL_INTERVAL_MS   default 10000
 *
 * Run:  AR_WORKER_URL=https://mimenu.clubemkt.digital ... node index.js
 * -------------------------------------------------------------
 * Task lifecycle:
 *   pending    -> task registered in KV (generate.ts) and enqueued/pulled
 *   processing -> worker claimed the task (claimARTask in KV)
 *   completed  -> files hosted on VPS, URLs recorded in KV via report
 *   failed     -> parse/convert error or timeout
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- Config ----

const CFG = {
  AR_WORKER_URL: (process.env.AR_WORKER_URL || '').replace(/\/$/, ''),
  AR_WORKER_TOKEN: process.env.AR_WORKER_TOKEN || '',
  MODELS_DIR: process.env.MODELS_DIR || '/var/www/mimenu/models',
  MODELS_BASE_URL: (process.env.MODELS_BASE_URL || '').replace(/\/$/, ''),
  PORT: Number(process.env.PORT || 8787),
  HOST: process.env.HOST || '0.0.0.0',
  STATE_FILE: process.env.STATE_FILE || path.join(__dirname, 'state.json'),
  POLL_INTERVAL_MS: Number(process.env.POLL_INTERVAL_MS || 10_000),
  MESHY_API_URL: 'https://api.meshy.ai/openapi/v1/image-to-3d',
  STALE_TASK_MS: 12 * 60 * 60 * 1000, // 12h hard timeout
  DOWNLOAD_TIMEOUT_MS: 120_000,
};

for (const [k, v] of Object.entries({
  AR_WORKER_URL: CFG.AR_WORKER_URL,
  AR_WORKER_TOKEN: CFG.AR_WORKER_TOKEN,
  MODELS_BASE_URL: CFG.MODELS_BASE_URL,
})) {
  if (!v) {
    console.error(`[fatal] Missing required env ${k}`);
    process.exit(1);
  }
}

fs.mkdirSync(CFG.MODELS_DIR, { recursive: true });

// ---------------------------------------------------------------- State -----

/** @type {Record<string, {taskId:string; menuItemId:string; imageUrl:string; itemName?:string; status:'pending'|'processing'|'completed'|'failed'; createdAt:number; updatedAt:number; error?:string}>} */
let tasks = {};

function loadState() {
  try {
    tasks = JSON.parse(fs.readFileSync(CFG.STATE_FILE, 'utf8'));
    console.log(`[state] Loaded ${Object.keys(tasks).length} task(s) from ${CFG.STATE_FILE}`);
  } catch {
    tasks = {};
  }
}

function saveState() {
  const tmp = `${CFG.STATE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2));
  fs.renameSync(tmp, CFG.STATE_FILE);
}

// ---------------------------------------------------------------- HTTP ------

const server = http.createServer(async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${CFG.AR_WORKER_TOKEN}`) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }

  if (req.method === 'GET' && req.url === '/health') {
    const open = Object.values(tasks).filter((t) => t.status === 'pending' || t.status === 'processing').length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, tasks: Object.keys(tasks).length, open }));
  }

  if (req.method === 'POST' && req.url === '/enqueue') {
    let body = '';
    for await (const chunk of req) body += chunk;
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    const { taskId, menuItemId, imageUrl, itemName } = json;
    if (!taskId || !menuItemId || !imageUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'taskId, menuItemId and imageUrl are required' }));
    }
    const existing = tasks[taskId];
    if (existing && (existing.status === 'completed' || existing.status === 'processing')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, alreadyTracked: true, taskId }));
    }
    tasks[taskId] = {
      taskId,
      menuItemId,
      imageUrl,
      itemName,
      status: 'pending',
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    saveState();
    console.log(`[enqueue] Task ${taskId} for menu item ${menuItemId}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, taskId }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ---------------------------------------------------------------- Meshy -----

async function meshyStatus(taskId) {
  // The API key lives in the CF env; the worker reads task state through the
  // status endpoint which proxies Meshy — but for final asset URLs we query
  // Meshy directly when MESHY_API_KEY is present, otherwise fall back to the
  // proxy which includes meshy_glb_url / meshy_usdz_url.
  const res = await fetch(`${CFG.AR_WORKER_URL}/api/ar/status/${taskId}`, {
    headers: { Authorization: `Bearer ${CFG.AR_WORKER_TOKEN}`, 'x-vps-worker': 'true' },
  });
  if (!res.ok) throw new Error(`status endpoint ${res.status}`);
  const json = await res.json();
  if (json.status === 'PENDING' || json.status === 'IN_PROGRESS') {
    return { status: json.status, progress: json.progress ?? 0 };
  }
  if (json.status === 'FAILED') {
    return { status: 'FAILED', error: json.error || 'Meshy task failed' };
  }
  return {
    status: 'SUCCEEDED',
    glbUrl: json.glb_url || json.meshy_glb_url,
    usdzUrl: json.usdz_url || json.meshy_usdz_url,
    thumbnailUrl: json.thumbnail_url || json.meshy_thumbnail_url,
    meshyUrls: { glb: json.meshy_glb_url, usdz: json.meshy_usdz_url },
  };
}

// -------------------------------------------------------------- Download ----

async function download(url, destPath) {
  const res = await fetch(url, { signal: AbortSignal.timeout(CFG.DOWNLOAD_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = `${destPath}.tmp`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, destPath);
  console.log(`[download] ${path.basename(destPath)} → ${(buf.length / 1024).toFixed(0)} KB`);
  return buf.length;
}

// ------------------------------------------------------------ Pipeline ------

async function processTask(task) {
  const { taskId, menuItemId } = task;
  console.log(`[task:${taskId}] Checking Meshy status for ${menuItemId}...`);

  const meshy = await meshyStatus(taskId);

  if (meshy.status === 'PENDING' || meshy.status === 'IN_PROGRESS') {
    console.log(`[task:${taskId}] ${meshy.status} (${meshy.progress}%)`);
    return; // keep waiting
  }

  if (meshy.status === 'FAILED') {
    console.error(`[task:${taskId}] FAILED from Meshy: ${meshy.error}`);
    task.status = 'failed';
    task.error = meshy.error;
    task.updatedAt = Date.now();
    saveState();
    await report(taskId, 'failed', { error: meshy.error, menuItemId });
    return;
  }

  // SUCCEEDED — download fresh Meshy assets into the nginx static dir.
  // glbUrl/usdzUrl may already point at the VPS if a previous run hosted
  // them before dying; in that case just re-report.
  console.log(`[task:${taskId}] SUCCEEDED. Downloading assets...`);
  if (!meshy.meshyUrls?.glb && meshy.usdzUrl && meshy.glbUrl) {
    // Assets already hosted on the VPS.
    await report(taskId, 'completed', {
      glbUrl: meshy.glbUrl,
      usdzUrl: meshy.usdzUrl,
      thumbnailUrl: meshy.thumbnailUrl,
      menuItemId,
    });
    task.status = 'completed';
    task.updatedAt = Date.now();
    saveState();
    console.log(`[task:${taskId}] ✔ Using already-hosted assets for item ${menuItemId}`);
    return;
  }

  const glbPath = path.join(CFG.MODELS_DIR, `${menuItemId}.glb`);
  const usdzPath = path.join(CFG.MODELS_DIR, `${menuItemId}.usdz`);
  const thumbPath = path.join(CFG.MODELS_DIR, `${menuItemId}_thumb.png`);

  // Meshy signed URLs expire; prefer freshest available URL set.
  const urls = meshy.meshyUrls;
  if (!urls.glb || !urls.usdz) {
    throw new Error(`Meshy response missing model URLs (glb=${!!urls.glb}, usdz=${!!urls.usdz})`);
  }

  await download(urls.glb, glbPath);
  await download(urls.usdz, usdzPath);
  let thumbnailUrl;
  if (meshy.thumbnailUrl) {
    try {
      await download(meshy.thumbnailUrl, thumbPath);
      thumbnailUrl = `${CFG.MODELS_BASE_URL}/${encodeURIComponent(menuItemId)}_thumb.png`;
    } catch (err) {
      console.warn(`[task:${taskId}] Thumbnail download skipped: ${err.message}`);
    }
  }

  const glbUrl = `${CFG.MODELS_BASE_URL}/${encodeURIComponent(menuItemId)}.glb`;
  const usdzUrl = `${CFG.MODELS_BASE_URL}/${encodeURIComponent(menuItemId)}.usdz`;

  await report(taskId, 'completed', { glbUrl, usdzUrl, thumbnailUrl, menuItemId });
  task.status = 'completed';
  task.updatedAt = Date.now();
  saveState();
  console.log(`[task:${taskId}] ✔ 3D asset pipeline complete for item ${menuItemId}`);
}

// --------------------------------------------------------------- Report -----

async function report(taskId, status, extra = {}) {
  try {
    const res = await fetch(`${CFG.AR_WORKER_URL}/api/ar/report`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CFG.AR_WORKER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, status, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn(`[report] ${taskId}: non-OK ${res.status} ${JSON.stringify(json)}`);
      return false;
    }
    console.log(`[report] ${taskId} → ${status}${json.alreadyHandled ? ' (already handled)' : ''}`);
    return true;
  } catch (err) {
    console.warn(`[report] ${taskId}: ${err.message}`);
    return false;
  }
}

// -------------------------------------------------- Self-heal queue pull ----

async function pullQueue() {
  const res = await fetch(`${CFG.AR_WORKER_URL}/api/ar/queue`, {
    headers: { Authorization: `Bearer ${CFG.AR_WORKER_TOKEN}` },
  });
  if (!res.ok) throw new Error(`queue pull ${res.status}`);
  const { tasks: pending = [] } = await res.json();
  for (const t of pending) {
    if (tasks[t.taskId]?.status === 'completed' || tasks[t.taskId]?.status === 'processing') continue;
    console.log(`[pull] Adopting orphan task ${t.taskId}`);
    // Claim in KV so other pulls skip it, then track locally.
    let claimed = null;
    try {
      const cres = await fetch(`${CFG.AR_WORKER_URL}/api/ar/queue`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CFG.AR_WORKER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'claim', taskId: t.taskId, menuItemId: t.menuItemId, imageUrl: t.imageUrl, itemName: t.itemName }),
      });
      const cjson = await cres.json().catch(() => ({}));
      claimed = cjson.claimed || cjson.requeued;
    } catch (err) {
      console.warn(`[pull] claim failed for ${t.taskId}: ${err.message}`);
    }
    if (!claimed) continue;
    tasks[t.taskId] = {
      taskId: t.taskId,
      menuItemId: t.menuItemId,
      imageUrl: t.imageUrl,
      itemName: t.itemName,
      status: 'processing',
      createdAt: t.createdAt,
      updatedAt: Date.now(),
    };
    saveState();
  }
}

// ------------------------------------------------------------ Main loop -----

async function pollTasks() {
  const now = Date.now();

  // 1. Self-heal: adopt tasks enqueued while the worker was down.
  try {
    await pullQueue();
  } catch (err) {
    console.error('[pull] Error pulling queue:', err.message);
  }

  // 2. Reap stale tasks.
  for (const task of Object.values(tasks)) {
    if ((task.status === 'pending' || task.status === 'processing') && now - task.createdAt > CFG.STALE_TASK_MS) {
      console.error(`[reap] Task ${task.taskId} hit 12h timeout.`);
      task.status = 'failed';
      task.error = 'Timed out after 12h.';
      saveState();
      await report(task.taskId, 'failed', { error: task.error, menuItemId: task.menuItemId });
    }
  }

  // 3. Process open tasks sequentially.
  const open = Object.values(tasks).filter((t) => t.status === 'pending' || t.status === 'processing');
  if (open.length) console.log(`[loop] Processing ${open.length} open task(s)...`);
  for (const task of open) {
    task.status = 'processing';
    try {
      await processTask(task);
    } catch (err) {
      console.error(`[task:${task.taskId}] Error:`, err.message);
      // Keep the task open — retried next loop. Never report failed transiently.
    }
    saveState();
  }
}

// ----------------------------------------------------------------- Boot -----

loadState();
server.listen(CFG.PORT, CFG.HOST, () => {
  console.log(`mimenu AR worker: enqueue API listening on http://${CFG.HOST}:${CFG.PORT}`);
});
console.log('VPS AR Worker started. Polling every', CFG.POLL_INTERVAL_MS, 'ms.');
console.log('  Cloudflare:  ', CFG.AR_WORKER_URL);
console.log('  Models dir:  ', CFG.MODELS_DIR);
console.log('  Public base: ', CFG.MODELS_BASE_URL);

await pollTasks();
setInterval(pollTasks, CFG.POLL_INTERVAL_MS).unref?.();

const shutdown = () => {
  console.log('\n[shutdown] Saving state...');
  saveState();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
