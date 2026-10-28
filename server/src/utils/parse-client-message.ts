import { ClientMessageType, type IHelloMessage, type ISubscribeMessage, type ISubscription, type TClientMessage, type TLastSeen } from '@iot/shared';
import type { RawData } from 'ws';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isDeviceIdList = (value: unknown): value is string[] | null =>
  value === null || (Array.isArray(value) && value.every((item) => typeof item === 'string'));

const isMaxHz = (value: unknown): value is number | null => value === null || (typeof value === 'number' && Number.isFinite(value));

const isMessageId = (value: unknown): boolean =>
  isRecord(value) && Number.isInteger(value.bootId) && Number.isInteger(value.seq);

const readSubscription = (value: unknown): ISubscription | null => {
  if (!isRecord(value) || !isDeviceIdList(value.deviceIds) || !isMaxHz(value.maxHz)) {
    return null;
  }

  return { deviceIds: value.deviceIds, maxHz: value.maxHz };
};

const readLastSeen = (value: unknown): TLastSeen | null => {
  if (!isRecord(value) || !Object.values(value).every(isMessageId)) {
    return null;
  }

  return value as TLastSeen;
};

const readSubscribeMessage = (value: Record<string, unknown>): ISubscribeMessage | null => {
  const subscription = readSubscription(value);

  return subscription === null ? null : { type: ClientMessageType.SUBSCRIBE, ...subscription };
};

const readHelloMessage = (value: Record<string, unknown>): IHelloMessage | null => {
  const subscription = readSubscription(value.subscription);
  const lastSeen = readLastSeen(value.lastSeen);

  if (subscription === null || lastSeen === null) {
    return null;
  }

  return { type: ClientMessageType.HELLO, subscription, lastSeen };
};

const readMessageOfType = (value: Record<string, unknown>): TClientMessage | null => {
  if (value.type === ClientMessageType.HELLO) {
    return readHelloMessage(value);
  }

  if (value.type === ClientMessageType.SUBSCRIBE) {
    return readSubscribeMessage(value);
  }

  return null;
};

/**
 * @Description Parses a raw WebSocket frame from a client, null when it is not a valid client message
 * @param data
 */
export const parseClientMessage = (data: RawData): TClientMessage | null => {
  try {
    const parsed: unknown = JSON.parse(String(data));

    return isRecord(parsed) ? readMessageOfType(parsed) : null;
  } catch {
    return null;
  }
};
