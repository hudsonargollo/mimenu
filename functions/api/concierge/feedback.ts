import { canReviewVenue, json, requireConciergeAdmin } from '../../lib/concierge-auth';
import { feedbackKey, readLearned, writeLearned } from '../../lib/concierge-store';
import type {
  ConciergeFeedback,
  ConciergeLang,
  ConciergeLearnedAnswer,
  ConciergeRating,
} from '../../../shared/concierge';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  MIMENU_KV?: KVNamespace;
  APP_SESSION_SECRET?: string;
}

const LANGS = new Set(['es', 'en', 'pt', 'de']);
const RATINGS = new Set(['good', 'bad']);
const ID_PATTERN = /^[A-Za-z0-9._:-]{4,120}$/;

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const cleanTriggers = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().toLowerCase().slice(0, 60))
        .filter((item) => item.length >= 3)
    )
  ).slice(0, 8);
};

/**
 * POST /api/concierge/feedback
 * Admin-only. Rates a turn; a corrected reply also becomes a curated answer.
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  const venueId = clean(body.venueId, 64);
  const turnId = clean(body.turnId, 120);
  const rating = clean(body.rating, 8);

  if (!/^[a-z0-9-]{2,64}$/i.test(venueId)) return json({ error: 'Sede inválida.' }, 400);
  if (!ID_PATTERN.test(turnId)) return json({ error: 'Turno inválido.' }, 400);
  if (!RATINGS.has(rating)) return json({ error: 'Calificación inválida.' }, 400);
  if (!canReviewVenue(admin, venueId)) return json({ error: 'No podés revisar otra sede.' }, 403);

  const correctedReply = clean(body.correctedReply, 1200);
  const triggers = cleanTriggers(body.triggers);
  const lang = clean(body.lang, 2) as ConciergeLang;
  if (!LANGS.has(lang)) return json({ error: 'Idioma inválido.' }, 400);

  const feedback: ConciergeFeedback = {
    turnId,
    rating: rating as ConciergeRating,
    reviewer: admin.email,
    reviewedAt: new Date().toISOString(),
  };
  if (correctedReply) feedback.correctedReply = correctedReply;
  if (triggers.length) feedback.triggers = triggers;

  await env.MIMENU_KV.put(feedbackKey(venueId, turnId), JSON.stringify(feedback));

  let learned: ConciergeLearnedAnswer[] | null = null;
  if (rating === 'bad' && correctedReply.length >= 2 && triggers.length > 0) {
    learned = await readLearned(env, venueId);
    const existing = learned.find((item) => item.sourceTurnId === turnId);
    if (existing) {
      existing.reply = correctedReply;
      existing.triggers = triggers;
      existing.lang = lang;
      existing.active = true;
    } else {
      learned.unshift({
        id: crypto.randomUUID(),
        lang,
        triggers,
        reply: correctedReply,
        active: true,
        sourceTurnId: turnId,
        createdAt: new Date().toISOString(),
      });
    }
    await writeLearned(env, venueId, learned);
  }

  return json({ ok: true, feedback, learned });
};

export const onRequestOptions = async () => json({}, 204);
