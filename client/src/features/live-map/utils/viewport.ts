import { WORLD_SIZE } from '@iot/shared';
import type { IPoint } from '@/types/device';
import { MAP_PADDING_PX } from '@/features/live-map/constants';
import type { ICanvasSize, IViewport } from '@/features/live-map/types';

/**
 * @Description Fits the square device world into the canvas, centred, with padding
 * @param size
 */
export const computeViewport = ({ width, height }: ICanvasSize): IViewport => {
  const sizePx = Math.max(0, Math.min(width, height) - MAP_PADDING_PX * 2);

  return {
    scale: sizePx / WORLD_SIZE,
    offsetX: (width - sizePx) / 2,
    offsetY: (height - sizePx) / 2,
    sizePx,
  };
};

/**
 * @Description Converts a world position to canvas CSS pixels
 * @param point
 * @param viewport
 */
export const projectToScreen = (point: IPoint, viewport: IViewport): IPoint => ({
  x: viewport.offsetX + point.x * viewport.scale,
  y: viewport.offsetY + point.y * viewport.scale,
});
