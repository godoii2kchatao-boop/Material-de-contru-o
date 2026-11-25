import Image from 'next/image';
import { photo } from '@/lib/photos';
import Link from 'next/link';
import { SearchBox } from '@/components/layout/search-box';
import { HeroSkip } from './hero-skip';

const STRIPS = [
  { src: photo('obra-pilar-armacao'), label: 'Aço' },
  { src: photo('obra-laje-equipe'), label: 'Concreto' },
  { src: photo('obra-galpao-madeira'), label: 'Madeira' },
];

/**
 * Opening sequence, CSS only: three material strips rise (steel, concrete, timber),
 * the lit photograph wipes across, the wordmark settles. ~2.4 s, once per session,
 * skippable, and never in the way: the headline, search and buttons work from the first frame.
 */
export function Hero({ storeName, productCount, categoryCount }: { storeName: string; productCount: number; categoryCount: number }) {
  return (
    <section className="hero relative isolate overflow-hidden bg-graphite-950 text-white" aria-labelledby="hero-title">
      <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('fb-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='done';sessionStorage.setItem('fb-intro','1')}catch(e){}" }} />
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="hero-strips absolute inset-0 grid grid-cols-3">
          {STRIPS.map((s, i) => (
            <div key={s.label} className="hero-strip relative overflow-hidden" style={{ ['--i' as string]: i }}>
              <Image src={s.src} alt="" fill sizes="34vw" quality={60} className="object-cover" />
              <span className="label absolute bottom-8 left-6 text-[clamp(18px,2.4vw,34px)] tracking-[0.04em] text-white/90 uppercase">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="hero-final absolute inset-0">
          <Image src={photo('obra-faiscas')} alt="" fill preload sizes="100vw" quality={72} className="hero-photo object-cover object-[62%_50%]" />
          <div className="hero-beam absolute inset-0" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(14_15_16/0.92)_0%,rgb(14_15_16/0.7)_42%,rgb(14_15_16/0.15)_75%),linear-gradient(0deg,rgb(14_15_16/0.85)_0%,transparent_45%)]" />
        <p className="hero-mark display pointer-events-none absolute right-[-0.04em] bottom-[-0.12em] text-[clamp(72px,16vw,260px)] leading-none text-white/[0.07]">{storeName}</p>
      </div>

      <div className="wrap flex min-h-[calc(100svh-200px)] flex-col justify-end pt-16 pb-24 md:min-h-[calc(100svh-104px)] md:justify-center md:pt-24 md:pb-20">
        <div className="hero-copy max-w-[680px]">
          <h1 id="hero-title" className="display text-[clamp(40px,7vw,88px)]">
            A força da sua obra começa aqui.
          </h1>
          <p className="mt-4 max-w-[52ch] text-[16px] text-white/80 md:mt-5 md:text-[19px]">
            {productCount} materiais em {categoryCount} categorias, da fundação ao acabamento. Monte a lista, peça o orçamento pelo WhatsApp e receba na obra em Campinas e região.
          </p>
          <div className="mt-7 hidden max-w-[560px] md:block">
            <SearchBox size="lg" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/produtos" className="btn btn-primary">
              Explorar materiais
            </Link>
            <Link href="/orcamento" className="btn btn-secondary text-white">
              Solicitar orçamento
            </Link>
          </div>
        </div>
      </div>
      <HeroSkip />
    </section>
  );
}
