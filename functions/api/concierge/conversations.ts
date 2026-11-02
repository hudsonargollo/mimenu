import { canReviewVenue, json, requireConciergeAdmin } from '../../lib/concierge-auth';
import { feedbackKey, readLearned } from '../../lib/concierge-store';
import type {
  ConciergeConversation,
  ConciergeFeedback,
  ConciergeStats,
  ConciergeTurn,
} from '../../../shared/concierge';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    cursor?: string;
  }>;
}

interface Env {
  MIMENU_KV?: KVNamespace;
  APP_SESSION_SECRET?: string;
}

const MAX_TURNS = 400;
const BATCH = 40;

async function readAll<T>(kv: KVNamespace, keys: string[]): Promise<T[]> {
  const values: T[] = [];
  for (let index = 0; index < keys.length; index += BATCH) {
    const chunk = keys.slice(index, index + BATCH);
    const loaded = await Promise.all(
      chunk.map(async (key) => {
        const raw = await kv.get(key);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      })
    );
    for (const value of loaded) if (value) values.push(value);
  }
  return values;
}

/**
 * GET /api/concierge/conversations?venue=jaleo
 * Admin-only. Returns the latest turns grouped by guest session.
 */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const venueId = new URL(request.url).searchParams.get('venue') || '';
  if (!/^[a-z0-9-]{2,64}$/i.test(venueId)) return json({ error: 'Sede inválida.' }, 400);
  if (!canReviewVenue(admin, venueId)) return json({ error: 'No podés revisar otra sede.' }, 403);

  const listed = await env.MIMENU_KV.list({
    prefix: `concierge:t:${venueId}:`,
    limit: MAX_TURNS,
  });

  const [turns, learned] = await Promise.all([
    readAll<ConciergeTurn>(env.MIMENU_KV, listed.keys.map((key) => key.name)),
    readLearned(env, venueId),
  ]);

  const feedback = await readAll<ConciergeFeedback & { turnId: string }>(
    env.MIMENU_KV,
    turns.map((turn) => feedbackKey(venueId, turn.id))
  );
  const feedbackByTurn = new Map(feedback.map((item) => [item.turnId, item]));

  const sessions = new Map<string, ConciergeConversation>();
  for (const turn of turns) {
    const existing = sessions.get(turn.sessionId);
    const withFeedback = { ...turn, feedback: feedbackByTurn.get(turn.id) || null };
    if (!existing) {
      sessions.set(turn.sessionId, {
        sessionId: turn.sessionId,
        userName: turn.userName || null,
        lang: turn.lang,
        startedAt: turn.createdAt,
        lastAt: turn.createdAt,
        turns: [withFeedback],
      });
      continue;
    }
    existing.turns.push(withFeedback);
    if (!existing.userName && turn.userName) existing.userName = turn.userName;
    existing.lang = turn.lang;
    if (turn.createdAt < existing.startedAt) existing.startedAt = turn.createdAt;
    if (turn.createdAt > existing.lastAt) existing.lastAt = turn.createdAt;
  }

  const conversations = Array.from(sessions.values())
    .map((conversation) => ({
      ...conversation,
      turns: conversation.turns.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  const stats: ConciergeStats = {
    turns: turns.length,
    good: feedback.filter((item) => item.rating === 'good').length,
    bad: feedback.filter((item) => item.rating === 'bad').length,
    unreviewed: turns.filter((turn) => !feedbackByTurn.has(turn.id)).length,
    learned: learned.length,
  };

  return json({ venueId, sessions: conversations, stats, learned });
};

export const onRequestOptions = async () => json({}, 204);
