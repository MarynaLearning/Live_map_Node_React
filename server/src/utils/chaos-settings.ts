import type { IChaosSettings } from '../types/chaos';
import { clamp } from './math';

/**
 * @Description Applies a partial chaos update and keeps values valid (probabilities 0..1, delays ≥ 0, min ≤ max)
 * @param current
 * @param patch
 */
export const mergeChaosSettings = (current: IChaosSettings, patch: Partial<IChaosSettings>): IChaosSettings => {
  const merged = { ...current, ...patch };
  const minDelayMs = Math.max(0, merged.minDelayMs);

  return {
    delayProbability: clamp(merged.delayProbability, 0, 1),
    duplicateProbability: clamp(merged.duplicateProbability, 0, 1),
    minDelayMs,
    maxDelayMs: Math.max(minDelayMs, merged.maxDelayMs),
  };
};
