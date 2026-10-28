import { DeviceEventKind } from '@iot/shared';
import type { ISensorSample } from '@/store';

export const EMPTY_SAMPLES: ISensorSample[] = [];

export const CHART_WINDOW_MS = 30_000;

export const CHART_GAP_MS = 1500;

export const CHART_SUGGESTED_MIN = 10;

export const CHART_SUGGESTED_MAX = 35;

export const CHART_MAX_X_TICKS = 3;

export const CHART_COLORS = {
  LINE: '#58a6ff',
  FILL: 'rgb(88 166 255 / 18%)',
  GRID: '#21262d',
  TICK: '#8b949e',
} as const;

export const DETAILS_REFRESH_MS = 250;

export const MAX_LISTED_EVENTS = 50;

/** How long a just-arrived event counts as new; must match the rowNew animation in EventList.module.css. */
export const NEW_EVENT_HIGHLIGHT_MS = 3000;

export const SENSOR_DECIMALS = 2;

export const EVENT_KIND_LABELS: Record<DeviceEventKind, string> = {
  [DeviceEventKind.LOW_BATTERY]: 'Low battery',
  [DeviceEventKind.ALERT]: 'Alert',
};

export const DEVICE_PANEL_TEXT = {
  TITLE_PREFIX: 'Live sensor ·',
  UNIT: '°C',
  NO_VALUE: '—',
  BATTERY: 'Battery',
  BOOT: 'Boot',
  SEQ: 'Seq',
  HINT: 'Click a device on the map to switch.',
  NO_EVENTS: 'No events yet',
  EVENTS_TITLE: 'Events',
  EVENT_META_BOOT: 'boot',
  CHART_ARIA_LABEL: 'Sensor reading over the last 30 seconds',
} as const;
