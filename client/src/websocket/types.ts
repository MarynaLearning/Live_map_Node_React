import type { ISubscription, TClientMessage, TLastSeen, TListener, TServerMessage, TUnsubscribe } from '@iot/shared';

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  RECONNECTING = 'reconnecting',
  DISCONNECTED = 'disconnected',
}

export interface IConnectionState {
  status: ConnectionStatus;
  retryAt: number | null;
  attempt: number;
}

export interface IWsClient {
  connect(): void;
  disconnect(): void;
  pauseRetry(): void;
  retryNow(): void;
  sendMessage(message: TClientMessage): boolean;
  getConnectionState(): IConnectionState;
  subscribeToConnection(listener: TListener<IConnectionState>): TUnsubscribe;
  subscribeToMessages(listener: TListener<TServerMessage>): TUnsubscribe;
}

export interface IBackoff {
  nextDelayMs(): number;
  reset(): void;
}

export interface IBackoffDeps {
  baseMs: number;
  maxMs: number;
  random: () => number;
}

export interface IHeartbeatWatchdog {
  start(onTimeout: () => void): void;
  feed(): void;
  stop(): void;
}

export interface IHeartbeatWatchdogDeps {
  timeoutMs: number;
  checkIntervalMs: number;
  now: () => number;
}

export interface ISubscriptionService {
  start(): void;
  stop(): void;
  getSubscription(): ISubscription;
  updateSubscription(patch: Partial<ISubscription>): void;
  subscribeToChanges(listener: TListener<ISubscription>): TUnsubscribe;
}

export interface ISubscriptionServiceDeps {
  wsClient: IWsClient;
  initialSubscription: ISubscription;
  readLastSeen: () => TLastSeen;
}

export interface IPageEnvironment {
  isPageVisible(): boolean;
  /** Fires on tab hidden / visible. */
  subscribeToVisibility(listener: TListener<boolean>): TUnsubscribe;
  /** Fires when the browser reports the network is back. */
  subscribeToOnline(listener: () => void): TUnsubscribe;
}

export interface IConnectionRecovery {
  start(): void;
  stop(): void;
}

export interface IConnectionRecoveryDeps {
  wsClient: IWsClient;
  environment: IPageEnvironment;
}

export interface IWsClientDeps {
  url: string;
  createSocket: (url: string) => WebSocket;
  backoff: IBackoff;
  watchdog: IHeartbeatWatchdog;
  now: () => number;
}
