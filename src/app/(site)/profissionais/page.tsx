import type { Metadata } from 'next';
import { photo } from '@/lib/photos';
import Image from 'next/image';
import { Suspense } from 'react';
import { BadgeCheck, Boxes, History, Repeat, Truck, Users } from 'lucide-react';
import { QuoteBuilder } from '@/components/forms/quote-builder';
import { getCatalog, getSettings, toCard } from '@/lib/data';
import { tenant } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Para profissionais', description: 'Atendimento para pedreiros, eletricistas, encanadores, pintores, engenheiros e construtoras: listas recorrentes, orçamento por volume e recompra.' };

const FEATURES = [
  { icon: Repeat, title: 'Listas recorrentes', body: 'Salve a lista de cada tipo de serviço e reutilize na próxima obra.' },
  { icon: Boxes, title: 'Orçamento por volume', body: 'Marque a compra como recorrente e informe a obra: o comercial cota pelo volume.' },
  { icon: History, title: 'Recompra e histórico', body: 'Os pedidos enviados deste celular ficam guardados para repetir com um toque.' },
  { icon: Truck, title: 'Solicitação para obras', body: 'Nome da obra, endereço e observações de acesso seguem junto com o pedido.' },
  { icon: Users, title: 'Atendimento comercial', body: 'Construtoras e empresas de manutenção falam com o comercial da loja.' },
  { icon: BadgeCheck, title: 'Condições cadastradas', body: 'Condições especiais valem quando a loja cadastra e confirma no orçamento.' },
];

export default async function ProfissionaisPage() {
  const [{ products }, s] = await Promise.all([getCatalog(), getSettings()]);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-graphite-950 text-white">
        <Image src={photo('engenheiros')} alt="" fill preload sizes="100vw" quality={65} className="-z-10 object-cover opacity-45" />
        <div className="wrap py-20 md:py-32">
          <h1 className="display max-w-[18ch] text-[clamp(34px,5.4vw,70px)]">Para quem compra material toda semana.</h1>
          <p className="mt-4 max-w-[56ch] text-[17px] text-white/85">Pedreiros, eletricistas, encanadores, pintores, mestres de obras, engenheiros, arquitetos, construtoras e manutenção predial.</p>
        </div>
      </section>
      <section aria-labelledby="recursos" className="wrap py-16">
        <h2 id="recursos" className="display text-[clamp(28px,3.6vw,48px)]">
          O que muda no seu dia a dia
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="card grid content-start gap-3 p-6">
              <f.icon className="h-6 w-6 text-[var(--color-accent)]" aria-hidden />
              <h3 className="heading text-[20px]">{f.title}</h3>
              <p className="text-graphite-700">{f.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[70ch] text-[14.5px] text-text-dim">{s.professionalTerms || tenant.policies.professionals}</p>
      </section>
      <section aria-labelledby="pedido-pro" className="bg-concrete-100 py-16">
        <div className="wrap">
          <h2 id="pedido-pro" className="display text-[clamp(28px,3.6vw,48px)]">
            Solicitação para obra
          </h2>
          <p className="mt-3 max-w-[60ch] text-graphite-700">A lista é a mesma do site. Informe sua profissão, a obra e se a compra é recorrente.</p>
          <div className="mt-8">
            <Suspense>
              <QuoteBuilder source="profissional" products={products.map(toCard)} policy={tenant.policies.quote} privacy="Concordo que a loja use meus dados para responder esta solicitação e para o atendimento comercial." />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
