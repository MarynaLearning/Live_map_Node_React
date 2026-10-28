import { BASE_RENDER_DELAY_MS, RENDER_DELAY_ADJUST_RATE } from '@/constants/device';

/**
 * @Description Calculates how far in the past the map draws
 * @param maxHz
 */
export const calculateRenderDelay = (maxHz: number | null): number =>
  maxHz === null ? BASE_RENDER_DELAY_MS : BASE_RENDER_DELAY_MS + 1000 / maxHz;

/**
 * @Description Moves the current render delay towards the target at a capped rate, so a maxHz change slows dots down instead of making them jump back in time
 * @param currentMs
 * @param targetMs
 * @param elapsedMs
 */
export const easeRenderDelay = (currentMs: number, targetMs: number, elapsedMs: number): number => {
  const differenceMs = targetMs - currentMs;
  const maxStepMs = Math.max(0, elapsedMs) * RENDER_DELAY_ADJUST_RATE;

  return currentMs + Math.sign(differenceMs) * Math.min(Math.abs(differenceMs), maxStepMs);
};
