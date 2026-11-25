import { NextResponse } from 'next/server';
import { updateStore, nextCode } from '@/lib/store';
import { getCatalog, getRegions, getSettings } from '@/lib/data';
import { quoteSchema, fieldErrors } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { estimateFreight, matchRegion } from '@/lib/freight';
import { buildQuoteMessage, whatsappLink } from '@/lib/quote-message';
import { recordEvent } from '@/lib/events';
import { formatPhone } from '@/lib/format';
import { isDemo } from '@/lib/tenant';
import type { QuoteRequest } from '@/lib/types';

export async function POST(req: Request) {
  const rl = rateLimit(`quote:${clientIp(req.headers)}`, 6, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Você enviou várias solicitações seguidas. Tente de novo em alguns minutos.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  const input = parsed.data;
  const { products } = await getCatalog();
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = input.items
    .map((i) => {
      const p = byId.get(i.productId);
      return p ? { productId: p.id, sku: p.sku, name: p.name, unit: p.unit, qty: Math.max(i.qty, 0) } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  if (!items.length) return NextResponse.json({ errors: { items: 'Os itens da lista não estão mais no catálogo.' } }, { status: 422 });

  const regions = await getRegions();
  const region = input.delivery.mode === 'entrega' ? matchRegion(regions, { cep: input.delivery.cep, district: input.delivery.district }) : null;
  const freight = estimateFreight(regions, { cep: input.delivery.cep, district: input.delivery.district, pickup: input.delivery.mode === 'retirada', classes: items.map((i) => byId.get(i.productId)!.freightClass) });
  const settings = await getSettings();
  const now = new Date().toISOString();
  const quote = await updateStore((d) => {
    const q: QuoteRequest = {
      id: crypto.randomUUID(),
      code: nextCode(d),
      createdAt: now,
      updatedAt: now,
      status: 'novo',
      source: input.source,
      customer: { ...input.customer, phone: formatPhone(input.customer.phone) },
      delivery: { ...input.delivery, regionId: region?.id ?? null },
      items,
      listText: null,
      files: [],
      notes: input.notes,
      project: input.project,
      internalNotes: null,
    };
    d.quotes.unshift(q);
    d.quotes = d.quotes.slice(0, 2000);
    return q;
  });
  await recordEvent('submit_quote');
  const message = buildQuoteMessage({
    storeName: settings.storeName,
    code: quote.code,
    customer: quote.customer,
    delivery: quote.delivery,
    items,
    notes: quote.notes,
    project: quote.project,
    freightEstimateCents: freight.kind === 'estimativa' ? freight.feeCents : null,
  });
  return NextResponse.json({
    code: quote.code,
    message,
    whatsapp: whatsappLink(isDemo ? null : settings.whatsapp, message),
    demo: isDemo,
    freight: { kind: freight.kind, message: freight.message, feeCents: 'feeCents' in freight ? freight.feeCents : null },
  });
}
