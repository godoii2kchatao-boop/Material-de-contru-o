import type { Metadata } from 'next';
import { Suspense } from 'react';
import { QuoteBuilder } from '@/components/forms/quote-builder';
import { getCatalog, toCard } from '@/lib/data';
import { tenant } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Minha lista de orçamento', robots: { index: false } };

export default async function OrcamentoPage() {
  const { products } = await getCatalog();
  return (
    <div className="wrap py-10 md:py-14">
      <h1 className="display text-[clamp(32px,5vw,60px)]">Minha lista de orçamento</h1>
      <p className="mt-3 max-w-[62ch] text-[16.5px] text-graphite-700">Revise as quantidades, informe onde entregar e envie. Você recebe o número do pedido e a mensagem pronta para o WhatsApp da loja.</p>
      <div className="mt-8">
        <Suspense>
          <QuoteBuilder products={products.map(toCard)} policy={tenant.policies.quote} privacy="Concordo que a loja use meu nome, telefone e endereço para responder esta solicitação e combinar a entrega." />
        </Suspense>
      </div>
    </div>
  );
}
