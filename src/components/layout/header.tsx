'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ClipboardList, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { Logo } from './logo';
import { SearchBox } from './search-box';

const NAV = [
  { href: '/produtos', label: 'Materiais' },
  { href: '/ofertas', label: 'Ofertas' },
  { href: '/profissionais', label: 'Profissionais' },
  { href: '/calculadoras', label: 'Calculadoras' },
  { href: '/entrega', label: 'Entrega' },
];

export function Header({ name, descriptor }: { name: string; descriptor: string }) {
  const pathname = usePathname();
  const { lines } = useCart();
  const [menu, setMenu] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const count = lines.length;

  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      menuBtn.current?.focus();
    };
  }, [menu]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-40 bg-graphite-950/95 text-white md:backdrop-blur md:supports-[backdrop-filter]:bg-graphite-950/85">
      <div className="wrap flex h-16 items-center gap-4 lg:gap-8">
        <Link href="/" className="shrink-0 rounded-md" aria-label={`${name}, página inicial`}>
          <Logo name={name} descriptor={descriptor} />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isActive(n.href) ? 'page' : undefined} className={`inline-flex h-10 items-center rounded-md px-3 text-[15px] font-medium transition-colors ${isActive(n.href) ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white'}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden w-full min-w-0 max-w-[380px] md:block">
          <SearchBox placeholder="Buscar material ou código" />
        </div>
        <Link href="/orcamento" className="btn btn-primary btn-sm ml-auto shrink-0 md:ml-0" aria-label={`Minha lista de orçamento, ${count} ${count === 1 ? 'item' : 'itens'}`}>
          <ClipboardList aria-hidden className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Minha lista</span>
          <span className="tabular grid min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-[13px] leading-6" suppressHydrationWarning>
            {count}
          </span>
        </Link>
        <button ref={menuBtn} type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-white lg:hidden" aria-expanded={menu} aria-controls="menu-movel" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenu((m) => !m)}>
          {menu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile: search stays visible under the bar */}
      <div className="wrap pb-3 md:hidden">
        <SearchBox placeholder="Buscar material ou código" />
      </div>
      <div id="menu-movel" hidden={!menu} className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto bg-graphite-950 lg:hidden">
        <div className="wrap flex h-16 items-center justify-between">
          <Logo name={name} compact />
          <button type="button" className="grid h-11 w-11 place-items-center rounded-md" aria-label="Fechar menu" onClick={() => setMenu(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav aria-label="Menu" className="wrap pt-4 pb-10">
          <ul className="grid gap-1">
            {[...NAV, { href: '/orcamento', label: 'Minha lista de orçamento' }, { href: '/enviar-lista', label: 'Enviar lista de materiais' }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setMenu(false)} aria-current={isActive(n.href) ? 'page' : undefined} className="flex min-h-14 items-center border-b border-white/10 text-[22px] font-semibold" style={{ fontFamily: 'var(--font-display)', fontStretch: '110%' }}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
