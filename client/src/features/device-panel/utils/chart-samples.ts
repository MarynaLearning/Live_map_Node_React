import type { Point } from 'chart.js';
import type { ISensorSample } from '@/store';

/**
 * @Description Converts sensor samples into chart points, inserting a NaN point where samples are too far apart so the line breaks at the gap
 * @param samples ordered by device time
 * @param gapMs
 */
export const buildChartPoints = (samples: ISensorSample[], gapMs: number): Point[] => {
  const points: Point[] = [];
  let previousTs: number | null = null;

  for (const sample of samples) {
    if (previousTs !== null && sample.ts - previousTs > gapMs) {
      points.push({ x: previousTs + 1, y: Number.NaN });
    }

    points.push({ x: sample.ts, y: sample.value });
    previousTs = sample.ts;
  }

  return points;
};
