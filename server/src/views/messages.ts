import {
  MessageType,
  type IHeartbeatMessage,
  type IResumeMessage,
  type ISnapshotEntry,
  type ISnapshotMessage,
  type TServerMessage,
} from '@iot/shared';
import type { IResumePlan } from '../types/history';

/**
 * @Description Builds the snapshot sent to a client right after it connects
 * @param devices latest state per device
 */
export const buildSnapshotMessage = (devices: ISnapshotEntry[]): ISnapshotMessage => ({
  type: MessageType.SNAPSHOT,
  devices,
});

/**
 * @Description Builds the answer to a hello: replayed gaps plus snapshot entries for devices that could not be replayed
 * @param plan
 */
export const buildResumeMessage = ({ snapshot, replay, replayedDeviceIds }: IResumePlan): IResumeMessage => ({
  type: MessageType.RESUME,
  snapshot,
  replay,
  replayedDeviceIds,
});

/**
 * @Description Builds the heartbeat that lets the client tell a quiet gateway from a dead connection
 * @param serverTime
 */
export const buildHeartbeatMessage = (serverTime: number): IHeartbeatMessage => ({
  type: MessageType.HEARTBEAT,
  serverTime,
});

/**
 * @Description Serializes a server message for the wire
 * @param message
 */
export const serializeMessage = (message: TServerMessage): string => JSON.stringify(message);
