import { adminFetch } from '@/lib/appSession';
import type {
  ConciergeConversation,
  ConciergeFeedback,
  ConciergeLang,
  ConciergeLearnedAnswer,
  ConciergeRating,
  ConciergeStats,
} from '../../../shared/concierge';

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
