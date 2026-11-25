'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';

interface Opt {
  value: string;
  label: string;
  count?: number;
}

/** Filters write to the URL; the server renders the results. Shareable and back-button friendly. */
export function Filters({ categories, applications, brands, basePath, lockedCategory }: { categories: Opt[]; applications: Opt[]; brands: Opt[]; basePath: string; lockedCategory?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    start(() => router.replace(`${pathname || basePath}?${next.toString()}`, { scroll: false }));
  };
  const v = (k: string) => sp.get(k) ?? '';
  const active = ['q', 'categoria', 'marca', 'aplicacao', 'disponibilidade', 'min', 'max'].filter((k) => sp.get(k)).length;

  const panel = (
    <div className="grid gap-6">
      <div className="field">
        <span>Buscar no catálogo</span>
        <input className="input" type="search" defaultValue={v('q')} placeholder="Nome, código ou aplicação" onChange={(e) => set({ q: e.target.value || null })} />
      </div>
      {!lockedCategory ? (
        <label className="field">
          <span>Categoria</span>
          <select className="input" value={v('categoria')} onChange={(e) => set({ categoria: e.target.value || null })}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} ({c.count})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="field">
        <span>Aplicação</span>
        <select className="input" value={v('aplicacao')} onChange={(e) => set({ aplicacao: e.target.value || null })}>
          <option value="">Todas</option>
          {applications.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {brands.length ? (
        <label className="field">
          <span>Marca</span>
          <select className="input" value={v('marca')} onChange={(e) => set({ marca: e.target.value || null })}>
            <option value="">Todas</option>
            {brands.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="field-hint">Marcas: a loja demonstrativa não tem marcas autorizadas cadastradas.</p>
      )}
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-[14px] font-semibold">Faixa de preço (R$)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" inputMode="numeric" aria-label="Preço mínimo" placeholder="Mín." defaultValue={v('min')} onBlur={(e) => set({ min: e.target.value.replace(/\D/g, '') || null })} />
          <input className="input" inputMode="numeric" aria-label="Preço máximo" placeholder="Máx." defaultValue={v('max')} onBlur={(e) => set({ max: e.target.value.replace(/\D/g, '') || null })} />
        </div>
        <span className="field-hint">Itens sob consulta saem da lista ao filtrar por preço.</span>
      </fieldset>
      <label className="field">
        <span>Disponibilidade</span>
        <select className="input" value={v('disponibilidade')} onChange={(e) => set({ disponibilidade: e.target.value || null })}>
          <option value="">Qualquer</option>
          <option value="em_estoque">Disponível</option>
          <option value="sob_encomenda">Sob encomenda</option>
          <option value="consulte">Consulte disponibilidade</option>
        </select>
      </label>
      {active ? (
        <button type="button" className="btn btn-quiet btn-sm w-fit" onClick={() => set({ q: null, categoria: null, marca: null, aplicacao: null, disponibilidade: null, min: null, max: null })}>
          <X className="h-4 w-4" aria-hidden /> Limpar filtros
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button type="button" className="btn btn-secondary btn-sm" aria-expanded={open} aria-controls="filtros" onClick={() => setOpen((o) => !o)}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtros{active ? ` (${active})` : ''}
        </button>
        <SortSelect value={v('ordem')} onChange={(o) => set({ ordem: o === 'relevancia' ? null : o })} />
      </div>
      <div id="filtros" className={`${open ? 'block' : 'hidden'} card mt-3 p-5 lg:mt-0 lg:block lg:bg-transparent lg:p-0 lg:shadow-none`}>
        {panel}
      </div>
      <div className="hidden lg:block">
        <div className="mt-6">
          <SortSelect value={v('ordem')} onChange={(o) => set({ ordem: o === 'relevancia' ? null : o })} />
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {pending ? 'Atualizando resultados' : ''}
      </p>
      {pending ? (
        <div className="fixed top-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-graphite-950 px-4 py-2 text-[14px] text-white shadow-[var(--shadow-float)]">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden /> Atualizando
        </div>
      ) : null}
    </>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-[14px] font-semibold">
      <span>Ordenar</span>
      <select className="input !min-h-10 w-auto min-w-0" value={value || 'relevancia'} onChange={(e) => onChange(e.target.value)}>
        <option value="relevancia">Relevância</option>
        <option value="preco_asc">Menor preço</option>
        <option value="preco_desc">Maior preço</option>
        <option value="nome">Nome (A–Z)</option>
      </select>
    </label>
  );
}
