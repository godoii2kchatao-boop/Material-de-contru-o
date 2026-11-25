import Link from 'next/link';
import { Logo } from './logo';
import type { StoreSettings } from '@/lib/types';

export function Footer({ s, categories }: { s: StoreSettings; categories: { slug: string; name: string }[] }) {
  return (
    <footer className="bg-graphite-950 pb-28 text-white/80 lg:pb-10">
      <div className="wrap grid gap-10 pt-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <Logo name={s.storeName} descriptor={s.descriptor} />
          <p className="max-w-[34ch] text-[15px]">{s.slogan}</p>
          <p className="text-[15px]">
            {s.address.street ? `${s.address.street}, ` : ''}
            {s.address.district}, {s.address.city} – {s.address.state}
          </p>
          <ul className="text-[15px]">
            {s.hours.map((h) => (
              <li key={h.days}>
                {h.days}: {h.open ? `${h.open} às ${h.close}` : 'fechado'}
              </li>
            ))}
          </ul>
        </div>
        <FooterList title="Materiais" links={categories.slice(0, 7).map((c) => ({ href: `/categorias/${c.slug}`, label: c.name }))} />
        <FooterList
          title="Atendimento"
          links={[
            { href: '/orcamento', label: 'Minha lista de orçamento' },
            { href: '/enviar-lista', label: 'Enviar lista de materiais' },
            { href: '/entrega', label: 'Entrega e frete' },
            { href: '/calculadoras', label: 'Calculadoras de material' },
            { href: '/profissionais', label: 'Para profissionais' },
          ]}
        />
        <FooterList
          title="A plataforma"
          links={[
            { href: '/sobre-a-plataforma', label: 'Como a plataforma funciona' },
            { href: '/privacidade', label: 'Privacidade e LGPD' },
            { href: '/admin', label: 'Área da loja' },
          ]}
        />
      </div>
      <div className="wrap mt-14 grid gap-2 border-t border-white/10 pt-6 text-[13px] text-white/55">
        <p>Fotografias de obra: Unsplash (Licença Unsplash). Fotos de produtos marcadas como ilustrativas trazem o crédito na ficha. Produtos sem foto aparecem com o ícone da categoria.</p>
        <p>
          © {new Date().getFullYear()} {s.storeName} — marca demonstrativa. Desenvolvido por KRB_DIGITAL.
        </p>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="label mb-3 text-[13px] tracking-[0.08em] text-white uppercase">{title}</h2>
      <ul className="grid gap-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link-draw inline-flex min-h-10 items-center text-[15px] hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
