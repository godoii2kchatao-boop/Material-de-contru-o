import { Suspense } from 'react';
import Link from 'next/link';
import { getCatalog, toCard } from '@/lib/data';
import { queryCatalog, parseQuery } from '@/lib/catalog-query';
import { applicationLabels } from '@/lib/tenant';
import { ProductCard } from './product-card';
import { Filters } from './filters';

export async function CatalogView({ searchParams, lockedCategory, title, intro }: { searchParams: Record<string, string | string[] | undefined>; lockedCategory?: string; title: string; intro?: string }) {
  const { categories, products, categoryNames, counts } = await getCatalog();
  const q = parseQuery(searchParams);
  if (lockedCategory) q.category = lockedCategory;
  const list = queryCatalog(products, q, categoryNames);
  const brands = [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort();
  const apps = [...new Set(products.filter((p) => !lockedCategory || p.category === lockedCategory).flatMap((p) => p.applications))].map((a) => ({ value: a, label: applicationLabels[a] ?? a })).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

  return (
    <div className="wrap py-10 md:py-14">
      <nav aria-label="Trilha" className="text-[14px] text-text-dim">
        <Link href="/" className="link-draw">
          Início
        </Link>{' '}
        /{' '}
        {lockedCategory ? (
          <>
            <Link href="/produtos" className="link-draw">
              Materiais
            </Link>{' '}
            / <span aria-current="page">{title}</span>
          </>
        ) : (
          <span aria-current="page">Materiais</span>
        )}
      </nav>
      <h1 className="display mt-4 text-[clamp(32px,5vw,64px)]">{title}</h1>
      {intro ? <p className="mt-3 max-w-[60ch] text-[16.5px] text-graphite-700">{intro}</p> : null}
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside aria-label="Filtros">
          <Suspense>
            <Filters basePath={lockedCategory ? `/categorias/${lockedCategory}` : '/produtos'} lockedCategory={lockedCategory} categories={categories.map((c) => ({ value: c.slug, label: c.name, count: counts[c.slug] }))} applications={apps} brands={brands.map((b) => ({ value: b, label: b }))} />
          </Suspense>
        </aside>
        <section aria-labelledby="resultados">
          <h2 id="resultados" className="tabular text-[15px] font-semibold text-graphite-700" style={{ fontFamily: 'var(--font-sans)', letterSpacing: 0 }}>
            {list.length} {list.length === 1 ? 'produto' : 'produtos'}
            {q.q ? ` para “${q.q}”` : ''}
          </h2>
          {list.length === 0 ? (
            <div className="card mt-5 grid gap-3 p-8">
              <p className="heading text-[22px]">Nenhum produto com esses filtros.</p>
              <p className="text-graphite-700">Tente outro termo, limpe os filtros ou envie sua lista que a loja procura o material para você.</p>
              <div className="flex flex-wrap gap-3">
                <Link href={lockedCategory ? `/categorias/${lockedCategory}` : '/produtos'} className="btn btn-secondary btn-sm">
                  Limpar filtros
                </Link>
                <Link href="/enviar-lista" className="btn btn-primary btn-sm">
                  Enviar minha lista
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <li key={p.id}>
                  <ProductCard p={toCard(p)} categoryName={lockedCategory ? undefined : categoryNames[p.category]} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
