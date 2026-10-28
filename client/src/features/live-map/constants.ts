import { WORLD_SIZE } from '@iot/shared';
import { DEVICE_STATUS_LABELS, OFFLINE_THRESHOLD_MS, ONLINE_THRESHOLD_MS } from '@/constants/device';
import { DeviceStatus } from '@/types/device';
import type { ILegendItem } from './types';

export const MAP_PADDING_PX = 24;

export const GRID_STEP_WORLD = WORLD_SIZE / 10;

export const DEVICE_RADIUS_PX = 7;

export const SELECTED_RING_RADIUS_PX = 13;

export const HOVER_RING_RADIUS_PX = 11;

export const PULSE_MAX_RADIUS_PX = 26;

export const PULSE_DURATION_MS = 1200;

export const REBOOT_CAPTION_MS = 5000;

export const HIT_RADIUS_PX = 18;

export const LABEL_OFFSET_X_PX = 11;

export const MAP_COLORS = {
  BACKGROUND: '#0d1117',
  WORLD: '#10151c',
  GRID: '#1c232c',
  WORLD_BORDER: '#30363d',
  LABEL: '#e6edf3',
  CAPTION: '#8b949e',
  SELECTED_RING: '#58a6ff',
  HOVER_RING: 'rgb(230 237 243 / 45%)',
  DIM_OVERLAY: 'rgb(13 17 23 / 55%)',
} as const;

export const MAP_FONTS = {
  LABEL: '500 12px Inter, system-ui, sans-serif',
  CAPTION: '11px Inter, system-ui, sans-serif',
} as const;

export const DOT_ALPHA_BY_STATUS: Record<DeviceStatus, number> = {
  [DeviceStatus.ONLINE]: 1,
  [DeviceStatus.STALE]: 0.55,
  [DeviceStatus.OFFLINE]: 1,
  [DeviceStatus.UNKNOWN]: 0.6,
};

export const STALE_DASH_PATTERN = [3, 3];

export const MAP_TEXT = {
  ARIA_LABEL: 'Live map of devices. Click a device to show its sensor chart.',
  AGO_SUFFIX: 'ago',
  REBOOTED: 'rebooted',
} as const;

export const LEGEND_ITEMS: ILegendItem[] = [
  { status: DeviceStatus.ONLINE, label: DEVICE_STATUS_LABELS[DeviceStatus.ONLINE], hint: `data < ${ONLINE_THRESHOLD_MS / 1000}s` },
  { status: DeviceStatus.STALE, label: DEVICE_STATUS_LABELS[DeviceStatus.STALE], hint: 'last known position' },
  { status: DeviceStatus.OFFLINE, label: DEVICE_STATUS_LABELS[DeviceStatus.OFFLINE], hint: `silent > ${OFFLINE_THRESHOLD_MS / 1000}s` },
  { status: DeviceStatus.UNKNOWN, label: DEVICE_STATUS_LABELS[DeviceStatus.UNKNOWN], hint: 'no connection' },
];
