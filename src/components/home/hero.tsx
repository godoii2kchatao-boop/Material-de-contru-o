import Image from 'next/image';
import { photo } from '@/lib/photos';
import Link from 'next/link';
import { ArrowRight, FileUp } from 'lucide-react';
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
            <span className="sm:hidden">{productCount} materiais, orçamento pelo WhatsApp e entrega na obra em Campinas e região.</span>
            <span className="hidden sm:inline">
              {productCount} materiais em {categoryCount} categorias, da fundação ao acabamento. Monte a lista, peça o orçamento pelo WhatsApp e receba na obra em Campinas e região.
            </span>
          </p>
          <div className="mt-7 hidden max-w-[560px] md:block">
            <SearchBox size="lg" />
          </div>
          {/* Two jobs, two paths: build the list in the catalogue, or send the list you already have. */}
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap md:mt-5">
            <Link href="/produtos" className="btn btn-primary w-full sm:w-auto">
              Explorar materiais
            </Link>
            <Link href="/orcamento" className="btn btn-secondary w-full text-white sm:w-auto" aria-describedby="hero-orcamento-desc">
              Solicitar orçamento
            </Link>
            <span id="hero-orcamento-desc" className="sr-only">
              Abre a lista de orçamento montada no catálogo
            </span>
          </div>
          <Link href="/enviar-lista" className="hero-list-link group mt-3 flex min-h-[64px] w-full items-center gap-3 rounded-[12px] bg-white/[0.08] px-4 py-3 ring-1 ring-white/20 backdrop-blur-[2px] transition-colors hover:bg-white/[0.13] sm:max-w-[460px]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[var(--color-accent)]">
              <FileUp className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] leading-tight font-semibold">Já tenho minha lista</span>
              <span className="block text-[14px] leading-snug text-white/75">Envie uma foto, um PDF ou digite sua lista.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
      <HeroSkip />
    </section>
  );
}
