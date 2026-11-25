'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { formatBRL, formatCep } from '@/lib/format';
import { Field } from './quote-builder';

export function FreightChecker() {
  const [cep, setCep] = useState('');
  const [district, setDistrict] = useState('');
  const [kind, setKind] = useState<'leve' | 'volumoso' | 'granel'>('leve');
  const [qty, setQty] = useState('');
  const [pickup, setPickup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{ kind: string; message: string; feeCents: number | null; region: { name: string; leadTime: string } | null } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await fetch('/api/freight', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cep, district, pickup, classes: [kind] }) });
      const d = await r.json();
      if (!r.ok) setErr(d.error ?? Object.values(d.errors ?? {})[0] ?? 'Não foi possível consultar.');
      else setRes(d);
    } catch {
      setErr('Sem conexão. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={go} className="card grid gap-5 p-5 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CEP da obra">{(p) => <input {...p} className="input tabular" inputMode="numeric" placeholder="13000-000" value={cep} onChange={(e) => setCep(formatCep(e.target.value))} disabled={pickup} />}</Field>
        <Field label="Bairro">{(p) => <input {...p} className="input" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={pickup} />}</Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de material">
          {(p) => (
            <select {...p} className="input" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="leve">Sacarias, elétrica, hidráulica, tintas</option>
              <option value="volumoso">Blocos, telhas, madeira, barras de aço</option>
              <option value="granel">Areia, brita, pedra a granel</option>
            </select>
          )}
        </Field>
        <Field label="Quantidade aproximada (opcional)">{(p) => <input {...p} className="input" placeholder="Ex.: 40 sacos, 3 m³" value={qty} onChange={(e) => setQty(e.target.value)} />}</Field>
      </div>
      <label className="flex items-center gap-3 text-[15px]">
        <input type="checkbox" className="h-5 w-5 accent-[var(--color-accent)]" checked={pickup} onChange={(e) => setPickup(e.target.checked)} /> Prefiro retirar na loja
      </label>
      <button className="btn btn-primary w-fit" disabled={loading}>
        <Truck className="h-4 w-4" aria-hidden /> {loading ? 'Consultando…' : 'Consultar entrega'}
      </button>
      {err ? (
        <p role="alert" className="rounded-[10px] bg-[#fdecea] p-3 text-[14.5px]">
          {err}
        </p>
      ) : null}
      {res ? (
        <div role="status" className="grid gap-2 rounded-[12px] bg-mineral-50 p-4">
          {res.region ? <p className="font-semibold">{res.region.name}</p> : null}
          {res.kind === 'estimativa' && res.feeCents != null ? <p className="display tabular text-[32px]">{formatBRL(res.feeCents)}</p> : null}
          <p className="text-[15px]">{res.message}</p>
          {res.region ? <p className="text-[14px] text-text-dim">Prazo: {res.region.leadTime}</p> : null}
          {res.kind === 'cotacao' || res.kind === 'fora_da_area' ? (
            <Link href="/enviar-lista" className="btn btn-secondary btn-sm w-fit">
              Pedir cotação personalizada
            </Link>
          ) : null}
          <p className="text-[12.5px] text-text-dim">Tabela demonstrativa cadastrada pela loja. Valor e prazo finais vêm no orçamento{qty ? ` (quantidade informada: ${qty})` : ''}.</p>
        </div>
      ) : null}
    </form>
  );
}
