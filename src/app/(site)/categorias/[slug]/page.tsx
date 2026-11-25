import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/catalog-view';
import { getCatalog } from '@/lib/data';
import { tenant } from '@/lib/tenant';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalog();
  const c = categories.find((x) => x.slug === slug);
  return c ? { title: `${c.name} em ${tenant.seo.city}`, description: c.description, alternates: { canonical: `/categorias/${slug}` } } : {};
}

export default async function CategoriaPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const { categories } = await getCatalog();
  const c = categories.find((x) => x.slug === slug);
  if (!c) notFound();
  return <CatalogView searchParams={await searchParams} lockedCategory={slug} title={c.name} intro={c.description} />;
}
