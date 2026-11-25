'use client';
import type { EventType } from './types';

/** Cookie-free counter beacon (no identifiers are sent). */
export function track(type: EventType) {
  try {
    const body = JSON.stringify({ type });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
    else void fetch('/api/events', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch {
    /* ignore */
  }
}
