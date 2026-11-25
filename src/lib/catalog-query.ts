import type { Availability, Product } from './types';
import { fold } from './format';

export type SortKey = 'relevancia' | 'preco_asc' | 'preco_desc' | 'nome';

export interface CatalogQuery {
  q?: string;
  category?: string | null;
  brand?: string | null;
  application?: string | null;
  availability?: Availability | null;
  minPrice?: number | null; // reais
  maxPrice?: number | null; // reais
  sort?: SortKey;
}

const SYNONYMS: Record<string, string[]> = {
  fio: ['cabo'],
  cabo: ['fio'],
  tijolo: ['bloco'],
  bloco: ['tijolo'],
  ferro: ['vergalhao', 'aco'],
  vergalhao: ['ferro'],
  cano: ['tubo'],
  tubo: ['cano'],
  massa: ['argamassa'],
  piso: ['porcelanato', 'ceramico'],
  porcelanato: ['piso'],
  lampada: ['led'],
  impermeabilizante: ['manta', 'impermeavel'],
};

function tokens(s: string) {
  return fold(s)
    .replace(/[^a-z0-9,.\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Score a product for the free-text query. 0 means no match. */
export function scoreProduct(p: Product, q: string, categoryName = '') {
  const qt = tokens(q);
  if (!qt.length) return 1;
  const name = fold(p.name);
  const hay = fold([p.name, p.sku, p.description, categoryName, p.brand ?? '', ...Object.values(p.specs), ...p.applications].join(' '));
  let score = 0;
  for (const t of qt) {
    const alts = [t, ...(SYNONYMS[t] ?? [])];
    let best = 0;
    for (const a of alts) {
      const w = a === t ? 1 : 0.6;
      if (name.split(/[^a-z0-9,.]+/).some((x) => x === a)) best = Math.max(best, 6 * w);
      else if (name.includes(a)) best = Math.max(best, 4 * w);
      else if (fold(p.sku).includes(a)) best = Math.max(best, 5 * w);
      else if (hay.includes(a)) best = Math.max(best, 1.5 * w);
    }
    if (best === 0) return 0; // every token must match somewhere
    score += best;
  }
  if (name.startsWith(qt[0])) score += 2;
  if (p.popular) score += 0.5;
  return score;
}

export function queryCatalog(products: Product[], query: CatalogQuery, categoryNames: Record<string, string> = {}) {
  const q = (query.q ?? '').trim();
  let list = products
    .filter((p) => p.active)
    .filter((p) => !query.category || p.category === query.category)
    .filter((p) => !query.brand || (p.brand ?? '') === query.brand)
    .filter((p) => !query.application || p.applications.includes(query.application))
    .filter((p) => !query.availability || p.availability === query.availability)
    .filter((p) => query.minPrice == null || (p.priceCents != null && p.priceCents >= query.minPrice * 100))
    .filter((p) => query.maxPrice == null || (p.priceCents != null && p.priceCents <= query.maxPrice * 100))
    .map((p) => ({ p, s: scoreProduct(p, q, categoryNames[p.category] ?? '') }))
    .filter((x) => x.s > 0);
  const sort = query.sort ?? 'relevancia';
  const priced = (c: number | null, dir: 1 | -1) => (c == null ? Number.POSITIVE_INFINITY : c * dir);
  list = list.sort((a, b) => {
    if (sort === 'preco_asc') return priced(a.p.priceCents, 1) - priced(b.p.priceCents, 1);
    if (sort === 'preco_desc') return priced(a.p.priceCents, -1) - priced(b.p.priceCents, -1);
    if (sort === 'nome') return a.p.name.localeCompare(b.p.name, 'pt-BR');
    return b.s - a.s || Number(b.p.popular) - Number(a.p.popular) || a.p.name.localeCompare(b.p.name, 'pt-BR');
  });
  return list.map((x) => x.p);
}

export function parseQuery(sp: Record<string, string | string[] | undefined>): CatalogQuery {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v) ?? undefined;
  };
  const numOrNull = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  const sort = one('ordem') as SortKey | undefined;
  return {
    q: one('q')?.slice(0, 80),
    category: one('categoria') ?? null,
    brand: one('marca') ?? null,
    application: one('aplicacao') ?? null,
    availability: (one('disponibilidade') as Availability) ?? null,
    minPrice: numOrNull(one('min')),
    maxPrice: numOrNull(one('max')),
    sort: sort && ['relevancia', 'preco_asc', 'preco_desc', 'nome'].includes(sort) ? sort : 'relevancia',
  };
}
