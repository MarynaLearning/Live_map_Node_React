import { DEBUG_TEXT, HZ_SLIDER } from '@/features/debug-controls/constants';

/**
 * @Description Converts maxHz to a slider position; no limit (null) is the last position
 * @param maxHz
 */
export const convertMaxHzToPosition = (maxHz: number | null): number => (maxHz === null ? HZ_SLIDER.UNLIMITED_POSITION : maxHz);

/**
 * @Description Converts a slider position to maxHz; the last position means no limit (null)
 * @param position
 */
export const convertPositionToMaxHz = (position: number): number | null => (position >= HZ_SLIDER.UNLIMITED_POSITION ? null : position);

/**
 * @Description Formats maxHz for the slider label, e.g. "10 Hz" or "No limit"
 * @param maxHz
 */
export const formatMaxHz = (maxHz: number | null): string => (maxHz === null ? DEBUG_TEXT.HZ_UNLIMITED : `${maxHz} ${DEBUG_TEXT.HZ_UNIT}`);

/**
 * @Description Builds the info line about how far behind live the map is drawn
 * @param maxHz
 * @param renderDelayMs
 */
export const formatRenderDelayInfo = (maxHz: number | null, renderDelayMs: number): string => {
  const suffix = maxHz === null ? DEBUG_TEXT.DELAY_SUFFIX_UNLIMITED : DEBUG_TEXT.DELAY_SUFFIX_LIMITED;

  return `${DEBUG_TEXT.DELAY_PREFIX} ${(renderDelayMs / 1000).toFixed(2)} s ${suffix} ${DEBUG_TEXT.DELAY_STATUS_NOTE}`;
};
