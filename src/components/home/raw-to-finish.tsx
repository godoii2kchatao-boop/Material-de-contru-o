'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useScrollProgress } from './use-scroll-progress';

export interface Stage {
  title: string;
  body: string;
  photo: string;
  categories: { slug: string; name: string }[];
}

/** Experience C: from structure to the finished room, one stage per scroll step (cross-fade). */
export function RawToFinish({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(0);
  const n = stages.length;
  const ref = useScrollProgress<HTMLElement>((p) => {
    const idx = Math.min(n - 1, Math.floor(p * n * 0.999));
    setActive((a) => (a === idx ? a : idx));
  });
  return (
    <section ref={ref} aria-labelledby="etapas-title" className="relative bg-mineral-50" style={{ height: `${n * 85 + 15}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="relative flex-1" aria-hidden>
          {stages.map((s, i) => (
            <div key={s.title} className="absolute inset-0 transition-opacity duration-700 ease-[var(--ease-in-out)]" style={{ opacity: i === active ? 1 : 0 }}>
              <Image src={s.photo} alt="" fill sizes="100vw" quality={70} className="object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(244_242_238/1)_0%,rgb(244_242_238/0)_38%)]" />
        </div>
        <div className="wrap relative -mt-36 grid gap-5 pb-24 lg:-mt-44 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:pb-12">
          <div>
            <h2 id="etapas-title" className="display text-[clamp(30px,4.2vw,58px)]">
              Do bruto ao acabamento.
            </h2>
            <ol className="mt-5 flex gap-2" aria-label="Etapas da obra">
              {stages.map((s, i) => (
                <li key={s.title} className="flex-1">
                  <span className={`block h-1 rounded-full transition-colors duration-300 ${i <= active ? 'bg-[var(--color-accent)]' : 'bg-concrete-300'}`} />
                  <span className={`label mt-2 block text-[13px] ${i === active ? 'text-ink' : 'text-text-dim'}`}>{s.title}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card grid gap-3 p-5" aria-live="polite">
            <h3 className="heading text-[22px]">{stages[active].title}</h3>
            <p className="text-[15.5px] text-graphite-700">{stages[active].body}</p>
            <ul className="flex flex-wrap gap-2">
              {stages[active].categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categorias/${c.slug}`} className="chip">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
