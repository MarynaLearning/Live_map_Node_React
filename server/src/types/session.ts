import type { IEventMessage, IStateMessage, ISubscription, TClientMessage, TServerMessage } from '@iot/shared';
import type { TNow } from './common';
import type { IGateway } from './gateway';
import type { IDeviceHistory } from './history';

/** The part of a ws WebSocket the server needs, so a fake can be injected. */
export interface ISessionSocket {
  readonly readyState: number;
  /** Bytes queued in the socket but not yet sent: grows when the client reads slowly. */
  readonly bufferedAmount: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

/** Subscription prepared for fast lookups: the device list becomes an object. */
export interface INormalizedSubscription {
  deviceFilter: Record<string, true> | null;
  maxHz: number | null;
}

export interface IOutboxStats {
  bufferedBytes: number;
  queuedEvents: number;
}

export interface IOutbox {
  /** Snapshot and heartbeat: always sent while the socket is open. */
  sendControl(message: TServerMessage): void;
  /** Never dropped: sent now, or queued while the client is slow. */
  sendEvent(message: IEventMessage): void;
  /** Returns false (nothing sent) while the client is slow, so the caller keeps coalescing. */
  sendStates(messages: IStateMessage[]): boolean;
  getStats(): IOutboxStats;
}

export interface IOutboxDeps {
  socket: ISessionSocket;
  highWaterBytes: number;
  maxQueuedEvents: number;
  onOverflow(): void;
}

export interface IStateThrottle {
  offer(message: IStateMessage): void;
  setMaxHz(maxHz: number | null): void;
  /** Drops pending states of devices the client no longer wants. */
  keepOnly(isWanted: (deviceId: string) => boolean): void;
  getCoalescedCount(): number;
  dispose(): void;
}

export interface IStateThrottleDeps {
  /** Returns false when nothing could be sent; pending states are then kept (latest wins). */
  flushStates(messages: IStateMessage[]): boolean;
  unlimitedFlushIntervalMs: number;
}

export interface ISessionStats {
  sessionId: string;
  maxHz: number | null;
  /** Number of subscribed devices, null = all. */
  subscribedDevices: number | null;
  bufferedBytes: number;
  queuedEvents: number;
  coalescedStates: number;
}

export interface ISession {
  handleClientMessage(message: TClientMessage): void;
  getStats(sessionId: string): ISessionStats;
  /** Stops streaming without touching the socket (socket already closed). */
  dispose(): void;
  /** Stops streaming and closes the socket. */
  close(code: number, reason: string): void;
}

export interface ISessionDeps {
  socket: ISessionSocket;
  gateway: IGateway;
  history: IDeviceHistory;
  outbox: IOutbox;
  stateThrottle: IStateThrottle;
  initialSubscription: ISubscription;
  helloTimeoutMs: number;
  now: TNow;
}

export type TOpenSession = (socket: ISessionSocket) => ISession;

export interface IConnectionRegistry {
  add(session: ISession): string;
  remove(sessionId: string): void;
  dropAll(code: number, reason: string): number;
  count(): number;
  listStats(): ISessionStats[];
}
