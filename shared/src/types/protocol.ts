import type { IMessageId } from './reconcile';

export enum MessageType {
  STATE = 'state',
  EVENT = 'event',
  SNAPSHOT = 'snapshot',
  RESUME = 'resume',
  HEARTBEAT = 'heartbeat',
}

export enum DeviceEventKind {
  LOW_BATTERY = 'low_battery',
  ALERT = 'alert',
}

export interface IStatePayload {
  x: number;
  y: number;
  sensor: number;
  battery: number;
}

export interface IEventPayload {
  kind: DeviceEventKind;
  message: string;
}

export interface IDeviceMessageBase {
  deviceId: string;
  bootId: number;
  seq: number;
  ts: number;
}

export interface IStateMessage extends IDeviceMessageBase {
  type: MessageType.STATE;
  payload: IStatePayload;
}

export interface IEventMessage extends IDeviceMessageBase {
  type: MessageType.EVENT;
  payload: IEventPayload;
}

export type TDeviceMessage = IStateMessage | IEventMessage;

export interface ISnapshotEntry {
  message: IStateMessage;
  ageMs: number;
}

export interface ISnapshotMessage {
  type: MessageType.SNAPSHOT;
  devices: ISnapshotEntry[];
}

export interface IResumeMessage {
  type: MessageType.RESUME;
  snapshot: ISnapshotEntry[];
  replay: TDeviceMessage[];
  replayedDeviceIds: string[];
}

export interface IHeartbeatMessage {
  type: MessageType.HEARTBEAT;
  serverTime: number;
}

export type TServerMessage = TDeviceMessage | ISnapshotMessage | IResumeMessage | IHeartbeatMessage;

export enum ClientMessageType {
  HELLO = 'hello',
  SUBSCRIBE = 'subscribe',
}

export interface ISubscription {
  deviceIds: string[] | null;
  maxHz: number | null;
}

export type TLastSeen = Record<string, IMessageId>;

export interface IHelloMessage {
  type: ClientMessageType.HELLO;
  subscription: ISubscription;
  lastSeen: TLastSeen;
}

export interface ISubscribeMessage extends ISubscription {
  type: ClientMessageType.SUBSCRIBE;
}

export type TClientMessage = IHelloMessage | ISubscribeMessage;
