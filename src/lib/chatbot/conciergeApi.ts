import { adminFetch } from '@/lib/appSession';
import type { LearnedAnswer } from './engine';
import type {
  ConciergeConversation,
  ConciergeFeedback,
  ConciergeLang,
  ConciergeLearnedAnswer,
  ConciergeRating,
  ConciergeStats,
} from '../../../shared/concierge';

const CACHE_PREFIX = 'mimenu_concierge_learned_v1:';
const CACHE_TTL_MS = 10 * 60 * 1000;

interface LearnedCache {
  savedAt: number;
  answers: ConciergeLearnedAnswer[];
}

function readCache(venueId: string): ConciergeLearnedAnswer[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + venueId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LearnedCache;
    if (!Array.isArray(parsed.answers) || Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    return parsed.answers;
  } catch {
    return null;
  }
}

function writeCache(venueId: string, answers: ConciergeLearnedAnswer[]) {
  try {
    localStorage.setItem(CACHE_PREFIX + venueId, JSON.stringify({ savedAt: Date.now(), answers }));
  } catch {
    // Storage full or unavailable: the in-memory list still works for this visit.
  }
}

/** Approved answers used by the widget; cached briefly so the sheet opens fast. */
export async function fetchLearnedAnswers(venueId: string, force = false): Promise<LearnedAnswer[]> {
  if (!force) {
    const cached = readCache(venueId);
    if (cached) return cached.filter(answer => answer.active !== false);
  }

  try {
    const response = await fetch(`/api/concierge/learned?venue=${encodeURIComponent(venueId)}`);
    if (!response.ok) return readCache(venueId)?.filter(answer => answer.active !== false) ?? [];
    const data = await response.json();
    const answers: ConciergeLearnedAnswer[] = Array.isArray(data?.answers) ? data.answers : [];
    writeCache(venueId, answers);
    return answers.filter(answer => answer.active !== false);
  } catch {
    return readCache(venueId)?.filter(answer => answer.active !== false) ?? [];
  }
}

export interface TurnLog {
  venueId: string;
  sessionId: string;
  message: string;
  reply: string;
  lang: ConciergeLang;
  userName?: string;
  learnedId?: string;
  reservationSaved?: boolean;
}

/** Fire-and-forget: a failed log must never break the conversation. */
export function logConciergeTurn(turn: TurnLog): void {
  try {
    void fetch('/api/concierge/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turn),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Ignore network failures.
  }
}

export interface ConversationsPayload {
  sessions: ConciergeConversation[];
  stats: ConciergeStats;
  learned: ConciergeLearnedAnswer[];
}

export async function fetchConversations(venueId: string): Promise<ConversationsPayload> {
  const response = await adminFetch(`/api/concierge/conversations?venue=${encodeURIComponent(venueId)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'No se pudieron cargar las conversaciones.');
  return {
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    stats: data.stats ?? { turns: 0, good: 0, bad: 0, unreviewed: 0, learned: 0 },
    learned: Array.isArray(data.learned) ? data.learned : [],
  };
}

export interface RateTurnInput {
  venueId: string;
  turnId: string;
  rating: ConciergeRating;
  lang: ConciergeLang;
  correctedReply?: string;
  triggers?: string[];
}

export async function rateTurn(input: RateTurnInput): Promise<ConciergeFeedback | null> {
  const response = await adminFetch('/api/concierge/feedback', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'No se pudo guardar la revisión.');
  return data.feedback ?? null;
}

export async function updateLearnedAnswer(
  venueId: string,
  id: string,
  patch: { active?: boolean; reply?: string; triggers?: string[] }
): Promise<ConciergeLearnedAnswer[]> {
  const response = await adminFetch('/api/concierge/answers', {
    method: 'PATCH',
    body: JSON.stringify({ venueId, id, ...patch }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'No se pudo actualizar la respuesta.');
  return Array.isArray(data.learned) ? data.learned : [];
}

export async function deleteLearnedAnswer(
  venueId: string,
  id: string
): Promise<ConciergeLearnedAnswer[]> {
  const response = await adminFetch(
    `/api/concierge/answers?venue=${encodeURIComponent(venueId)}&id=${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'No se pudo eliminar la respuesta.');
  return Array.isArray(data.learned) ? data.learned : [];
}
