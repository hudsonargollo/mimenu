export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

// This Worker owns the brand domains, but the Pages Functions (plan gates, AR,
// WhatsApp webhook) live in the Pages project. Forward /api/* there so the app
// keeps a single public origin.
const API_ORIGIN = 'https://mimenu-1y0.pages.dev';

function proxyToApi(request: Request, url: URL): Promise<Response> {
  const target = new URL(url.pathname + url.search, API_ORIGIN);
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  return fetch(
    new Request(target.toString(), {
      method: request.method,
      headers: request.headers,
      body: hasBody ? request.body : undefined,
      redirect: 'manual',
    })
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return proxyToApi(request, url);
    }

    // Attempt asset fetch
    try {
      const res = await env.ASSETS.fetch(request);
      if (res.status < 400) {
        return res;
      }
    } catch (err) {
      // Continue to fallback
    }

    // SPA fallback: return index.html for React Router
    const fallbackUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
  },
};
