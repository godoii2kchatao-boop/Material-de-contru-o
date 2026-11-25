import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/data';
import { queryCatalog, parseQuery } from '@/lib/catalog-query';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export async function GET(req: Request) {
  const rl = rateLimit(`search:${clientIp(req.headers)}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Muitas buscas seguidas. Aguarde alguns segundos.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams.entries());
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get('limit') ?? 24) || 24));
  const { products, categoryNames } = await getCatalog();
  const list = queryCatalog(products, parseQuery(sp), categoryNames);
  return NextResponse.json({
    total: list.length,
    items: list.slice(0, limit).map((p) => ({ id: p.id, slug: p.slug, name: p.name, sku: p.sku, unit: p.unit, priceCents: p.priceCents, image: p.image, category: p.category })),
  });
}
