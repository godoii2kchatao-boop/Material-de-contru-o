import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isDemo } from './tenant';

export type Role = 'admin' | 'demo';
export interface Session {
  sub: string;
  role: Role;
  exp: number;
}

export const SESSION_COOKIE = 'fb_admin';
const SESSION_HOURS = 8;

// ---------- passwords (scrypt) ----------
const N = 16384,
  R = 8,
  P = 1,
  KEYLEN = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64url');
  const got = crypto.scryptSync(password, Buffer.from(saltB64, 'base64url'), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  return expected.length === got.length && crypto.timingSafeEqual(expected, got);
}

// ---------- accounts ----------
export const DEMO_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? 'demo@fortebase.example';
export const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? 'fortebase-demo';
let demoHash: string | null = null;

interface Account {
  email: string;
  hash: string;
  role: Role;
}

function accounts(): Account[] {
  const list: Account[] = [];
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (email && hash) list.push({ email, hash, role: 'admin' });
  if (isDemo) {
    demoHash ??= hashPassword(DEMO_PASSWORD);
    list.push({ email: DEMO_EMAIL.toLowerCase(), hash: demoHash, role: 'demo' });
  }
  return list;
}

export function loginAvailable() {
  return accounts().length > 0;
}

/** Always runs one scrypt, so response time does not reveal whether the e-mail exists. */
export function authenticate(email: string, password: string): Account | null {
  const acc = accounts().find((a) => a.email === email.trim().toLowerCase());
  const ok = verifyPassword(password, acc?.hash ?? hashPasswordDummy);
  return acc && ok ? acc : null;
}
const hashPasswordDummy = `scrypt$${N}$${R}$${P}$${Buffer.alloc(16).toString('base64url')}$${Buffer.alloc(64).toString('base64url')}`;

// ---------- sessions (HMAC-signed cookie) ----------
let devSecret: string | null = null;
function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production' && !isDemo) throw new Error('SESSION_SECRET (32+ caracteres) é obrigatório em produção.');
  devSecret ??= crypto.randomBytes(32).toString('hex');
  return devSecret;
}

function sign(data: string) {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

export function encodeSession(s: Session) {
  const body = Buffer.from(JSON.stringify(s)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined | null): Session | null {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = sign(body);
  const a = Buffer.from(mac),
    b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session;
    if (typeof s.exp !== 'number' || s.exp < Date.now()) return null;
    if (s.role !== 'admin' && s.role !== 'demo') return null;
    return s;
  } catch {
    return null;
  }
}

export async function createSession(acc: { email: string; role: Role }) {
  const jar = await cookies();
  const s: Session = { sub: acc.email, role: acc.role, exp: Date.now() + SESSION_HOURS * 3600 * 1000 };
  jar.set(SESSION_COOKIE, encodeSession(s), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

/** Server-side authorization for every admin page and action. */
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  return s;
}

/** Visitor data is masked for the public demo account (anyone can read its password). */
export function maskForRole<T extends { name: string; phone: string; email: string | null }>(c: T, role: Role, seed?: boolean): T {
  if (role === 'admin' || seed) return c;
  const initials = c.name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w[0]}.`)
    .join(' ');
  const digits = c.phone.replace(/\D/g, '');
  return { ...c, name: initials || 'Visitante', phone: digits ? `(${digits.slice(0, 2)}) •••••-${digits.slice(-2)}` : '•••', email: c.email ? '•••@•••' : null };
}
