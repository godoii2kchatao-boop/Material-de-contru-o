import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, getProduct, toCard } from '@/lib/data';
import { ProductVisual } from '@/components/catalog/product-visual';
import { AddToList } from '@/components/catalog/add-to-list';
import { Price, AvailabilityBadge } from '@/components/catalog/price';
import { ProductCard } from '@/components/catalog/product-card';
import { TrackView } from '@/components/catalog/track-view';
import { applicationLabels, isDemo, siteUrl, tenant } from '@/lib/tenant';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return { title: p.name, description: p.description, alternates: { canonical: `/produtos/${p.slug}` } };
}

const freightText = { leve: 'Entrega pela tabela de frete da região.', volumoso: 'Material volumoso: frete com adicional, confirmado no orçamento.', granel: 'Material a granel: frete cotado conforme volume e acesso à obra.' };

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const { products, categoryNames } = await getCatalog();
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    description: p.description,
    category: categoryNames[p.category],
    url: `${siteUrl}/produtos/${p.slug}`,
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    // Offers are published only for a real store with real prices.
    ...(!isDemo && p.priceCents != null ? { offers: { '@type': 'Offer', priceCurrency: 'BRL', price: (p.priceCents / 100).toFixed(2), availability: p.availability === 'em_estoque' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder', areaServed: tenant.seo.city } } : {}),
  };

  return (
    <div className="wrap py-10 md:py-14">
      <TrackView type="view_product" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav aria-label="Trilha" className="text-[14px] text-text-dim">
        <Link href="/" className="link-draw">
          Início
        </Link>{' '}
        /{' '}
        <Link href={`/categorias/${p.category}`} className="link-draw">
          {categoryNames[p.category]}
        </Link>{' '}
        / <span aria-current="page">{p.name}</span>
      </nav>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <figure className="grid content-start gap-2">
          <ProductVisual image={p.image} imageAlt={p.imageAlt} illustrative={!!p.imageCredit} priority category={p.category} name={p.name} sizes="(min-width:1024px) 50vw, 100vw" className="aspect-[4/3] overflow-hidden rounded-[14px]" iconClass="h-28 w-28" />
          {p.imageCredit ? (
            <figcaption className="text-[12.5px] text-text-dim">
              Foto ilustrativa do material, não do item exato fornecido. Crédito: {p.imageCredit.author} ·{' '}
              {p.imageCredit.source ? (
                <a href={p.imageCredit.source} target="_blank" rel="noopener noreferrer" className="underline">
                  {p.imageCredit.license}
                </a>
              ) : (
                p.imageCredit.license
              )}
            </figcaption>
          ) : null}
        </figure>
        <div className="grid content-start gap-6">
          <div className="grid gap-2">
            <h1 className="heading text-[clamp(28px,3.6vw,44px)]">{p.name}</h1>
            <p className="font-mono text-[13px] text-text-dim">
              Código {p.sku}
              {p.brand ? ` · ${p.brand}` : ' · Marca conforme disponibilidade'}
            </p>
          </div>
          <p className="max-w-[58ch] text-[16.5px] text-graphite-700">{p.description}</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Price cents={p.priceCents} unit={p.unit} size="lg" />
            <AvailabilityBadge value={p.availability} />
          </div>
          <div className="card grid gap-3 p-5">
            <p className="text-[14px] text-graphite-700">
              Vendido por <strong>{p.unit}</strong>
              {p.minQty > 1 ? (
                <>
                  {' '}
                  · quantidade mínima <strong className="tabular">{p.minQty}</strong>
                </>
              ) : null}
            </p>
            <AddToList productId={p.id} unit={p.unit} minQty={p.minQty} name={p.name} />
            <Link href="/orcamento" className="btn btn-secondary btn-sm">
              Solicitar orçamento
            </Link>
            <p className="text-[13.5px] text-text-dim">{freightText[p.freightClass]}</p>
          </div>
          <section aria-labelledby="specs">
            <h2 id="specs" className="heading text-[20px]">
              Especificações
            </h2>
            <dl className="mt-3 divide-y divide-concrete-200 rounded-[12px] bg-white">
              {Object.entries(p.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(120px,40%)_1fr] gap-4 px-4 py-3 text-[15px]">
                  <dt className="text-text-dim">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[minmax(120px,40%)_1fr] gap-4 px-4 py-3 text-[15px]">
                <dt className="text-text-dim">Aplicações</dt>
                <dd className="font-medium">{p.applications.map((a) => applicationLabels[a] ?? a).join(', ')}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] text-text-dim">Confira as especificações na embalagem e as normas do fabricante do item entregue.</p>
          </section>
        </div>
      </div>
      {related.length ? (
        <section aria-labelledby="rel" className="mt-20">
          <h2 id="rel" className="display text-[clamp(26px,3vw,40px)]">
            Da mesma categoria
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.id}>
                <ProductCard p={toCard(r)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
