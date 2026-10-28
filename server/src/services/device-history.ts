import { compareMessageIds, type IMessageId, type TDeviceMessage } from '@iot/shared';
import type { IDeviceHistory, IDeviceHistoryDeps, IHistoryEntry } from '../types/history';

/**
 * @Description Short per-device history for resume, ordered by (bootId, seq) and bounded by count and age
 * @param deps
 */
export const createDeviceHistory = ({ maxMessagesPerDevice, maxAgeMs, now }: IDeviceHistoryDeps): IDeviceHistory => {
  const entriesByDevice: Record<string, IHistoryEntry[]> = {};

  const findInsertIndex = (entries: IHistoryEntry[], message: TDeviceMessage): number => {
    let index = entries.length;

    // Messages usually arrive almost in order, so walking back from the end is short.
    while (index > 0) {
      const previous = entries[index - 1];

      if (previous === undefined || compareMessageIds(previous.message, message) <= 0) {
        break;
      }

      index -= 1;
    }

    return index;
  };

  const trimEntries = (entries: IHistoryEntry[]) => {
    const oldestAllowedAt = now() - maxAgeMs;

    while (entries.length > maxMessagesPerDevice || (entries[0] !== undefined && entries[0].receivedAt < oldestAllowedAt)) {
      entries.shift();
    }
  };

  const record = (message: TDeviceMessage) => {
    const entries = (entriesByDevice[message.deviceId] ??= []);
    const insertAt = findInsertIndex(entries, message);
    const previous = entries[insertAt - 1];

    if (previous !== undefined && compareMessageIds(previous.message, message) === 0) {
      return;
    }

    entries.splice(insertAt, 0, { message, receivedAt: now() });
    trimEntries(entries);
  };

  const readSince = (deviceId: string, lastSeen: IMessageId): TDeviceMessage[] | null => {
    const entries = entriesByDevice[deviceId] ?? [];

    trimEntries(entries);

    const oldest = entries[0];

    if (oldest === undefined || compareMessageIds(oldest.message, lastSeen) > 0) {
      return null;
    }

    return entries.filter((entry) => compareMessageIds(entry.message, lastSeen) > 0).map((entry) => entry.message);
  };

  return { record, readSince };
};
