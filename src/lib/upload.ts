/** File validation by magic bytes, not by the browser-supplied type or extension. */
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif';

export type Sniffed = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic';

export function sniff(bytes: Uint8Array): Sniffed | null {
  const b = bytes;
  const ascii = (start: number, len: number) => String.fromCharCode(...b.slice(start, start + len));
  if (b.length >= 5 && ascii(0, 5) === '%PDF-') return 'application/pdf';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && ascii(1, 3) === 'PNG' && b[4] === 0x0d && b[5] === 0x0a) return 'image/png';
  if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp';
  if (b.length >= 12 && ascii(4, 4) === 'ftyp' && ['heic', 'heix', 'mif1', 'msf1', 'heif'].includes(ascii(8, 4))) return 'image/heic';
  return null;
}

export const EXT: Record<Sniffed, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/** Keep a readable, harmless display name. */
export function safeName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? 'arquivo';
  return base.replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 80) || 'arquivo';
}

export interface FileCheck {
  ok: boolean;
  error?: string;
  type?: Sniffed;
}

export function checkFile(name: string, size: number, head: Uint8Array): FileCheck {
  if (size === 0) return { ok: false, error: `${safeName(name)}: arquivo vazio.` };
  if (size > MAX_FILE_BYTES) return { ok: false, error: `${safeName(name)}: maior que 8 MB.` };
  const type = sniff(head);
  if (!type) return { ok: false, error: `${safeName(name)}: formato não aceito. Envie PDF, JPG, PNG, WEBP ou HEIC.` };
  return { ok: true, type };
}
