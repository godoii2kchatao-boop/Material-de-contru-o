'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

/** Experience D: before/after comparator. Drag, tap, or use the arrow keys on the slider. */
export function CompareSlider({ before, after, beforeLabel, afterLabel }: { before: string; after: string; beforeLabel: string; afterLabel: string }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fromPointer = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="relative aspect-[4/5] touch-pan-y overflow-hidden rounded-[14px] select-none sm:aspect-[16/10]"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <Image src={after} alt={afterLabel} fill sizes="(min-width:1024px) 60vw, 100vw" quality={70} className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeLabel} fill sizes="(min-width:1024px) 60vw, 100vw" quality={70} className="object-cover" />
      </div>
      <span className="label absolute top-3 left-3 rounded-md bg-graphite-950/80 px-2.5 py-1 text-[13px] text-white">Em obra</span>
      <span className="label absolute top-3 right-3 rounded-md bg-white/90 px-2.5 py-1 text-[13px] text-ink">Acabado</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-float)]"><MoveHorizontal aria-hidden className="h-5 w-5" /></span>
      </div>
      <label className="sr-only" htmlFor="compare-range">
        Comparar ambiente em obra e acabado
      </label>
      <input id="compare-range" type="range" min={0} max={100} value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))} className="absolute inset-x-0 bottom-0 h-11 w-full cursor-ew-resize opacity-0 focus-visible:opacity-100" />
    </div>
  );
}
