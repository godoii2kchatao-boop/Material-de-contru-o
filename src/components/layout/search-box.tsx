'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductVisual } from '@/components/catalog/product-visual';
import { Loader2, Search, X } from 'lucide-react';
import { formatBRL } from '@/lib/format';

interface Hit {
  id: string;
  slug: string;
  name: string;
  sku: string;
  unit: string;
  priceCents: number | null;
  image: string | null;
  category: string;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

/** Product search with live suggestions (ARIA combobox). Enter opens the full results. */
export function SearchBox({ tone = 'dark', size = 'md', autoFocus = false, placeholder = 'Buscar cimento, porcelanato, cabo 2,5…', onNavigate }: { tone?: 'dark' | 'light'; size?: 'md' | 'lg'; autoFocus?: boolean; placeholder?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [active, setActive] = useState(-1);
  const ctrl = useRef<AbortController | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      ctrl.current?.abort();
      return;
    }
    const t = window.setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setStatus('loading');
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(term)}&limit=6`, { signal: c.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { items: Hit[] };
        setHits(data.items);
        setStatus('done');
        setActive(-1);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setStatus('error');
      }
    }, 160);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };
  const submit = () => {
    const term = q.trim();
    if (active >= 0 && hits[active]) return go(`/produtos/${hits[active].slug}`);
    go(term ? `/produtos?q=${encodeURIComponent(term)}` : '/produtos');
  };

  const dark = tone === 'dark';
  const showList = open && q.trim().length >= 2;
  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={`flex items-center gap-2 rounded-[10px] px-3 ${size === 'lg' ? 'h-14' : 'h-11'} ${dark ? 'bg-white/[0.08] text-white ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-[var(--color-accent)]' : 'bg-white text-ink ring-[1.5px] ring-concrete-300 focus-within:ring-2 focus-within:ring-[var(--color-accent)]'}`}
      >
        <Search aria-hidden className={`h-5 w-5 shrink-0 ${dark ? 'text-white/70' : 'text-steel-500'}`} />
        <label htmlFor={`${id}-q`} className="sr-only">
          Buscar materiais
        </label>
        <input
          id={`${id}-q`}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < 2) {
              setHits([]);
              setStatus('idle');
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(hits.length - 1, a + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={placeholder}
          className={`h-full min-w-0 flex-1 bg-transparent outline-none ${size === 'lg' ? 'text-[17px]' : 'text-[16px]'} ${dark ? 'placeholder:text-white/55' : 'placeholder:text-[#767b80]'}`}
        />
        {status === 'loading' ? <Loader2 aria-label="Buscando" className="h-4 w-4 animate-spin opacity-70" /> : null}
        {q ? (
          <button type="button" aria-label="Limpar busca" onClick={() => setQ('')} className="grid h-8 w-8 place-items-center rounded-md opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button type="submit" className={`btn btn-primary btn-sm ${size === 'lg' ? '' : 'hidden sm:inline-flex'}`}>
          Buscar
        </button>
      </form>
      {showList ? (
        <div id={`${id}-list`} role="listbox" aria-label="Sugestões" className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[12px] bg-white text-ink shadow-[var(--shadow-float)] ring-1 ring-black/5">
          {status === 'error' ? (
            <p className="p-4 text-[15px]">A busca não respondeu. Tente de novo ou veja o catálogo completo.</p>
          ) : status === 'done' && hits.length === 0 ? (
            <p className="p-4 text-[15px]">
              Nada encontrado para <strong>“{q.trim()}”</strong>. Envie sua lista que a loja procura para você.
            </p>
          ) : (
            <ul>
              {hits.map((h, i) => (
                <li key={h.id} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}>
                  <button type="button" onClick={() => go(`/produtos/${h.slug}`)} onMouseEnter={() => setActive(i)} className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? 'bg-mineral-50' : ''}`}>
                    <ProductVisual image={h.image} category={h.category} name={h.name} sizes="44px" className="h-11 w-11 shrink-0 overflow-hidden rounded-md" iconClass="h-5 w-5" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{h.name}</span>
                      <span className="block font-mono text-[12px] text-text-dim">{h.sku}</span>
                    </span>
                    <span className="tabular text-[14px] font-semibold whitespace-nowrap">{h.priceCents != null ? formatBRL(h.priceCents) : 'Sob consulta'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={submit} className="block w-full border-t border-concrete-200 px-4 py-3 text-left text-[14px] font-semibold text-[var(--color-accent)]">
            Ver todos os resultados para “{q.trim()}”
          </button>
        </div>
      ) : null}
    </div>
  );
}
