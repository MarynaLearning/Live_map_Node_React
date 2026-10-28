import type { IFrameLoop } from '@/frame-loop';
import type { IDeviceStoreReader, IDiagnosticsReader } from '@/store';
import type { ISubscriptionService, IWsClient } from '@/websocket';

export interface IDebugStatus {
  stressMode: boolean;
  deviceCount: number;
  connections: number;
}

export interface IDropConnectionsResult {
  dropped: number;
}

export interface IDebugApi {
  getStatus(): Promise<IDebugStatus>;
  setStressMode(enabled: boolean): Promise<IDebugStatus>;
  dropAllConnections(): Promise<IDropConnectionsResult>;
}

export interface IServices {
  wsClient: IWsClient;
  subscription: ISubscriptionService;
  deviceStore: IDeviceStoreReader;
  diagnostics: IDiagnosticsReader;
  frameLoop: IFrameLoop;
  debugApi: IDebugApi;
  now: () => number;
}
