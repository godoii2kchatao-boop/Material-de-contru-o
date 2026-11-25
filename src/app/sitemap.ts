import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/data';
import { siteUrl } from '@/lib/tenant';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await getCatalog();
  const pages = ['', '/produtos', '/ofertas', '/profissionais', '/calculadoras', '/entrega', '/enviar-lista', '/sobre-a-plataforma', '/privacidade'];
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${siteUrl}/categorias/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${siteUrl}/produtos/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
