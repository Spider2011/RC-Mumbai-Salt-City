'use client';

import { useEffect, useState } from 'react';
import { getEventStatus } from '@/lib/events';
import type { Event as ClubEvent, EventStatus } from '@/types';

/**
 * Live event status, recomputed on mount and every minute.
 *
 * `initial` is the server-computed status used for the first render so the
 * hydrated HTML matches; the real current-time value takes over immediately
 * after mount and keeps ticking (so a card flips upcoming → ongoing → past on
 * its own without a redeploy).
 */
export function useEventStatus(event: ClubEvent, initial: EventStatus): EventStatus {
  const [status, setStatus] = useState<EventStatus>(initial);

  useEffect(() => {
    const tick = () => setStatus(getEventStatus(event));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [event]);

  return status;
}
