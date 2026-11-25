'use client';
import { useEffect } from 'react';
import { track } from '@/lib/track';
import type { EventType } from '@/lib/types';

export function TrackView({ type }: { type: EventType }) {
  useEffect(() => track(type), [type]);
  return null;
}
