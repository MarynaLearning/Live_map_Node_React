import { StatusTone } from '@/types/components';
import { DeviceStatus } from '@/types/device';

/** Online/stale boundary: maximum age of a device's last update for it to count as online. */
export const ONLINE_THRESHOLD_MS = 2000;

/** Stale/offline boundary: maximum age of a device's last update for it to count as stale. */
export const OFFLINE_THRESHOLD_MS = 10_000;

/** Map lag behind live data without a maxHz limit. */
export const BASE_RENDER_DELAY_MS = 350;

/** Speed of the map lag change after a maxHz change. */
export const RENDER_DELAY_ADJUST_RATE = 0.5;

/** Length of the recent movement history kept per device for map drawing. */
export const TRACK_WINDOW_MS = 3000;

/** Largest gap between two known positions that the map still animates. */
export const MAX_TRACK_GAP_MS = ONLINE_THRESHOLD_MS;

export const DEVICE_STATUS_TONES: Record<DeviceStatus, StatusTone> = {
  [DeviceStatus.ONLINE]: StatusTone.SUCCESS,
  [DeviceStatus.STALE]: StatusTone.WARNING,
  [DeviceStatus.OFFLINE]: StatusTone.MUTED,
  [DeviceStatus.UNKNOWN]: StatusTone.NEUTRAL,
};

export const DEVICE_STATUS_COLORS: Record<DeviceStatus, string> = {
  [DeviceStatus.ONLINE]: '#3fb950',
  [DeviceStatus.STALE]: '#d29922',
  [DeviceStatus.OFFLINE]: '#6e7681',
  [DeviceStatus.UNKNOWN]: '#8b949e',
};

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  [DeviceStatus.ONLINE]: 'Online',
  [DeviceStatus.STALE]: 'Stale',
  [DeviceStatus.OFFLINE]: 'Offline',
  [DeviceStatus.UNKNOWN]: 'Unknown',
};
