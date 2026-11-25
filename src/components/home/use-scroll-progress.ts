'use client';
import { useEffect, useRef } from 'react';

/**
 * Writes the section's scroll progress (0 → 1) to the CSS variable --p on the element,
 * once per animation frame, only while the section is near the viewport.
 * Nothing re-renders in React; CSS does the motion with transform, opacity and clip-path.
 */
export function useScrollProgress<T extends HTMLElement>(onProgress?: (p: number) => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let visible = false;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / total));
      el.style.setProperty('--p', p.toFixed(4));
      cb.current?.(p);
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(measure);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    }, { rootMargin: '200px 0px' });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return ref;
}
