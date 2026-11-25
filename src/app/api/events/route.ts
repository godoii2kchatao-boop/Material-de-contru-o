import { NextResponse } from 'next/server';
import { EVENT_TYPES, recordEvent } from '@/lib/events';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import type { EventType } from '@/lib/types';

export async function POST(req: Request) {
  const rl = rateLimit(`ev:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.ok) return new NextResponse(null, { status: 204 });
  try {
    const { type } = (await req.json()) as { type?: string };
    if (type && (EVENT_TYPES as string[]).includes(type)) await recordEvent(type as EventType);
  } catch {
    /* ignore malformed beacons */
  }
  return new NextResponse(null, { status: 204 });
}
