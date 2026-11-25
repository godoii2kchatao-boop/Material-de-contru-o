import { NextResponse } from 'next/server';
import { getRegions } from '@/lib/data';
import { estimateFreight } from '@/lib/freight';
import { freightSchema, fieldErrors } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { recordEvent } from '@/lib/events';

export async function POST(req: Request) {
  const rl = rateLimit(`frete:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Muitas consultas seguidas. Aguarde um instante.' }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
  const parsed = freightSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  const regions = await getRegions();
  const result = estimateFreight(regions, { ...parsed.data, cep: parsed.data.cep ?? null });
  await recordEvent('freight_check');
  const region = 'region' in result && result.region ? { id: result.region.id, name: result.region.name, leadTime: result.region.leadTime } : null;
  return NextResponse.json({ kind: result.kind, message: result.message, feeCents: 'feeCents' in result ? result.feeCents : null, region });
}
