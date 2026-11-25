import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { updateStore, nextCode, UPLOAD_DIR } from '@/lib/store';
import { getSettings } from '@/lib/data';
import { listSchema, fieldErrors } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { checkFile, safeName, EXT, MAX_FILES, MAX_TOTAL_BYTES } from '@/lib/upload';
import { buildQuoteMessage, whatsappLink } from '@/lib/quote-message';
import { recordEvent } from '@/lib/events';
import { formatPhone } from '@/lib/format';
import { isDemo } from '@/lib/tenant';
import type { StoredFile } from '@/lib/types';

/** Material list: typed text and/or files (PDF, photos). Files go to people, not to a robot. */
export async function POST(req: Request) {
  const rl = rateLimit(`list:${clientIp(req.headers)}`, 5, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Você enviou várias listas seguidas. Tente de novo em alguns minutos.' }, { status: 429 });
  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > MAX_TOTAL_BYTES + 1024 * 1024) return NextResponse.json({ error: 'Os arquivos somam mais de 20 MB.' }, { status: 413 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Envio inválido.' }, { status: 400 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(String(form.get('data') ?? '{}'));
  } catch {
    return NextResponse.json({ error: 'Envio inválido.' }, { status: 400 });
  }
  const parsed = listSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return NextResponse.json({ errors: { files: `Envie no máximo ${MAX_FILES} arquivos.` } }, { status: 422 });
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > MAX_TOTAL_BYTES) return NextResponse.json({ errors: { files: 'Os arquivos somam mais de 20 MB.' } }, { status: 422 });
  if (!files.length && !parsed.data.listText) return NextResponse.json({ errors: { listText: 'Digite a lista ou anexe um arquivo.' } }, { status: 422 });

  const checked: { file: File; bytes: Uint8Array; type: keyof typeof EXT }[] = [];
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    const c = checkFile(f.name, f.size, bytes.slice(0, 16));
    if (!c.ok || !c.type) return NextResponse.json({ errors: { files: c.error } }, { status: 422 });
    checked.push({ file: f, bytes, type: c.type });
  }

  const stored: StoredFile[] = [];
  for (const c of checked) {
    const id = crypto.randomUUID();
    if (!isDemo) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, `${id}.${EXT[c.type]}`), c.bytes, { mode: 0o600 });
    }
    stored.push({ id, name: safeName(c.file.name), type: c.type, size: c.file.size, stored: !isDemo });
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const q = await updateStore((d) => {
    const quote = {
      id: crypto.randomUUID(),
      code: nextCode(d),
      createdAt: now,
      updatedAt: now,
      status: 'novo' as const,
      source: 'lista' as const,
      customer: { ...input.customer, phone: formatPhone(input.customer.phone) },
      delivery: { ...input.delivery, regionId: null },
      items: [],
      listText: input.listText,
      files: stored,
      notes: input.notes,
      project: null,
      internalNotes: null,
    };
    d.quotes.unshift(quote);
    return quote;
  });
  await recordEvent('submit_list');
  const settings = await getSettings();
  const message = buildQuoteMessage({ storeName: settings.storeName, code: q.code, customer: q.customer, delivery: q.delivery, items: [], listText: q.listText, fileCount: stored.length, notes: q.notes });
  return NextResponse.json({ code: q.code, files: stored.length, demo: isDemo, message, whatsapp: whatsappLink(isDemo ? null : settings.whatsapp, message) });
}
