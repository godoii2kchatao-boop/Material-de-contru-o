import Link from 'next/link';
import type { ProductCard as Card } from '@/lib/data';
import { ProductVisual } from './product-visual';
import { AddToList } from './add-to-list';
import { Price, AvailabilityBadge } from './price';

export function ProductCard({ p, categoryName }: { p: Card; categoryName?: string }) {
  return (
    <article className="card lift flex flex-col overflow-hidden">
      <Link href={`/produtos/${p.slug}`} className="group block" aria-label={p.name}>
        <ProductVisual image={p.image} imageAlt={p.imageAlt} illustrative={p.illustrative} category={p.category} name={p.name} className="aspect-[4/3]" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid gap-1">
          {categoryName ? <span className="text-[13px] text-text-dim">{categoryName}</span> : null}
          <h3 className="text-[16px] leading-snug font-semibold" style={{ fontFamily: 'var(--font-sans)', letterSpacing: 0 }}>
            <Link href={`/produtos/${p.slug}`} className="link-draw">
              {p.name}
            </Link>
          </h3>
          <span className="font-mono text-[12px] text-text-dim">{p.sku}</span>
        </div>
        <div className="mt-auto grid gap-3">
          <div className="grid gap-1.5">
            <Price cents={p.priceCents} unit={p.unit} />
            <AvailabilityBadge value={p.availability} />
          </div>
          <AddToList productId={p.id} unit={p.unit} minQty={p.minQty} compact name={p.name} />
        </div>
      </div>
    </article>
  );
}
