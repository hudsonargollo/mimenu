import type { ConciergeLearnedAnswer } from '../../shared/concierge';

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export const learnedKey = (venueId: string) => `concierge:learned:${venueId}`;
export const feedbackKey = (venueId: string, turnId: string) => `concierge:fb:${venueId}:${turnId}`;

export async function readLearned(env: { MIMENU_KV?: KVLike }, venueId: string): Promise<ConciergeLearnedAnswer[]> {
  if (!env.MIMENU_KV) return [];
  const raw = await env.MIMENU_KV.get(learnedKey(venueId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ConciergeLearnedAnswer[]) : [];
  } catch {
    return [];
  }
}

export async function writeLearned(
  env: { MIMENU_KV?: KVLike },
  venueId: string,
  answers: ConciergeLearnedAnswer[]
): Promise<void> {
  if (!env.MIMENU_KV) throw new Error('MIMENU_KV namespace not bound');
  await env.MIMENU_KV.put(learnedKey(venueId), JSON.stringify(answers.slice(0, 200)));
}
