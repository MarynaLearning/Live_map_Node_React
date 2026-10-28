/**
 * @Description Rounds a number to the given count of decimals
 * @param value
 * @param decimals
 */
export const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

/**
 * @Description Limits a number to the [min, max] range
 * @param value
 * @param min
 * @param max
 */
export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
