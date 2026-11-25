import type { Metadata, Viewport } from 'next';
import { photo } from '@/lib/photos';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/public-sans/wght.css';
import '@fontsource/jetbrains-mono/400.css';
import './globals.css';
import { getSettings } from '@/lib/data';
import { isDemo, siteUrl, tenant } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.storeName} — ${s.descriptor} em ${tenant.seo.city}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${s.storeName}` },
    description: tenant.brand.shortDescription,
    openGraph: { type: 'website', locale: 'pt_BR', siteName: s.storeName, title, description: tenant.brand.shortDescription, images: [photo('obra-faiscas')] },
    robots: isDemo ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = { themeColor: '#121315', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const brandVars = { '--brand-accent': s.theme.accent, '--brand-accent-hover': s.theme.accentHover, '--brand-safety': s.theme.safety } as React.CSSProperties;
  return (
    <html lang="pt-BR" style={brandVars}>
      <body>{children}</body>
    </html>
  );
}
