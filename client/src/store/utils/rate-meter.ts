import { RATE_WINDOW_MS } from '@/store/constants';
import type { IRateMeter } from '@/store/types';

const recalculateRate = (meter: IRateMeter, now: number): void => {
  const elapsedMs = now - meter.windowStartedAt;

  if (elapsedMs < RATE_WINDOW_MS) {
    return;
  }

  meter.rate = Math.round((meter.count * 1000) / elapsedMs);
  meter.count = 0;
  meter.windowStartedAt = now;
};

/**
 * @Description Creates a per-second rate meter that recalculates once per window
 * @param startedAt
 */
export const createRateMeter = (startedAt: number): IRateMeter => ({ count: 0, windowStartedAt: startedAt, rate: 0 });

/**
 * @Description Counts one occurrence (message, frame…)
 * @param meter
 * @param now
 */
export const countRateEvent = (meter: IRateMeter, now: number): void => {
  recalculateRate(meter, now);
  meter.count += 1;
};

/**
 * @Description Returns the rate per second measured over the last full window
 * @param meter
 * @param now
 */
export const readRate = (meter: IRateMeter, now: number): number => {
  recalculateRate(meter, now);

  return meter.rate;
};
