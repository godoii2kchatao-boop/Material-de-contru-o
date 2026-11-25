/**
 * Fixed-window limiter kept in memory. Protects a single instance; for several
 * instances, back it with a shared store (Redis/Upstash) using the same interface.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((b.reset - now) / 1000) };
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}

export function clientIp(headers: Headers) {
  return headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
}
