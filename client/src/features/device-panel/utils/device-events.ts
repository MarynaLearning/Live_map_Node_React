import type { IStoredEvent } from '@/store';
import { formatClockTime } from '@/utils/format';
import {
  DEVICE_PANEL_TEXT,
  EVENT_KIND_LABELS,
  MAX_LISTED_EVENTS,
  NEW_EVENT_HIGHLIGHT_MS,
} from '@/features/device-panel/constants';
import type { IDeviceEvents } from '@/features/device-panel/types';

/**
 * @Description Builds the event list of one device: title with the count and rows newest first, recent ones marked as new
 * @param events
 * @param now client clock
 */
export const buildDeviceEvents = (events: IStoredEvent[], now: number): IDeviceEvents => ({
  title: `${DEVICE_PANEL_TEXT.EVENTS_TITLE} (${events.length})`,
  rows: events.slice(0, MAX_LISTED_EVENTS).map(({ message, receivedAt }) => ({
    key: `${message.bootId}:${message.seq}`,
    kind: message.payload.kind,
    timeText: formatClockTime(message.ts),
    kindLabel: EVENT_KIND_LABELS[message.payload.kind],
    message: message.payload.message,
    metaText: `${DEVICE_PANEL_TEXT.EVENT_META_BOOT} ${message.bootId} #${message.seq}`,
    isNew: now - receivedAt < NEW_EVENT_HIGHLIGHT_MS,
  })),
});
