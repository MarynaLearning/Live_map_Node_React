import { MAX_MAX_HZ, MIN_MAX_HZ } from '@iot/shared';

export const DEBUG_ENDPOINTS = {
  STATUS: '/status',
  STRESS: '/stress',
  DROP_CONNECTIONS: '/drop-connections',
} as const;

export const HZ_SLIDER = {
  MIN: MIN_MAX_HZ,
  MAX: MAX_MAX_HZ,
  UNLIMITED_POSITION: MAX_MAX_HZ + 1,
} as const;

export const HIGH_RENDER_DELAY_MS = 500;

export const DEBUG_TEXT = {
  TITLE: 'Debug',
  DROP_ALL: 'Drop all connections (auto-reconnect)',
  DISCONNECT: 'Disconnect (no reconnect)',
  CONNECT: 'Connect',
  STRESS: 'Stress mode (500+ msg/s)',
  HZ_LABEL: 'Max Hz per device',
  HZ_UNIT: 'Hz',
  HZ_UNLIMITED: 'No limit',
  HZ_HINT: 'Server sends at most this many state updates per device per second. Events are never limited.',
  DELAY_PREFIX: 'Map is drawn',
  DELAY_SUFFIX_UNLIMITED: 'behind live to smooth network jitter.',
  DELAY_SUFFIX_LIMITED: 'behind live: fewer updates need a longer buffer.',
  DELAY_STATUS_NOTE: 'Status and chart stay live.',
  REQUEST_FAILED: 'Gateway request failed:',
  UNKNOWN_ERROR: 'Unknown error',
} as const;
