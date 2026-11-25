import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/catalog-view';
import { tenant } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Materiais de construção', description: `Catálogo de materiais de construção em ${tenant.seo.city}: cimento, blocos, aço, elétrica, hidráulica, tintas, pisos e ferramentas.` };

export default async function ProdutosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CatalogView searchParams={await searchParams} title="Materiais de construção" />;
}
