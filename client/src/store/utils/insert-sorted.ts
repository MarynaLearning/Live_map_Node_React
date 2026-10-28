import { compareMessageIds } from '@iot/shared';
import type { IStoredEvent } from '@/store/types';

/**
 * @Description Returns a new list with the event inserted newest-first by (bootId, seq), trimmed to limit.
 * @param events
 * @param event
 * @param limit
 */
export const insertEventSorted = (events: IStoredEvent[], event: IStoredEvent, limit: number): IStoredEvent[] => {
  const insertAt = events.findIndex((item) => compareMessageIds(event.message, item.message) > 0);
  const nextEvents = insertAt === -1 ? [...events, event] : [...events.slice(0, insertAt), event, ...events.slice(insertAt)];

  return nextEvents.slice(0, limit);
};
