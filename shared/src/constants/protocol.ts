import type { ISubscription } from '../types/protocol';

export const WS_PATH = '/ws';

export const DEBUG_PATH = '/debug';

export const HEARTBEAT_INTERVAL_MS = 1000;

export const HELLO_TIMEOUT_MS = 1000;

export const WORLD_SIZE = 1000;

export const MIN_MAX_HZ = 1;

export const MAX_MAX_HZ = 30;

export const DEFAULT_SUBSCRIPTION: ISubscription = {
  deviceIds: null,
  maxHz: null,
};
