import { CHAOS_SETTING_KEYS } from '../constants/debug';
import type { IChaosSettings } from '../types/chaos';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * @Description Reads { enabled: boolean } from a request body, null when the body is invalid
 * @param body
 */
export const readStressFlag = (body: unknown): boolean | null => {
  if (!isRecord(body) || typeof body.enabled !== 'boolean') {
    return null;
  }

  return body.enabled;
};

/**
 * @Description Picks only known numeric chaos fields from a request body
 * @param body
 */
export const readChaosPatch = (body: unknown): Partial<IChaosSettings> => {
  const patch: Partial<IChaosSettings> = {};

  if (!isRecord(body)) {
    return patch;
  }

  for (const key of CHAOS_SETTING_KEYS) {
    const value = body[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      patch[key] = value;
    }
  }

  return patch;
};
