import { readLearned } from '../../lib/concierge-store';

interface KVNamespace {
  get(key: string): Promise<string | null>;
}

interface Env {
  MIMENU_KV?: KVNamespace;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/**
 * GET /api/concierge/learned?venue=jaleo
 * Public: the widget loads approved answers before each conversation.
 */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const venueId = new URL(request.url).searchParams.get('venue') || '';
  if (!/^[a-z0-9-]{2,64}$/i.test(venueId)) return json({ answers: [] });

  const answers = (await readLearned(env, venueId)).filter((item) => item.active !== false);
  return json({ answers });
};

export const onRequestOptions = async () => json({}, 204);
