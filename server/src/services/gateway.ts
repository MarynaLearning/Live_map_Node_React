import { compareMessageIds, createEmitter, MessageType, type ISnapshotEntry, type IStateMessage, type TDeviceMessage } from '@iot/shared';
import type { IGateway, IGatewayDeps, ILatestStateEntry } from '../types/gateway';

/**
 * @Description Keeps the latest known state per device for snapshots and relays every message untouched to the sessions
 * @param deps
 */
export const createGateway = ({ source, now }: IGatewayDeps): IGateway => {
  const emitter = createEmitter<TDeviceMessage>();
  const latestStates: Record<string, ILatestStateEntry> = {};

  const rememberLatestState = (message: IStateMessage) => {
    const current = latestStates[message.deviceId];

    if (current !== undefined && compareMessageIds(message, current.message) <= 0) {
      return;
    }

    latestStates[message.deviceId] = { message, receivedAt: now() };
  };

  const handleDeviceMessage = (message: TDeviceMessage) => {
    if (message.type === MessageType.STATE) {
      rememberLatestState(message);
    }

    emitter.emit(message);
  };

  const getSnapshot = (): ISnapshotEntry[] => {
    const snapshotAt = now();

    return Object.values(latestStates).map((entry) => ({
      message: entry.message,
      ageMs: snapshotAt - entry.receivedAt,
    }));
  };

  source.subscribe(handleDeviceMessage);

  return { getSnapshot, subscribe: emitter.subscribe };
};
