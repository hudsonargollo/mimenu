import { canReviewVenue, json, requireConciergeAdmin } from '../../lib/concierge-auth';
import { readLearned, writeLearned } from '../../lib/concierge-store';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  MIMENU_KV?: KVNamespace;
  APP_SESSION_SECRET?: string;
}

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const cleanTriggers = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const triggers = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().toLowerCase().slice(0, 60))
        .filter((item) => item.length >= 3)
    )
  ).slice(0, 8);
  return triggers.length ? triggers : null;
};

/** PATCH /api/concierge/answers — edit, enable or disable a curated answer. */
export const onRequestPatch = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  const venueId = clean(body.venueId, 64);
  const id = clean(body.id, 80);
  if (!/^[a-z0-9-]{2,64}$/i.test(venueId) || !id) return json({ error: 'Sede o respuesta inválida.' }, 400);
  if (!canReviewVenue(admin, venueId)) return json({ error: 'No podés revisar otra sede.' }, 403);

  const answers = await readLearned(env, venueId);
  const answer = answers.find((item) => item.id === id);
  if (!answer) return json({ error: 'La respuesta no existe.' }, 404);

  if (typeof body.active === 'boolean') answer.active = body.active;
  const reply = clean(body.reply, 1200);
  if (reply) answer.reply = reply;
  const triggers = cleanTriggers(body.triggers);
  if (triggers) answer.triggers = triggers;

  await writeLearned(env, venueId, answers);
  return json({ ok: true, learned: answers });
};

/** DELETE /api/concierge/answers?venue=jaleo&id=... */
export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const venueId = url.searchParams.get('venue') || '';
  const id = url.searchParams.get('id') || '';
  if (!/^[a-z0-9-]{2,64}$/i.test(venueId) || !id) return json({ error: 'Sede o respuesta inválida.' }, 400);
  if (!canReviewVenue(admin, venueId)) return json({ error: 'No podés revisar otra sede.' }, 403);

  const answers = (await readLearned(env, venueId)).filter((item) => item.id !== id);
  await writeLearned(env, venueId, answers);
  return json({ ok: true, learned: answers });
};

export const onRequestOptions = async () => json({}, 204);
