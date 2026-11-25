'use client';
import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { cart, useCart } from '@/lib/cart-store';
import { track } from '@/lib/track';

/** Quantity stepper + "add to list". Shows the quantity already in the list. */
export function AddToList({ productId, unit, minQty, compact = false, name }: { productId: string; unit: string; minQty: number; compact?: boolean; name: string }) {
  const { lines } = useCart();
  const inList = lines.find((l) => l.productId === productId);
  const [qty, setQty] = useState(minQty);
  const [done, setDone] = useState(false);
  const step = minQty >= 10 ? minQty : 1;

  const add = () => {
    cart.add(productId, qty);
    track('add_to_list');
    setDone(true);
    window.setTimeout(() => setDone(false), 1400);
  };

  return (
    <div className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-[auto_1fr]'}`}>
      <div className="flex h-11 items-center rounded-[10px] bg-mineral-50 ring-[1.5px] ring-concrete-300" role="group" aria-label={`Quantidade de ${name}`}>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-l-[10px] disabled:opacity-40" aria-label="Diminuir quantidade" disabled={qty <= minQty} onClick={() => setQty((q) => Math.max(minQty, q - step))}>
          <Minus className="h-4 w-4" />
        </button>
        <label className="sr-only" htmlFor={`qty-${productId}${compact ? '-c' : ''}`}>
          Quantidade em {unit}
        </label>
        <input
          id={`qty-${productId}${compact ? '-c' : ''}`}
          inputMode="decimal"
          className="tabular h-full w-14 min-w-0 flex-1 bg-transparent text-center text-[16px] font-semibold outline-none"
          value={qty}
          onChange={(e) => {
            const n = Number(e.target.value.replace(',', '.'));
            if (!Number.isNaN(n)) setQty(n);
          }}
          onBlur={() => setQty((q) => Math.max(minQty, q || minQty))}
        />
        <button type="button" className="grid h-11 w-11 place-items-center rounded-r-[10px]" aria-label="Aumentar quantidade" onClick={() => setQty((q) => q + step)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={add} className="btn btn-primary btn-sm w-full" aria-live="polite">
        {done ? (
          <>
            <Check className="h-4 w-4" aria-hidden /> Adicionado
          </>
        ) : (
          'Adicionar à lista'
        )}
      </button>
      {inList ? (
        <p className="text-[13px] text-text-dim" suppressHydrationWarning>
          Na sua lista: {inList.qty} {unit}
        </p>
      ) : null}
    </div>
  );
}
