import type { Metadata } from 'next';
import { photo } from '@/lib/photos';
import Image from 'next/image';
import { FreightChecker } from '@/components/forms/freight-checker';
import { getRegions, getSettings } from '@/lib/data';
import { formatBRL } from '@/lib/format';
import { tenant } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Entrega e frete', description: 'Consulte a entrega de materiais de construção em Campinas, Sumaré, Hortolândia, Valinhos e região.' };

export default async function EntregaPage() {
  const [regions, s] = await Promise.all([getRegions(), getSettings()]);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-graphite-950 text-white">
        <Image src={photo('deposito')} alt="" fill preload sizes="100vw" quality={65} className="-z-10 object-cover opacity-40" />
        <div className="wrap py-20 md:py-28">
          <h1 className="display max-w-[16ch] text-[clamp(34px,5.4vw,68px)]">Material na obra, no dia combinado.</h1>
          <p className="mt-4 max-w-[56ch] text-[17px] text-white/85">Consulte pelo CEP, veja a estimativa da tabela da loja e peça cotação personalizada para material pesado, volumoso ou a granel.</p>
        </div>
      </section>
      <div className="wrap grid gap-10 py-14 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="consulta">
          <h2 id="consulta" className="heading mb-5 text-[26px]">
            Consultar entrega
          </h2>
          <FreightChecker />
        </section>
        <section aria-labelledby="regioes" className="grid content-start gap-4">
          <h2 id="regioes" className="heading text-[26px]">
            Regiões atendidas
          </h2>
          <ul className="grid gap-3">
            {regions.map((r) => (
              <li key={r.id} className="card grid gap-1 p-4">
                <span className="flex items-center justify-between gap-3 font-semibold">
                  {r.name}
                  {!r.active ? <span className="text-[13px] font-medium text-text-dim">Em breve</span> : null}
                </span>
                <span className="tabular text-[14px] text-text-dim">
                  Base {formatBRL(r.baseFeeCents)} · volumoso +{formatBRL(r.bulkyFeeCents)} · {r.leadTime}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-text-dim">{tenant.policies.delivery}</p>
          {s.pickupEnabled ? (
            <p className="text-[15px]">
              Retirada na loja: {s.address.district}, {s.address.city}. {s.hours[0]?.days} das {s.hours[0]?.open} às {s.hours[0]?.close}.
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
