'use client';
import Link from 'next/link';
import { ClipboardList, MessageCircle, Search } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { whatsappLink } from '@/lib/quote-message';
import { track } from '@/lib/track';

/** Bottom action bar on phones: search, list, WhatsApp. */
export function MobileBar({ whatsapp, storeName }: { whatsapp: string | null; storeName: string }) {
  const { lines } = useCart();
  return (
    <nav aria-label="Atalhos" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-graphite-950/95 pb-[env(safe-area-inset-bottom)] text-white backdrop-blur lg:hidden">
      <ul className="grid grid-cols-3">
        <li>
          <Link href="/produtos" className="flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold">
            <Search className="h-5 w-5" aria-hidden />
            Buscar
          </Link>
        </li>
        <li>
          <Link href="/orcamento" className="flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold">
            <span className="relative">
              <ClipboardList className="h-5 w-5" aria-hidden />
              {lines.length ? <span className="tabular absolute -top-2 -right-3 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[11px]">{lines.length}</span> : null}
            </span>
            Minha lista
          </Link>
        </li>
        <li>
          <a href={whatsappLink(whatsapp, `Olá, ${storeName}! Gostaria de atendimento.`)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click')} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold">
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}
