import { compareMessageIds, type IStateMessage } from '@iot/shared';
import type { IStateThrottle, IStateThrottleDeps } from '../types/session';

/**
 * @Description Per-client state limiter: keeps only the latest state per device and sends at most maxHz per device. Without a limit, states go out at once unless the client is slow
 * @param deps
 */
export const createStateThrottle = ({ flushStates, unlimitedFlushIntervalMs }: IStateThrottleDeps): IStateThrottle => {
  let pendingStates: Record<string, IStateMessage> = {};
  let currentMaxHz: number | null = null;
  let coalescedCount = 0;
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  const keepLatestPending = (message: IStateMessage) => {
    const pending = pendingStates[message.deviceId];

    if (pending !== undefined) {
      coalescedCount += 1;
    }

    if (pending === undefined || compareMessageIds(message, pending) > 0) {
      pendingStates[message.deviceId] = message;
    }
  };

  const flushPending = () => {
    if (flushStates(Object.values(pendingStates))) {
      pendingStates = {};
    }
  };

  const stopFlushTimer = () => {
    if (flushTimer === null) {
      return;
    }

    clearInterval(flushTimer);
    flushTimer = null;
  };

  const startFlushTimer = () => {
    stopFlushTimer();

    const intervalMs = currentMaxHz === null ? unlimitedFlushIntervalMs : 1000 / currentMaxHz;

    flushTimer = setInterval(flushPending, intervalMs);
  };

  const offer = (message: IStateMessage) => {
    const hasPending = Object.keys(pendingStates).length > 0;

    if (currentMaxHz === null && !hasPending && flushStates([message])) {
      return;
    }

    keepLatestPending(message);
  };

  const setMaxHz = (maxHz: number | null) => {
    currentMaxHz = maxHz;
    startFlushTimer();
  };

  const keepOnly = (isWanted: (deviceId: string) => boolean) => {
    pendingStates = Object.fromEntries(Object.entries(pendingStates).filter(([deviceId]) => isWanted(deviceId)));
  };

  const getCoalescedCount = () => coalescedCount;

  const dispose = () => {
    stopFlushTimer();
    pendingStates = {};
  };

  startFlushTimer();

  return { offer, setMaxHz, keepOnly, getCoalescedCount, dispose };
};
