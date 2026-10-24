# WebAR & AI 3D Generation Pipeline (KV + VPS Worker) — mimenu.clubemkt.digital

Implementation of the WebAR / AI-3D PRD adapted to the actual mimenu stack
(Vite + React SPA, Cloudflare Pages Functions, Workers KV, VPS worker behind Docker nginx).

## Architecture

```
+----------------------------------------------------------------------------------+
|  Frontend (Vite + React, /root/ClubeMkt/mimenu)                                   |
|    Customer:  src/pages/customer/Menu.tsx  → "Ver en 3D" chip → <ARMenuViewer>    |
|    Admin:     src/pages/admin/AdminProducts.tsx → "3D / AR" → <Admin3DModal>      |
|    Viewer:    src/components/ARMenuViewer.tsx (@google/model-viewer, client-only) |
|    Hook:      src/hooks/useARModels.ts (batch fetch + polling helpers)            |
+-----------------------------------+----------------------------------------------+
                                    |  /api/ar/* (Cloudflare Pages Functions)
                                    v
+----------------------------------------------------------------------------------+
|  functions/api/ar/                                                                |
|    generate.ts   POST {menuItemId,imageUrl} → Meshy /openapi/v1/image-to-3d       |
|                  (target_formats ["glb","usdz"]) → KV ar_task:{id}, menu_item:{id}|
|                  → enqueue on VPS worker (best effort)                            |
|    status/[taskId].ts  GET — task + live Meshy progress proxy (admin polling)     |
|    report.ts     POST (Bearer AR_WORKER_TOKEN) — worker completion/failure        |
|    menu-item/[menuItemId].ts  GET — public single record                          |
|    menu-items.ts  GET ?ids=a,b,c — public batch (customer chips)                  |
|    queue.ts       GET/POST (Bearer) — worker self-heal pull + claim/enqueue       |
|    manual.ts      POST — manually register external .glb/.usdz URLs               |
|  functions/lib/kv-ar.ts   KV helpers (keys: menu_item:{id}, ar_task:{taskId})     |
+-----------------------------------+----------------------------------------------+
                                    |  task
                                    v
+----------------------------------------------------------------------------------+
|  VPS Worker (vps-worker/index.js, systemd: mimenu-ar-worker.service)              |
|    - POST /enqueue HTTP API (127.0.0.1:8787, reverse-proxied at                   |
|      ar-worker.clubemkt.digital) — protected by AR_WORKER_TOKEN                   |
|    - Every 10 s: pulls /api/ar/queue, claims tasks, polls Meshy via               |
|      /api/ar/status, downloads glb/usdz/thumb → /var/www/mimenu/models            |
|    - Reports completion URLs back via POST /api/ar/report                         |
|    - Zero npm dependencies (Node ≥ 18 global fetch). State: state.json            |
+----------------------------------------------------------------------------------+
                  assets served by core_nginx (Docker Swarm, /root/nginx.conf)
                  https://mimenu-models.clubemkt.digital/models/{menuItemId}.glb/.usdz
```

Notes vs. the original PRD:
- Menu items live in Supabase; AR state lives in Workers KV (`MIMENU_KV`) so the
  customer menu can render AR chips without touching Supabase rows.
- Meshy natively returns **USDZ** (`target_formats`), so no GLB→USDZ conversion
  runs on the VPS (`usdzconvert` step from the PRD became unnecessary).
- Correction: the Meshy endpoint is `/openapi/v1/image-to-3d` (PRD used `/v2`).

## Deployed & live (2026-10-24)

- Cloudflare KV namespace `MIMENU_KV` created and bound to the Pages project
  via the Pages API (`deployment_configs.production.kv_namespaces`) — the CLI
  config path did **not** apply it because `wrangler.jsonc` shadows
  `wrangler.toml` for Pages deploys (`configFileType: none` in logs).
- Secrets on Pages project `mimenu` (production): `AR_WORKER_TOKEN`, `AR_WORKER_URL`.
- Missing: **`MESHY_API_KEY`** — set it before first use:
  ```bash
  cd /root/ClubeMkt/mimenu
  npx wrangler pages secret put MESHY_API_KEY --project-name=mimenu
  ```
- VPS worker running + enabled: `systemctl status mimenu-ar-worker`
  (env file: `vps-worker/vps-worker.env`, mode 600; token copy: `/root/.mimenu_ar_worker_token`).
- nginx: `mimenu-models` + `ar-worker` server blocks appended to `/root/nginx.conf`
  (backup: `/root/nginx.conf.bak.20261024-ar`), serving the Docker `core_nginx` service,
  with a bind mount `/var/www/mimenu → container` (added via `docker service update --mount-add`).
- Functions verified live: batch read, single read, report write-through,
  queue pull/claim (worker self-heal), generate (fails fast without MESHY_API_KEY).

## What still needs a human

1. **DNS (Cloudflare dashboard, zone clubemkt.digital)** — the OAuth token has no
   dns_records write scope; create both records **A / proxied → 62.171.137.90**:
   - `mimenu-models.clubemkt.digital`
   - `ar-worker.clubemkt.digital`
2. **`MESHY_API_KEY`** secret (command above).
3. **Device validation** (PRD checklist): open a menu item on iPhone (Quick Look
   via .usdz) and Android (Scene Viewer via .glb).

## Operations

```bash
# worker logs / restart
journalctl -u mimenu-ar-worker -f
systemctl restart mimenu-ar-worker

# KV inspection (CLI defaults to LOCAL simulation — always pass --remote!)
npx wrangler kv key list --namespace-id=bfb8ba5a9b72487db588779f42883151 --remote
# ... or use the REST API with the token (/bulk endpoints accept raw keys)

# frontend build + deploy
cd /root/ClubeMkt/mimenu && npm run build && npx wrangler pages deploy dist --project-name=mimenu --branch=main

# resolve a stuck creation (Meshy→generate) — report a failure manually
TOKEN=$(grep AR_WORKER_TOKEN vps-worker/vps-worker.env | cut -d= -f2)
curl -X POST https://mimenu.clubemkt.digital/api/ar/report \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"taskId":"<id>","status":"failed","error":"manual abort"}'
```

## Do NOT

- Do **not** run `wrangler deploy` in this repo: `wrangler.jsonc` defines a bare
  Worker (`worker.ts`) whose `routes` would hijack `mimenu.clubemkt.digital`
  away from the Pages deployment (no Functions, no AR endpoints).
- Do not store model binaries in the repo; they live in `/var/www/mimenu/models`.
- Trusting note: `/api/ar/generate` and `/api/ar/manual` follow the project's
  existing open-endpoint pattern (no session auth in Functions). Tighten when a
  shared auth middleware lands.

## Verification checklist (adapted from PRD §5)

- [x] KV read/write round-trip (`menu_item:{id}` write via report, batch read)
- [x] VPS worker daemon (systemd) running; queue pull + claim verified with
      seeded fake tasks (cleaned up afterwards)
- [x] Enqueue endpoint local test (token auth, health, persistent state)
- [x] Asset static hosting through `core_nginx` (test file served with correct
      MIME + CORS; directory cleaned)
- [ ] iPhone Quick Look / Android Scene Viewer on-device test (needs DNS + MESHY key)
- [ ] First real AI generation end-to-end (needs MESHY_API_KEY)
