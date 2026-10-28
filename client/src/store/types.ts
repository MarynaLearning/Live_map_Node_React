import type {
  IEventMessage,
  IStateMessage,
  IStatePayload,
  ReconcileResult,
  TLastSeen,
  TListener,
  TServerMessage,
  TUnsubscribe,
} from '@iot/shared';
import type { MessageType } from '@iot/shared';
import type { IFrameLoop } from '@/frame-loop';
import type { IPositionSample } from '@/types/device';
import type { IWsClient } from '@/websocket';

export interface ISensorSample {
  ts: number;
  value: number;
}

export interface IDeviceRecord {
  deviceId: string;
  bootId: number;
  seq: number;
  ts: number;
  payload: IStatePayload;
  lastReceivedAt: number;
  track: IPositionSample[];
  clockOffsetMs: number;
  /** Client clock when the device came back after a silence, null if never. */
  resumedAt: number | null;
  /** Client clock when a reboot (new bootId) was seen, null if never. */
  rebootedAt: number | null;
  samples: ISensorSample[];
  /** Grows on every sample change so renderers can skip unchanged frames. */
  samplesRevision: number;
  /** Accepted states since the last frame; all but the last one are coalesced. */
  pendingFrameUpdates: number;
}

export interface IStoredEvent {
  message: IEventMessage;
  receivedAt: number;
}

export interface IDeviceStoreReader {
  getDevices(): IDeviceRecord[];
  getDevice(deviceId: string): IDeviceRecord | null;
  getEvents(deviceId: string): IStoredEvent[];
  getLastSeen(): TLastSeen;
  /** Calls the listener with the deviceId whenever that device gets a new event. */
  subscribeToEvents(listener: TListener<string>): TUnsubscribe;
}

export interface IDeviceStoreWriter {
  applyState(message: IStateMessage, receivedAt: number): ReconcileResult;
  applyEvent(message: IEventMessage, receivedAt: number): ReconcileResult;
  commitFrame(): number;
}

export interface IDeviceStore extends IDeviceStoreReader, IDeviceStoreWriter {}

export interface IDiagnosticTotals {
  received: number;
  duplicate: number;
  outOfOrder: number;
  staleBoot: number;
  coalesced: number;
  replayed: number;
  resynced: number;
}

export interface IDiagnosticsSnapshot extends IDiagnosticTotals {
  messagesPerSecond: number;
  framesPerSecond: number;
}

export interface IDiagnosticsReader {
  getSnapshot(): IDiagnosticsSnapshot;
}

export interface IDiagnostics extends IDiagnosticsReader {
  recordReceived(): void;
  recordResult(result: ReconcileResult): void;
  recordFrame(timestamp: number, coalescedCount: number): void;
  recordResume(replayedDevices: number, resyncedDevices: number): void;
}

export interface IDiagnosticsDeps {
  now: () => number;
}

export interface IRateMeter {
  count: number;
  windowStartedAt: number;
  rate: number;
}

export interface ILiveSync {
  start(): void;
  stop(): void;
}

export interface ILiveSyncDeps {
  wsClient: IWsClient;
  deviceStore: IDeviceStore;
  diagnostics: IDiagnostics;
  frameLoop: IFrameLoop;
  now: () => number;
}

export interface IServerMessageHandlerDeps {
  deviceStore: IDeviceStoreWriter;
  diagnostics: IDiagnostics;
  now: () => number;
}

export type TServerMessageHandlers = {
  [TType in MessageType]: (message: Extract<TServerMessage, { type: TType }>) => void;
};

export type TStopListening = TUnsubscribe;
