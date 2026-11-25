'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useScrollProgress } from './use-scroll-progress';

export interface Chapter {
  title: string;
  body: string;
  photo: string;
  href: string;
  cta: string;
  items: string[];
}

/** Experience A: steel, concrete and timber reveal one after another while the section scrolls. */
export function MaterialChapters({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const n = chapters.length;
  const ref = useScrollProgress<HTMLElement>((p) => {
    const seg = p * n;
    panels.current.forEach((el, i) => {
      if (!el) return;
      const reveal = i === 0 ? 1 : Math.min(1, Math.max(0, (seg - i + 0.35) / 0.55));
      el.style.setProperty('--reveal', reveal.toFixed(3));
    });
    const idx = Math.min(n - 1, Math.max(0, Math.floor(seg + 0.15)));
    setActive((a) => (a === idx ? a : idx));
  });

  return (
    <section ref={ref} aria-labelledby="materiais-title" className="relative bg-graphite-950 text-white" style={{ height: `${n * 100 + 20}svh` }}>
      <div className="sticky top-0 grid h-[100svh] overflow-hidden lg:grid-cols-[minmax(360px,0.9fr)_1.4fr]">
        <div className="relative z-10 order-2 flex flex-col justify-end gap-6 bg-graphite-950 px-4 pt-6 pb-24 md:px-8 lg:order-1 lg:justify-center lg:px-12 lg:pb-12">
          <h2 id="materiais-title" className="display text-[clamp(32px,4.4vw,60px)]">
            Material bruto, escolhido peça por peça.
          </h2>
          <div aria-live="polite" className="grid gap-4">
            <h3 className="heading text-[clamp(22px,2.2vw,30px)] text-[var(--color-safety)]">{chapters[active].title}</h3>
            <p className="max-w-[46ch] text-[16px] text-white/80">{chapters[active].body}</p>
            <ul className="flex flex-wrap gap-2">
              {chapters[active].items.map((it) => (
                <li key={it} className="rounded-full bg-white/10 px-3 py-1.5 text-[14px]">
                  {it}
                </li>
              ))}
            </ul>
            <Link href={chapters[active].href} className="btn btn-primary w-fit">
              {chapters[active].cta}
            </Link>
          </div>
          <ol className="flex gap-2" aria-label="Capítulos">
            {chapters.map((c, i) => (
              <li key={c.title} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= active ? 'bg-[var(--color-accent)]' : 'bg-white/15'}`}>
                <span className="sr-only">
                  {c.title}
                  {i === active ? ' (atual)' : ''}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative order-1 min-h-[42svh] lg:order-2" aria-hidden>
          {chapters.map((c, i) => (
            <div key={c.title} ref={(el) => void (panels.current[i] = el)} className="chapter-panel absolute inset-0 overflow-hidden" style={{ ['--reveal' as string]: i === 0 ? 1 : 0 }}>
              <Image src={c.photo} alt="" fill sizes="(min-width:1024px) 62vw, 100vw" quality={70} className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
