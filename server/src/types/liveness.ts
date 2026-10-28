/** The part of a ws WebSocket the liveness monitor needs, so a fake can be injected. */
export interface ILivenessSocket {
  ping(): void;
  terminate(): void;
  on(event: 'pong', listener: () => void): unknown;
}

export interface ILivenessMonitor {
  stop(): void;
}

export interface ILivenessMonitorDeps {
  socket: ILivenessSocket;
  intervalMs: number;
}

export type TWatchLiveness = (socket: ILivenessSocket) => ILivenessMonitor;
