import type { ReactNode } from 'react';
import type { IDeviceRecord } from '@/store';
import type { DeviceStatus } from '@/types/device';

export interface ILiveMapProps {
  selectedDeviceId: string;
  onSelectDevice(deviceId: string): void;
  /** Overlays drawn above the canvas (diagnostics, connection banner). */
  children?: ReactNode;
}

export interface ICanvasSize {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface IViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
  sizePx: number;
}

export interface IDeviceView {
  deviceId: string;
  label: string;
  x: number;
  y: number;
  status: DeviceStatus;
  isSelected: boolean;
  /** Under the mouse pointer. */
  isHovered: boolean;
  /** "4.2s ago" / "rebooted" / null. */
  caption: string | null;
  /** 0..1 while the "resumed / rebooted" pulse plays, null otherwise. */
  pulseProgress: number | null;
}

export interface IDeviceViewsInput {
  devices: IDeviceRecord[];
  /** Frame timestamp (client clock). */
  now: number;
  /** How far in the past positions are drawn. */
  renderDelayMs: number;
  isConnectionOpen: boolean;
  viewport: IViewport;
  selectedDeviceId: string;
  hoveredDeviceId: string | null;
}

export interface IMapScene {
  size: ICanvasSize;
  viewport: IViewport;
  devices: IDeviceView[];
  isConnectionOpen: boolean;
}

export interface ILegendItem {
  status: DeviceStatus;
  label: string;
  hint: string;
}
