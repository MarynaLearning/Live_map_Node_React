const padTwoDigits = (value: number): string => String(value).padStart(2, '0');

/**
 * @Description Formats a wall-clock time as HH:MM:SS
 * @param timestamp
 */
export const formatClockTime = (timestamp: number): string => {
  const date = new Date(timestamp);

  return `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}:${padTwoDigits(date.getSeconds())}`;
};

/**
 * @Description Formats a duration as seconds with one decimal, e.g. 4.2s
 * @param durationMs
 */
export const formatSeconds = (durationMs: number): string => `${(Math.max(0, durationMs) / 1000).toFixed(1)}s`;
