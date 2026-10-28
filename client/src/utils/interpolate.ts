import type { IPoint, IPositionSample } from '@/types/device';

const findSegmentStart = (track: IPositionSample[], renderTs: number): number => {
  let index = track.length - 2;

  while (index > 0 && (track[index]?.ts ?? -Infinity) > renderTs) {
    index -= 1;
  }

  return index;
};

/**
 * @Description Returns where a device was at renderTs on its own clock: between the two real track points around it. Before the track → first point, after it → last point (never extrapolates). Points further apart than maxGapMs are not connected: the dot holds, then jumps
 * @param track
 * @param renderTs
 * @param maxGapMs
 */
export const samplePositionAt = (track: IPositionSample[], renderTs: number, maxGapMs: number): IPoint => {
  const first = track[0];
  const last = track.at(-1);

  if (first === undefined || last === undefined) {
    return { x: 0, y: 0 };
  }

  if (renderTs <= first.ts) {
    return first;
  }

  if (renderTs >= last.ts) {
    return last;
  }

  const startIndex = findSegmentStart(track, renderTs);
  const from = track[startIndex] ?? first;
  const to = track[startIndex + 1] ?? last;
  const spanMs = to.ts - from.ts;

  if (spanMs <= 0 || spanMs > maxGapMs) {
    return from;
  }

  const progress = (renderTs - from.ts) / spanMs;

  return { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
};
