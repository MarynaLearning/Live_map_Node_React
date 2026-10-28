import type { ICanvasSize } from '@/features/live-map/types';

/**
 * @Description Matches the canvas backing store to its CSS size × device pixel ratio, to drawing stays sharp
 * @param canvas
 * @param pixelRatio
 */
export const syncCanvasSize = (canvas: HTMLCanvasElement, pixelRatio: number): ICanvasSize => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const backingWidth = Math.round(width * pixelRatio);
  const backingHeight = Math.round(height * pixelRatio);

  if (canvas.width !== backingWidth) {
    canvas.width = backingWidth;
  }

  if (canvas.height !== backingHeight) {
    canvas.height = backingHeight;
  }

  return { width, height, pixelRatio };
};
