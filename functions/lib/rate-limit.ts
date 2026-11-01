const buckets = new Map<string, number[]>();

/**
 * In-isolate sliding-window limiter. Good enough to stop casual abuse of the
 * public email endpoints; Cloudflare may run several isolates in parallel.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((time) => now - time < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }

  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > 5000) {
    buckets.clear();
  }

  return false;
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
