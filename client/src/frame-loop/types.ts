import type { TUnsubscribe } from '@iot/shared';

export type TFrameCallback = (timestamp: number) => void;

export interface IFrameLoop {
  start(): void;
  stop(): void;
  subscribe(callback: TFrameCallback): TUnsubscribe;
}

export interface IFrameLoopDeps {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (frameId: number) => void;
}
