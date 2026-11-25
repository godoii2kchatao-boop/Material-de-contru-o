import type { Metadata } from 'next';
import Link from 'next/link';
import { getOffers, toCard } from '@/lib/data';
import { formatBRL } from '@/lib/format';
import { ProductCard } from '@/components/catalog/product-card';

export const metadata: Metadata = { title: 'Ofertas e combos', description: 'Ofertas da semana, combos para reforma e kits de ferramentas.' };

const kindLabel: Record<string, string> = { semanal: 'Oferta da semana', combo: 'Combo para reforma', kit: 'Kit', categoria: 'Oferta por categoria', sazonal: 'Campanha sazonal', destaque: 'Destaque' };

export default async function OfertasPage() {
  const offers = await getOffers();
  return (
    <div className="wrap py-10 md:py-14">
      <h1 className="display text-[clamp(32px,5vw,60px)]">Ofertas, combos e kits</h1>
      <p className="mt-3 max-w-[62ch] text-[16.5px] text-graphite-700">Cada oferta mostra o período de validade cadastrado pela loja. Sem contagem regressiva e sem desconto inventado: preço riscado só aparece quando a loja registrou o valor anterior.</p>
      {offers.length === 0 ? <p className="card mt-8 p-6">Nenhuma oferta ativa agora.</p> : null}
      <div className="mt-10 grid gap-14">
        {offers.map((o) => (
          <section key={o.id} aria-labelledby={o.id} className="grid gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid gap-2">
                <span className="text-[14px] font-semibold text-[var(--color-accent)]">{kindLabel[o.kind]}</span>
                <h2 id={o.id} className="heading text-[clamp(24px,2.6vw,34px)]">
                  {o.title}
                </h2>
                <p className="max-w-[60ch] text-graphite-700">{o.description}</p>
              </div>
              <div className="text-right">
                {o.priceCents != null ? (
                  <p className="tabular">
                    {o.referencePriceCents ? <s className="mr-2 text-text-dim">{formatBRL(o.referencePriceCents)}</s> : null}
                    <strong className="text-[26px]">{formatBRL(o.priceCents)}</strong>
                  </p>
                ) : (
                  <p className="font-semibold">Preço no orçamento</p>
                )}
                <p className="text-[13px] text-text-dim">
                  De {new Date(o.startsAt + 'T12:00:00').toLocaleDateString('pt-BR')} a {new Date(o.endsAt + 'T12:00:00').toLocaleDateString('pt-BR')} · valores demonstrativos
                </p>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {o.products.map((p) => (
                <li key={p.id}>
                  <ProductCard p={toCard(p)} />
                </li>
              ))}
            </ul>
            {o.category ? (
              <Link href={`/categorias/${o.category}`} className="link-draw w-fit font-semibold">
                Ver a categoria completa
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
