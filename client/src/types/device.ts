export enum DeviceStatus {
  ONLINE = 'online',
  STALE = 'stale',
  OFFLINE = 'offline',
  /** The connection is down, so silence tells us nothing about the device. */
  UNKNOWN = 'unknown',
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IPositionSample extends IPoint {
  ts: number;
}
