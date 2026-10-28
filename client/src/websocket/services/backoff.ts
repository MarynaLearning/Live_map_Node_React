import type { IBackoff, IBackoffDeps } from '@/websocket/types';

/**
 * @Description Exponential backoff with equal jitter: half of base × 2ⁿ is fixed, the other half random, capped at maxMs
 * @param deps
 */
export const createBackoff = ({ baseMs, maxMs, random }: IBackoffDeps): IBackoff => {
  let attempt = 0;

  const nextDelayMs = () => {
    const ceilingMs = Math.min(maxMs, baseMs * 2 ** attempt);

    attempt += 1;

    return Math.round(ceilingMs / 2 + random() * (ceilingMs / 2));
  };

  const reset = () => {
    attempt = 0;
  };

  return { nextDelayMs, reset };
};
