'use client';
import { photo } from '@/lib/photos';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollProgress } from './use-scroll-progress';

/** Experience B: the professional drill. The photograph moves with the scroll (zoom + pan), the copy stays still. */
export function ToolSpotlight({ product, children }: { product: { slug: string; name: string }; children: React.ReactNode }) {
  const ref = useScrollProgress<HTMLElement>();
  return (
    <section ref={ref} aria-labelledby="ferramenta-title" className="relative bg-ink text-white" style={{ height: '170svh' }}>
      <div className="sticky top-0 grid h-[100svh] overflow-hidden lg:grid-cols-[1.35fr_1fr]">
        <div className="relative min-h-[46svh] overflow-hidden" aria-hidden>
          <Image
            src={photo('furadeira-concreto')}
            alt=""
            fill
            sizes="(min-width:1024px) 58vw, 100vw"
            quality={72}
            className="object-cover"
            style={{ transform: 'scale(calc(1.28 - var(--p, 0) * 0.28)) translate3d(calc(var(--p, 0) * -3%), calc(var(--p, 0) * 2%), 0)', transformOrigin: '42% 50%' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(15_16_18/0.7),transparent_45%)] lg:bg-[linear-gradient(270deg,rgb(15_16_18/1),transparent_35%)]" />
        </div>
        <div className="flex flex-col justify-center gap-5 px-4 pt-6 pb-24 md:px-8 lg:px-12 lg:pb-8">
          <h2 id="ferramenta-title" className="display text-[clamp(30px,4vw,56px)]">
            Ferramenta de quem vive de obra.
          </h2>
          <p className="max-w-[44ch] text-[16px] text-white/80">Furadeira e parafusadeira a bateria, colher, nível, trena e martelo: o kit que sai da loja direto para a caixa de ferramentas.</p>
          {children}
          <Link href={`/produtos/${product.slug}`} className="link-draw w-fit text-[15px] font-semibold text-[var(--color-safety)]">
            Ver ficha técnica: {product.name}
          </Link>
        </div>
      </div>
    </section>
  );
}
