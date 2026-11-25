'use client';
import Link from 'next/link';
import { useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ClipboardCopy, History, Link2, MessageCircle, Save, Trash2, Truck } from 'lucide-react';
import { cart, decodeList, encodeList, useCart } from '@/lib/cart-store';
import type { ProductCard } from '@/lib/data';
import { formatBRL, formatCep, formatPhone, profileLabel } from '@/lib/format';
import { ProductVisual } from '@/components/catalog/product-visual';
import { track } from '@/lib/track';

type Errors = Record<string, string>;
interface Result {
  code: string;
  message: string;
  whatsapp: string;
  demo: boolean;
}
interface Freight {
  kind: string;
  message: string;
  feeCents: number | null;
  region: { name: string } | null;
}

export function QuoteBuilder({ products, policy, privacy, source = 'carrinho' }: { products: ProductCard[]; policy: string; privacy: string; source?: 'carrinho' | 'profissional' }) {
  const { lines, saved, history } = useCart();
  const sp = useSearchParams();
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const items = lines.map((l) => ({ line: l, p: byId.get(l.productId) })).filter((x): x is { line: typeof x.line; p: ProductCard } => !!x.p);
  const knownCount = items.length;

  const [imported, setImported] = useState<number | null>(null);
  useEffect(() => {
    const shared = decodeList(sp.get('lista')).filter((l) => byId.has(l.productId));
    if (shared.length) {
      cart.merge(shared);
      setImported(shared.length);
      window.history.replaceState(null, '', '/orcamento');
    }
  }, [sp, byId]);

  const [form, setForm] = useState({ name: '', phone: '', email: '', profile: source === 'profissional' ? 'pedreiro' : 'morador', company: '', mode: 'entrega' as 'entrega' | 'retirada', cep: '', district: '', address: '', notes: '', projectName: '', recurring: false, consent: false, website: '' });
  const up = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [freight, setFreight] = useState<Freight | null>(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [listName, setListName] = useState('');
  const [copied, setCopied] = useState<'link' | 'msg' | null>(null);

  const subtotal = items.reduce((s, { line, p }) => s + (p.priceCents ?? 0) * line.qty, 0);
  const consultCount = items.filter(({ p }) => p.priceCents == null).length;

  const checkFreight = async () => {
    setFreightLoading(true);
    setFreight(null);
    try {
      const res = await fetch('/api/freight', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cep: form.cep, district: form.district, pickup: form.mode === 'retirada', classes: items.map(({ p }) => p.freightClass) }) });
      const data = await res.json();
      if (!res.ok) setFreight({ kind: 'erro', message: data.error ?? Object.values(data.errors ?? {})[0] ?? 'Não foi possível consultar agora.', feeCents: null, region: null });
      else setFreight(data);
    } catch {
      setFreight({ kind: 'erro', message: 'Sem conexão. Tente de novo.', feeCents: null, region: null });
    } finally {
      setFreightLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrors({});
    setFatal(null);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer: { name: form.name, phone: form.phone, email: form.email, profile: form.profile, company: form.company },
          delivery: { mode: form.mode, cep: form.cep, district: form.district, address: form.address },
          items: items.map(({ line }) => ({ productId: line.productId, qty: line.qty })),
          notes: form.notes,
          project: form.projectName || form.recurring ? { name: form.projectName || null, recurring: form.recurring, volume: null } : null,
          source,
          consent: form.consent,
          website: form.website,
        }),
      });
      const data = await res.json();
      if (res.status === 422) {
        setErrors(data.errors ?? {});
        requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      } else if (!res.ok) setFatal(data.error ?? 'Não foi possível enviar agora. Tente de novo.');
      else {
        setResult(data);
        cart.recordSent(data.code);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setFatal('Sem conexão com a internet. Sua lista continua salva neste aparelho.');
    } finally {
      setSending(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/orcamento?lista=${encodeList(lines)}` : '';
  const copy = async (text: string, what: 'link' | 'msg') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  if (result) {
    return (
      <div className="card grid max-w-[760px] gap-5 p-6 md:p-8">
        <p className="inline-flex items-center gap-2 font-semibold text-ok">
          <Check className="h-5 w-5" aria-hidden /> Solicitação registrada
        </p>
        <h2 className="heading text-[28px]">Pedido de orçamento nº {result.code}</h2>
        <p className="text-graphite-700">Envie a mensagem abaixo pelo WhatsApp para falar com o atendimento. A loja confirma preços, disponibilidade e frete antes de qualquer pagamento.</p>
        {result.demo ? <p className="rounded-[10px] bg-[var(--color-accent-soft)] p-3 text-[14px]">Modo demonstração: o WhatsApp abre sem destinatário, para nenhuma empresa real receber o pedido.</p> : null}
        <pre className="max-h-[320px] overflow-auto rounded-[10px] bg-mineral-50 p-4 font-mono text-[13px] whitespace-pre-wrap">{result.message}</pre>
        <div className="flex flex-wrap gap-3">
          <a href={result.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => track('whatsapp_click')}>
            <MessageCircle className="h-4 w-4" aria-hidden /> Enviar pelo WhatsApp
          </a>
          <button type="button" className="btn btn-secondary" onClick={() => copy(result.message, 'msg')}>
            <ClipboardCopy className="h-4 w-4" aria-hidden /> {copied === 'msg' ? 'Mensagem copiada' : 'Copiar mensagem'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-concrete-200 pt-5">
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setResult(null)}>
            Voltar para a lista
          </button>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => {
              cart.clear();
              setResult(null);
            }}
          >
            Começar uma lista nova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
      <section aria-labelledby="itens" className="grid gap-4">
        {imported ? (
          <p className="rounded-[10px] bg-[var(--color-accent-soft)] p-3 text-[14.5px]" role="status">
            {imported} {imported === 1 ? 'item recebido' : 'itens recebidos'} pelo link e somados à sua lista.
          </p>
        ) : null}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="itens" className="heading text-[24px]">
            Itens da lista <span className="tabular text-text-dim">({knownCount})</span>
          </h2>
          {knownCount ? (
            <button type="button" className="link-draw text-[14px] font-semibold text-danger" onClick={() => confirm('Remover todos os itens da lista?') && cart.clear()}>
              Esvaziar lista
            </button>
          ) : null}
        </div>
        {knownCount === 0 ? (
          <div className="card grid gap-3 p-6">
            <p className="heading text-[20px]">Sua lista está vazia.</p>
            <p className="text-graphite-700">Adicione materiais pelo catálogo, recupere uma lista salva ou envie a lista que você já tem.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/produtos" className="btn btn-primary btn-sm">
                Explorar materiais
              </Link>
              <Link href="/enviar-lista" className="btn btn-secondary btn-sm">
                Enviar lista pronta
              </Link>
            </div>
          </div>
        ) : (
          <ul className="card divide-y divide-concrete-200">
            {items.map(({ line, p }) => (
              <li key={p.id} className="grid grid-cols-[64px_1fr] gap-3 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                <ProductVisual image={p.image} category={p.category} name={p.name} sizes="64px" className="h-16 w-16 overflow-hidden rounded-[10px]" iconClass="h-7 w-7" />
                <div className="min-w-0">
                  <Link href={`/produtos/${p.slug}`} className="link-draw font-semibold">
                    {p.name}
                  </Link>
                  <p className="font-mono text-[12px] text-text-dim">{p.sku}</p>
                  <p className="tabular text-[14px] text-graphite-700">{p.priceCents != null ? `${formatBRL(p.priceCents)} / ${p.unit}` : `Sob consulta · ${p.unit}`}</p>
                </div>
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <label className="sr-only" htmlFor={`q-${p.id}`}>
                    Quantidade de {p.name} em {p.unit}
                  </label>
                  <input id={`q-${p.id}`} className="input tabular !min-h-11 w-24 text-center" inputMode="decimal" defaultValue={line.qty} onBlur={(e) => cart.set(p.id, Math.max(p.minQty, Number(e.target.value.replace(',', '.')) || p.minQty))} />
                  <span className="w-16 text-[14px] text-text-dim">{p.unit}</span>
                  <button type="button" className="grid h-11 w-11 place-items-center rounded-[10px] text-danger hover:bg-mineral-50" aria-label={`Remover ${p.name}`} onClick={() => cart.remove(p.id)}>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {knownCount ? (
          <div className="card grid gap-2 p-5 text-[15px]">
            <p className="flex justify-between">
              <span>Subtotal dos itens com preço</span>
              <strong className="tabular">{formatBRL(subtotal)}</strong>
            </p>
            {consultCount ? <p className="text-text-dim">{consultCount} item(ns) sob consulta ficam para o orçamento.</p> : null}
            <p className="text-[13px] text-text-dim">Preços demonstrativos. {policy}</p>
          </div>
        ) : null}

        {/* Saved lists, share and history */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card grid content-start gap-3 p-5">
            <h3 className="heading flex items-center gap-2 text-[18px]">
              <Save className="h-4 w-4" aria-hidden /> Listas salvas
            </h3>
            {knownCount ? (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  cart.save(listName || 'Minha lista');
                  setListName('');
                }}
              >
                <label className="sr-only" htmlFor="list-name">
                  Nome da lista
                </label>
                <input id="list-name" className="input !min-h-10" placeholder="Ex.: Obra da garagem" value={listName} onChange={(e) => setListName(e.target.value)} />
                <button className="btn btn-secondary btn-sm">Salvar</button>
              </form>
            ) : null}
            {saved.length ? (
              <ul className="grid gap-2">
                {saved.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-[14.5px]">
                    <span>
                      <strong>{s.name}</strong> <span className="text-text-dim">· {s.lines.length} itens</span>
                    </span>
                    <span className="flex gap-1">
                      <button type="button" className="btn btn-quiet btn-sm !min-h-9" onClick={() => cart.merge(s.lines)}>
                        Usar
                      </button>
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-danger" aria-label={`Apagar lista ${s.name}`} onClick={() => cart.deleteSaved(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-text-dim">Salve listas que você compra sempre e reutilize com um toque. Ficam só neste aparelho.</p>
            )}
          </div>
          <div className="card grid content-start gap-3 p-5">
            <h3 className="heading flex items-center gap-2 text-[18px]">
              <History className="h-4 w-4" aria-hidden /> Pedidos anteriores
            </h3>
            {history.length ? (
              <ul className="grid gap-2">
                {history.slice(0, 5).map((h) => (
                  <li key={h.code + h.sentAt} className="flex items-center justify-between gap-2 text-[14.5px]">
                    <span>
                      <span className="font-mono">{h.code}</span> <span className="text-text-dim">· {new Date(h.sentAt).toLocaleDateString('pt-BR')}</span>
                    </span>
                    <button type="button" className="btn btn-quiet btn-sm !min-h-9" onClick={() => cart.merge(h.lines)}>
                      Comprar de novo
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-text-dim">Os orçamentos enviados deste aparelho aparecem aqui para recompra rápida.</p>
            )}
            {knownCount ? (
              <button type="button" className="btn btn-quiet btn-sm w-fit" onClick={() => copy(shareUrl, 'link')}>
                <Link2 className="h-4 w-4" aria-hidden /> {copied === 'link' ? 'Link copiado' : 'Copiar link da lista'}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <form onSubmit={submit} noValidate aria-labelledby="dados" className="card grid gap-5 p-5 md:p-6 lg:sticky lg:top-24">
        <h2 id="dados" className="heading text-[24px]">
          Seus dados e a entrega
        </h2>
        <Field label="Nome" error={errors['customer.name']}>
          {(p) => <input {...p} className="input" autoComplete="name" value={form.name} onChange={(e) => up('name', e.target.value)} />}
        </Field>
        <Field label="WhatsApp ou telefone com DDD" error={errors['customer.phone']}>
          {(p) => <input {...p} className="input tabular" inputMode="tel" autoComplete="tel" placeholder="(19) 90000-0000" value={form.phone} onChange={(e) => up('phone', formatPhone(e.target.value))} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Você é" error={errors['customer.profile']}>
            {(p) => (
              <select {...p} className="input" value={form.profile} onChange={(e) => up('profile', e.target.value)}>
                {Object.entries(profileLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="E-mail (opcional)" error={errors['customer.email']}>
            {(p) => <input {...p} className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => up('email', e.target.value)} />}
          </Field>
        </div>
        {['construtora', 'manutencao', 'engenheiro', 'arquiteto'].includes(form.profile) ? (
          <Field label="Empresa (opcional)" error={errors['customer.company']}>
            {(p) => <input {...p} className="input" autoComplete="organization" value={form.company} onChange={(e) => up('company', e.target.value)} />}
          </Field>
        ) : null}

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-[14px] font-semibold">Como receber</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['entrega', 'retirada'] as const).map((m) => (
              <label key={m} className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold ring-[1.5px] ${form.mode === m ? 'bg-graphite-900 text-white ring-graphite-900' : 'ring-concrete-300'}`}>
                <input type="radio" name="mode" value={m} checked={form.mode === m} onChange={() => up('mode', m)} className="sr-only" />
                {m === 'entrega' ? 'Entrega na obra' : 'Retirar na loja'}
              </label>
            ))}
          </div>
          {form.mode === 'entrega' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CEP" error={errors['delivery.cep']}>
                  {(p) => <input {...p} className="input tabular" inputMode="numeric" autoComplete="postal-code" placeholder="13000-000" value={form.cep} onChange={(e) => up('cep', formatCep(e.target.value))} />}
                </Field>
                <Field label="Bairro">{(p) => <input {...p} className="input" value={form.district} onChange={(e) => up('district', e.target.value)} />}</Field>
              </div>
              <Field label="Endereço aproximado (opcional)">{(p) => <input {...p} className="input" autoComplete="street-address" value={form.address} onChange={(e) => up('address', e.target.value)} />}</Field>
              <button type="button" className="btn btn-quiet btn-sm w-fit" onClick={checkFreight} disabled={freightLoading || (!form.cep && !form.district)}>
                <Truck className="h-4 w-4" aria-hidden /> {freightLoading ? 'Consultando…' : 'Estimar frete'}
              </button>
              {freight ? (
                <p role="status" className={`rounded-[10px] p-3 text-[14px] ${freight.kind === 'erro' || freight.kind === 'fora_da_area' ? 'bg-[#fdecea]' : 'bg-mineral-50'}`}>
                  {freight.region ? <strong className="block">{freight.region.name}</strong> : null}
                  {freight.feeCents != null && freight.kind === 'estimativa' ? <strong className="tabular block text-[17px]">{formatBRL(freight.feeCents)}</strong> : null}
                  {freight.message}
                </p>
              ) : null}
            </>
          ) : null}
        </fieldset>
        <Field label="Nome da obra (opcional)">{(p) => <input {...p} className="input" placeholder="Ex.: Reforma do banheiro" value={form.projectName} onChange={(e) => up('projectName', e.target.value)} />}</Field>
        <label className="flex items-start gap-3 text-[15px]">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-accent)]" checked={form.recurring} onChange={(e) => up('recurring', e.target.checked)} />
          Compro esses materiais com frequência (lista recorrente)
        </label>
        <Field label="Observações (opcional)" error={errors.notes}>
          {(p) => <textarea {...p} className="input" rows={3} placeholder="Acesso à obra, horário para entrega, cores…" value={form.notes} onChange={(e) => up('notes', e.target.value)} />}
        </Field>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => up('website', e.target.value)} />
        <div className="grid gap-1">
          <label className="flex items-start gap-3 text-[14.5px]">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-accent)]" checked={form.consent} onChange={(e) => up('consent', e.target.checked)} aria-invalid={!!errors.consent} />
            <span>
              {privacy}{' '}
              <Link href="/privacidade" className="underline">
                Ver política de privacidade
              </Link>
              .
            </span>
          </label>
          {errors.consent ? <p className="field-error">{errors.consent}</p> : null}
        </div>
        {errors.items ? <p className="field-error">{errors.items}</p> : null}
        {fatal ? (
          <p role="alert" className="rounded-[10px] bg-[#fdecea] p-3 text-[14.5px]">
            {fatal}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary w-full" disabled={sending || knownCount === 0}>
          {sending ? 'Enviando…' : 'Solicitar orçamento'}
        </button>
        <p className="text-[13px] text-text-dim">{policy}</p>
      </form>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: (p: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="text-[14px] font-semibold text-graphite-800">
        {label}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-e` : undefined })}
      {error ? (
        <p id={`${id}-e`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
