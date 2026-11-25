'use client';
/**
 * Quote list ("lista de orçamento") kept on the visitor's device.
 * Persistent (localStorage), synced across tabs, with named saved lists,
 * a local history of submitted requests and a shareable link format.
 */
import { useSyncExternalStore } from 'react';

export interface CartLine {
  productId: string;
  qty: number;
}
export interface SavedList {
  id: string;
  name: string;
  lines: CartLine[];
  savedAt: string;
}
export interface SentQuote {
  code: string;
  sentAt: string;
  lines: CartLine[];
  itemCount: number;
}
interface State {
  lines: CartLine[];
  saved: SavedList[];
  history: SentQuote[];
}

const KEY = 'fortebase:lista:v1';
const empty: State = { lines: [], saved: [], history: [] };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const s = JSON.parse(raw) as Partial<State>;
    return {
      lines: Array.isArray(s.lines) ? s.lines.filter((l) => typeof l.productId === 'string' && l.qty > 0) : [],
      saved: Array.isArray(s.saved) ? s.saved : [],
      history: Array.isArray(s.history) ? s.history : [],
    };
  } catch {
    return empty;
  }
}

function ensure() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  state = read();
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = read();
      emit();
    }
  });
}

function emit() {
  for (const l of listeners) l();
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or quota: keep in memory */
  }
  emit();
}

function subscribe(cb: () => void) {
  ensure();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => {
  ensure();
  return state;
};
const getServerSnapshot = () => empty;

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const cart = {
  add(productId: string, qty: number) {
    ensure();
    const lines = [...state.lines];
    const i = lines.findIndex((l) => l.productId === productId);
    if (i >= 0) lines[i] = { productId, qty: round(lines[i].qty + qty) };
    else lines.push({ productId, qty: round(qty) });
    commit({ ...state, lines });
  },
  set(productId: string, qty: number) {
    ensure();
    const lines = qty > 0 ? state.lines.map((l) => (l.productId === productId ? { productId, qty: round(qty) } : l)) : state.lines.filter((l) => l.productId !== productId);
    commit({ ...state, lines });
  },
  remove(productId: string) {
    ensure();
    commit({ ...state, lines: state.lines.filter((l) => l.productId !== productId) });
  },
  clear() {
    ensure();
    commit({ ...state, lines: [] });
  },
  replace(lines: CartLine[]) {
    ensure();
    commit({ ...state, lines });
  },
  merge(lines: CartLine[]) {
    for (const l of lines) cart.add(l.productId, l.qty);
  },
  save(name: string) {
    ensure();
    const list: SavedList = { id: Math.random().toString(36).slice(2, 10), name: name.trim() || 'Minha lista', lines: state.lines, savedAt: new Date().toISOString() };
    commit({ ...state, saved: [list, ...state.saved].slice(0, 12) });
    return list;
  },
  deleteSaved(id: string) {
    ensure();
    commit({ ...state, saved: state.saved.filter((s) => s.id !== id) });
  },
  recordSent(code: string) {
    ensure();
    const entry: SentQuote = { code, sentAt: new Date().toISOString(), lines: state.lines, itemCount: state.lines.length };
    commit({ ...state, history: [entry, ...state.history].slice(0, 20) });
  },
};

function round(n: number) {
  return Math.round(n * 100) / 100;
}

/** Shareable format: ?lista=fb-cim-001:20,fb-are-001:3 */
export function encodeList(lines: CartLine[]) {
  return lines.map((l) => `${l.productId}:${l.qty}`).join(',');
}
export function decodeList(s: string | null | undefined): CartLine[] {
  if (!s) return [];
  return s
    .split(',')
    .map((part) => {
      const [id, q] = part.split(':');
      const qty = Number(q);
      return /^[a-z0-9-]{3,40}$/.test(id ?? '') && qty > 0 && qty < 100000 ? { productId: id, qty } : null;
    })
    .filter((x): x is CartLine => !!x)
    .slice(0, 120);
}
