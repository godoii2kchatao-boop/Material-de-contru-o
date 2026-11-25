'use client';
import { useEffect, useState } from 'react';

export function HeroSkip() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (document.documentElement.dataset.intro === 'done') return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 2600);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.intro = 'done';
        setShow(false);
      }}
      className="btn btn-quiet btn-sm absolute top-4 right-4 text-white md:top-6 md:right-8"
    >
      Pular abertura
    </button>
  );
}
