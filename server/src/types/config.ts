import type { IChaosSettings } from './chaos';

export interface IServerConfig {
  port: number;
  deviceCount: number;
  stress: boolean;
  chaos: IChaosSettings;
}
