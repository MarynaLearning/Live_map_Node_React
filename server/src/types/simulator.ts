import type { TDeviceMessage, TListener, TUnsubscribe } from '@iot/shared';
import type { TNow, TRandom } from './common';

export interface IVector {
  x: number;
  y: number;
}

export interface IMovement {
  position: IVector;
  velocity: IVector;
}

export interface IVirtualDeviceState {
  bootId: number;
  seq: number;
  position: IVector;
  velocity: IVector;
  sensorPhase: number;
  battery: number;
  offlineUntil: number;
  isLowBatteryReported: boolean;
}

export interface IVirtualDeviceOptions {
  deviceId: string;
  clockOffsetMs: number;
  startedAt: number;
  random: TRandom;
}

export interface IVirtualDevice {
  readonly deviceId: string;
  /** Advances the device by elapsedMs and returns what it emitted (empty while offline). */
  tick(now: number, elapsedMs: number): TDeviceMessage[];
}

export interface IDeviceFleetOptions {
  count: number;
  random: TRandom;
  now: TNow;
}

export interface ISimulator {
  start(): void;
  stop(): void;
  setStressMode(enabled: boolean): void;
  isStressMode(): boolean;
  subscribe(listener: TListener<TDeviceMessage>): TUnsubscribe;
}

export interface ISimulatorDeps {
  devices: IVirtualDevice[];
  random: TRandom;
  now: TNow;
  stress: boolean;
}
