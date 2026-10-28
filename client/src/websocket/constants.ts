import { MessageType } from '@iot/shared';
import { ConnectionStatus, type IConnectionState } from './types';

export const BACKOFF_BASE_MS = 500;

export const BACKOFF_MAX_MS = 10_000;

export const WATCHDOG_TIMEOUT_MS = 4000;

export const WATCHDOG_CHECK_INTERVAL_MS = 500;

export const INITIAL_CONNECTION_STATE: IConnectionState = {
  status: ConnectionStatus.CONNECTING,
  retryAt: null,
  attempt: 0,
};

export const KNOWN_MESSAGE_TYPES: Record<string, true> = {
  [MessageType.STATE]: true,
  [MessageType.EVENT]: true,
  [MessageType.SNAPSHOT]: true,
  [MessageType.RESUME]: true,
  [MessageType.HEARTBEAT]: true,
};
