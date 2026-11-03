import { clientIp, isRateLimited } from '../../lib/rate-limit';
import { requireConciergeTool } from '../../lib/concierge-tool-auth';
import { readLearned } from '../../lib/concierge-store';
import { readSettings } from '../../lib/concierge-settings';
import type { KVLike } from '../../lib/concierge-settings';
import { normalizeText, tokenize } from '../../lib/concierge-text';

interface Env {
  CONCIERGE_TOOL_SECRET?: string;
  MIMENU_KV?: KVLike;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

interface Candidate {
  question: string;
  answer: string;
  tags: string[];
  source: 'aprendida' | 'local';
}

function scoreCandidate(candidate: Candidate, query: string, queryTokens: string[]): number {
  const tags = [...candidate.tags, ...tokenize(candidate.question)].map(normalizeText).filter(Boolean);
  let score = 0;
  if (tags.some((tag) => tag.length >= 3 && query.includes(tag))) score += 4;
  for (const token of queryTokens) {
    if (tags.some((tag) => tag.includes(token))) score += 1;
  }
  return score;
}

/**
 * GET /api/concierge/faq?query=...
 * Matches the guest's question against admin-curated FAQ entries and the
 * learned answers already stored by the previous concierge.
 */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const auth = await requireConciergeTool(request, env, 'faq');
  if (auth instanceof Response) return auth;

  if (isRateLimited(`concierge-faq:${auth.claims.vid}:${clientIp(request)}`, 120, 60 * 1000)) {
    return json({ error: 'Demasiadas consultas. Esperá un momento.' }, 429);
  }

  const query = (new URL(request.url).searchParams.get('query') || '').trim().slice(0, 300);
  if (!query) return json({ error: 'Falta la pregunta (query).' }, 400);

  const [settings, learned] = await Promise.all([
    readSettings(env, auth.venue),
    readLearned(env, auth.venue.id),
  ]);

  const candidates: Candidate[] = [
    ...learned
      .filter((entry) => entry.active !== false && entry.reply)
      .map((entry) => ({
        question: entry.triggers?.[0] ? `Sobre ${entry.triggers[0]}` : 'Respuesta del local',
        answer: entry.reply,
        tags: entry.triggers || [],
        source: 'aprendida' as const,
      })),
    ...settings.faq.map((entry) => ({
      question: entry.question,
      answer: entry.answer,
      tags: entry.tags,
      source: 'local' as const,
    })),
  ];

  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(query);
  const minimumScore = queryTokens.length <= 1 ? 1 : 2;

  const matches = candidates
    .map((candidate) => ({ ...candidate, score: scoreCandidate(candidate, normalizedQuery, queryTokens) }))
    .filter((candidate) => candidate.score >= minimumScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((candidate) => ({
      question: candidate.question,
      answer: candidate.answer,
      source: candidate.source,
    }));

  if (!matches.length) {
    return json({
      found: false,
      query,
      matches: [],
      suggestion: `No hay una respuesta aprobada para esta pregunta. Decí que no tenés ese dato y ofrecé el WhatsApp del local.`,
      handoff_message: settings.handoffMessage,
    });
  }

  return json({
    found: true,
    query,
    matches,
    handoff_message: settings.handoffMessage,
  });
};
