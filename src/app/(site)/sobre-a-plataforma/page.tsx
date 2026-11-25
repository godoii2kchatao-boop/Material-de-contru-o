import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, Calculator, FileUp, LayoutDashboard, Palette, Smartphone, Truck, Search } from 'lucide-react';

export const metadata: Metadata = { title: 'Como a plataforma funciona', description: 'Plataforma digital para lojas de materiais de construção: catálogo, lista de orçamento, envio de listas, frete e painel administrativo.' };

const ITEMS = [
  { icon: Search, t: 'Catálogo com busca', d: 'Busca por nome, código e aplicação, com filtros de categoria, preço e disponibilidade.' },
  { icon: ClipboardList, t: 'Lista de orçamento', d: 'O cliente monta a lista, informa a entrega e envia pelo WhatsApp com número de pedido.' },
  { icon: FileUp, t: 'Envio de listas', d: 'Lista digitada, PDF ou foto da lista escrita à mão, conferida por uma pessoa da loja.' },
  { icon: Calculator, t: 'Calculadoras', d: 'Pisos, tinta, argamassa, revestimento, blocos e volume, com memória de cálculo.' },
  { icon: Truck, t: 'Entrega e frete', d: 'Regiões e tabela de frete cadastradas pela loja; granel e volumoso com cotação.' },
  { icon: LayoutDashboard, t: 'Painel da loja', d: 'Produtos, preços, ofertas, pedidos, regiões, contatos, banners e relatórios.' },
  { icon: Palette, t: 'Marca da loja', d: 'Nome, cores, contatos e políticas trocados por configuração, sem reescrever o site.' },
  { icon: Smartphone, t: 'Feita para o celular', d: 'Busca visível, botões grandes e atalho de WhatsApp para quem está na obra.' },
];

export default function SobrePage() {
  return (
    <div className="wrap py-12 md:py-16">
      <h1 className="display max-w-[18ch] text-[clamp(32px,5vw,62px)]">Uma loja de material de construção que atende pelo site.</h1>
      <p className="mt-4 max-w-[62ch] text-[17px] text-graphite-700">Esta é a demonstração FORTEBASE, criada pela KRB_DIGITAL para depósitos e lojas de Campinas e região. Os pedidos chegam organizados, com itens, quantidades e local de entrega, e o atendimento responde pelo WhatsApp.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((i) => (
          <li key={i.t} className="card grid content-start gap-3 p-6">
            <i.icon className="h-6 w-6 text-[var(--color-accent)]" aria-hidden />
            <h2 className="heading text-[19px]">{i.t}</h2>
            <p className="text-[15px] text-graphite-700">{i.d}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/produtos" className="btn btn-primary">
          Testar o catálogo
        </Link>
        <Link href="/admin" className="btn btn-secondary">
          Ver o painel da loja
        </Link>
      </div>
    </div>
  );
}
