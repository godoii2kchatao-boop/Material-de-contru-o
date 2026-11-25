import 'server-only';
import { updateStore } from './store';
import type { EventType } from './types';

export const EVENT_TYPES: EventType[] = ['view_product', 'add_to_list', 'submit_quote', 'submit_list', 'whatsapp_click', 'freight_check', 'search'];

/** First-party, cookie-free daily counters. No personal data, no third parties. */
export async function recordEvent(type: EventType, n = 1) {
  const today = new Date().toISOString().slice(0, 10);
  await updateStore((d) => {
    let day = d.events.find((e) => e.date === today && !e.sample);
    if (!day) {
      day = { date: today, counts: {} };
      d.events.push(day);
      d.events = d.events.slice(-120);
    }
    day.counts[type] = (day.counts[type] ?? 0) + n;
  });
}
