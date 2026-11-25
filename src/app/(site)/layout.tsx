import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { DemoBar } from '@/components/layout/demo-bar';
import { MobileBar } from '@/components/layout/mobile-bar';
import { getCatalog, getSettings } from '@/lib/data';
import { isDemo } from '@/lib/tenant';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, { categories }] = await Promise.all([getSettings(), getCatalog()]);
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      {isDemo ? <DemoBar /> : null}
      <Header name={s.storeName} descriptor={s.descriptor} />
      <main id="conteudo">{children}</main>
      <Footer s={s} categories={categories} />
      <MobileBar whatsapp={isDemo ? null : s.whatsapp} storeName={s.storeName} />
    </>
  );
}
