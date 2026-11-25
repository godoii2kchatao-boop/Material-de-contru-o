import 'server-only';
import { cache } from 'react';
import { readStore } from './store';
import type { Offer, Product } from './types';

export const getStore = cache(readStore);

export const getCatalog = cache(async () => {
  const s = await getStore();
  const categories = s.categories.filter((c) => c.active !== false).sort((a, b) => a.order - b.order);
  const products = s.products.filter((p) => p.active);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const counts = Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.category === c.slug).length]));
  return { categories, products, categoryNames, counts };
});

export async function getProduct(slug: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export function isOfferLive(o: Offer, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return o.active && o.startsAt <= today && o.endsAt >= today;
}

export const getOffers = cache(async () => {
  const s = await getStore();
  const byId = new Map(s.products.map((p) => [p.id, p]));
  return s.offers
    .filter((o) => isOfferLive(o))
    .map((o) => ({ ...o, products: o.productIds.map((id) => byId.get(id)).filter((p): p is Product => !!p && p.active) }));
});

export const getSettings = cache(async () => (await getStore()).settings);
export const getRegions = cache(async () => (await getStore()).regions);

/** The subset of a product a client component needs. */
export function toCard(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    category: p.category,
    unit: p.unit,
    minQty: p.minQty,
    priceCents: p.priceCents,
    availability: p.availability,
    image: p.image,
    freightClass: p.freightClass,
    brand: p.brand,
    applications: p.applications,
  };
}
export type ProductCard = ReturnType<typeof toCard>;
