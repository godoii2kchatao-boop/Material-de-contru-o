import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { StoreData } from '../types';
import { TENANT_ID, catalogSeed } from '../tenant';
import { buildSeed } from './seed';

/**
 * File-backed store: one JSON document per tenant, written atomically (temp file + rename)
 * through a single in-process queue. Good for the demo and for a single-server install.
 * For multi-instance hosting, implement the same three functions over a database
 * (see docs/ARQUITETURA.md and supabase/schema.sql).
 */
const defaultDir = process.env.VERCEL ? path.join(/*turbopackIgnore: true*/ '/tmp', 'fortebase-data', TENANT_ID) : path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', TENANT_ID);
export const DATA_DIR = process.env.DATA_DIR ? path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR) : defaultDir;
export const UPLOAD_DIR = path.join(/*turbopackIgnore: true*/ DATA_DIR, 'uploads');
const FILE = path.join(/*turbopackIgnore: true*/ DATA_DIR, 'store.json');

let cache: { data: StoreData; mtime: number } | null = null;

export const STORE_VERSION = 7;

/** v2–v7: products gain photos and credits from the tenant catalogue (only where the store has none). */
function migrate(data: StoreData) {
  const byId = new Map(catalogSeed.products.map((p) => [p.id, p]));
  for (const p of data.products) {
    const seed = byId.get(p.id);
    if (seed && !p.image && seed.image) {
      p.image = seed.image;
      p.imageAlt = seed.imageAlt ?? null;
      p.imageCredit = seed.imageCredit ?? null;
    }
  }
  data.version = STORE_VERSION;
}
let queue: Promise<unknown> = Promise.resolve();

async function ensureDirs() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function writeAtomic(data: StoreData) {
  await ensureDirs();
  const tmp = `${FILE}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data), 'utf8');
  await fs.rename(tmp, FILE);
  const st = await fs.stat(FILE);
  cache = { data, mtime: st.mtimeMs };
}

async function load(): Promise<StoreData> {
  try {
    const st = await fs.stat(FILE);
    if (cache && cache.mtime === st.mtimeMs) return cache.data;
    const data = JSON.parse(await fs.readFile(FILE, 'utf8')) as StoreData;
    if ((data.version ?? 1) < STORE_VERSION) {
      migrate(data);
      await writeAtomic(data);
      return data;
    }
    cache = { data, mtime: st.mtimeMs };
    return data;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    const seed = buildSeed();
    await writeAtomic(seed);
    return seed;
  }
}

/** Read the current store. Callers must treat the result as read-only. */
export function readStore(): Promise<StoreData> {
  return queue.then(load, load);
}

/** Apply a mutation and persist it. Mutations run one at a time. */
export function updateStore<T>(mutate: (data: StoreData) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const current = await load();
    const draft: StoreData = structuredClone(current);
    const result = await mutate(draft);
    await writeAtomic(draft);
    return result;
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

/** Restore the demo seed (admin action, demo mode). Uploaded files are removed too. */
export async function resetStore() {
  return updateStore(async (d) => {
    const seed = buildSeed();
    Object.assign(d, seed);
    await fs.rm(UPLOAD_DIR, { recursive: true, force: true });
    await ensureDirs();
  });
}

export function nextCode(d: StoreData, prefix = 'FB') {
  d.sequence += 1;
  const now = new Date();
  const ym = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${ym}-${String(d.sequence).padStart(4, '0')}`;
}
