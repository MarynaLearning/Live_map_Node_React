import type { TDeviceMessage, TListener, TUnsubscribe } from '@iot/shared';
import type { TRandom } from './common';

export interface IChaosSettings {
  delayProbability: number;
  minDelayMs: number;
  maxDelayMs: number;
  duplicateProbability: number;
}

export interface IChaosLayer {
  send(message: TDeviceMessage): void;
  subscribe(listener: TListener<TDeviceMessage>): TUnsubscribe;
  getSettings(): IChaosSettings;
  updateSettings(patch: Partial<IChaosSettings>): IChaosSettings;
}

export interface IChaosDeps {
  settings: IChaosSettings;
  random: TRandom;
}
