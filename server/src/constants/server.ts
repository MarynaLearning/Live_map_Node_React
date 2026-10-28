import type { IChaosSettings } from '../types/chaos';

export const DEFAULT_PORT = 4000;

export const DEFAULT_DEVICE_COUNT = 8;

export const MIN_DEVICE_COUNT = 1;

export const MAX_DEVICE_COUNT = 20;

export const DEFAULT_STRESS = false;

export const DEFAULT_CHAOS_SETTINGS: IChaosSettings = {
  delayProbability: 0.3,
  minDelayMs: 100,
  maxDelayMs: 3000,
  duplicateProbability: 0.05,
};

export const ENV_KEYS = {
  PORT: 'PORT',
  DEVICE_COUNT: 'DEVICE_COUNT',
  STRESS: 'STRESS',
  CHAOS_DELAY_PROBABILITY: 'CHAOS_DELAY_PROBABILITY',
  CHAOS_MIN_DELAY_MS: 'CHAOS_MIN_DELAY_MS',
  CHAOS_MAX_DELAY_MS: 'CHAOS_MAX_DELAY_MS',
  CHAOS_DUPLICATE_PROBABILITY: 'CHAOS_DUPLICATE_PROBABILITY',
} as const;

/** ws WebSocket.OPEN */
export const SOCKET_OPEN_STATE = 1;

export const SHUTDOWN_CLOSE_CODE = 1001;

export const SHUTDOWN_CLOSE_REASON = 'server shutdown';
