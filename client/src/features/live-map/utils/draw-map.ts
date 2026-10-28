import { WORLD_SIZE } from '@iot/shared';
import { DEVICE_STATUS_COLORS } from '@/constants/device';
import { DeviceStatus } from '@/types/device';
import {
  DEVICE_RADIUS_PX,
  DOT_ALPHA_BY_STATUS,
  GRID_STEP_WORLD,
  HOVER_RING_RADIUS_PX,
  LABEL_OFFSET_X_PX,
  MAP_COLORS,
  MAP_FONTS,
  PULSE_MAX_RADIUS_PX,
  SELECTED_RING_RADIUS_PX,
  STALE_DASH_PATTERN,
} from '@/features/live-map/constants';
import type { IDeviceView, IMapScene, IViewport } from '@/features/live-map/types';

const drawWorld = (context: CanvasRenderingContext2D, viewport: IViewport): void => {
  const { offsetX, offsetY, sizePx, scale } = viewport;

  context.fillStyle = MAP_COLORS.WORLD;
  context.fillRect(offsetX, offsetY, sizePx, sizePx);
  context.strokeStyle = MAP_COLORS.GRID;
  context.lineWidth = 1;
  context.beginPath();

  for (let world = GRID_STEP_WORLD; world < WORLD_SIZE; world += GRID_STEP_WORLD) {
    const offset = Math.round(world * scale) + 0.5;

    context.moveTo(offsetX + offset, offsetY);
    context.lineTo(offsetX + offset, offsetY + sizePx);
    context.moveTo(offsetX, offsetY + offset);
    context.lineTo(offsetX + sizePx, offsetY + offset);
  }

  context.stroke();
  context.strokeStyle = MAP_COLORS.WORLD_BORDER;
  context.strokeRect(offsetX + 0.5, offsetY + 0.5, sizePx - 1, sizePx - 1);
};

const drawCircle = (context: CanvasRenderingContext2D, x: number, y: number, radius: number): void => {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
};

const drawPulse = (context: CanvasRenderingContext2D, device: IDeviceView, color: string): void => {
  if (device.pulseProgress === null) {
    return;
  }

  context.globalAlpha = 1 - device.pulseProgress;
  context.strokeStyle = color;
  context.lineWidth = 2;
  drawCircle(context, device.x, device.y, DEVICE_RADIUS_PX + (PULSE_MAX_RADIUS_PX - DEVICE_RADIUS_PX) * device.pulseProgress);
  context.stroke();
  context.globalAlpha = 1;
};

const drawDot = (context: CanvasRenderingContext2D, device: IDeviceView, color: string): void => {
  drawCircle(context, device.x, device.y, DEVICE_RADIUS_PX);

  if (device.status === DeviceStatus.OFFLINE) {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();

    return;
  }

  context.globalAlpha = DOT_ALPHA_BY_STATUS[device.status];
  context.fillStyle = color;
  context.fill();
  context.globalAlpha = 1;

  if (device.status === DeviceStatus.STALE) {
    context.setLineDash(STALE_DASH_PATTERN);
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    drawCircle(context, device.x, device.y, DEVICE_RADIUS_PX + 3);
    context.stroke();
    context.setLineDash([]);
  }
};

const drawSelection = (context: CanvasRenderingContext2D, device: IDeviceView): void => {
  if (!device.isSelected) {
    return;
  }

  context.strokeStyle = MAP_COLORS.SELECTED_RING;
  context.lineWidth = 2;
  drawCircle(context, device.x, device.y, SELECTED_RING_RADIUS_PX);
  context.stroke();
};

const drawHover = (context: CanvasRenderingContext2D, device: IDeviceView): void => {
  if (!device.isHovered || device.isSelected) {
    return;
  }

  context.strokeStyle = MAP_COLORS.HOVER_RING;
  context.lineWidth = 2;
  drawCircle(context, device.x, device.y, HOVER_RING_RADIUS_PX);
  context.stroke();
};

const drawLabels = (context: CanvasRenderingContext2D, device: IDeviceView): void => {
  const labelX = device.x + LABEL_OFFSET_X_PX + (device.isSelected ? 4 : 0);

  context.textBaseline = 'middle';
  context.font = MAP_FONTS.LABEL;
  context.fillStyle = MAP_COLORS.LABEL;
  context.fillText(device.label, labelX, device.y);

  if (device.caption === null) {
    return;
  }

  context.font = MAP_FONTS.CAPTION;
  context.fillStyle = MAP_COLORS.CAPTION;
  context.fillText(device.caption, labelX, device.y + 14);
};

const drawDevice = (context: CanvasRenderingContext2D, device: IDeviceView): void => {
  const color = DEVICE_STATUS_COLORS[device.status];

  drawPulse(context, device, color);
  drawDot(context, device, color);
  drawSelection(context, device);
  drawHover(context, device);
  drawLabels(context, device);
};

/**
 * @Description Draws one map frame: world grid, every device by status, and a dim layer while the connection is down
 * @param context
 * @param scene
 */
export const drawMap = (context: CanvasRenderingContext2D, scene: IMapScene): void => {
  const { size, viewport, devices, isConnectionOpen } = scene;

  context.setTransform(size.pixelRatio, 0, 0, size.pixelRatio, 0, 0);
  context.fillStyle = MAP_COLORS.BACKGROUND;
  context.fillRect(0, 0, size.width, size.height);
  drawWorld(context, viewport);

  for (const device of devices) {
    drawDevice(context, device);
  }

  if (!isConnectionOpen) {
    context.fillStyle = MAP_COLORS.DIM_OVERLAY;
    context.fillRect(0, 0, size.width, size.height);
  }
};
