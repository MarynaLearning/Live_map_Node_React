import {
  MessageType,
  type IEventMessage,
  type IResumeMessage,
  type ISnapshotEntry,
  type ISnapshotMessage,
  type IStateMessage,
  type TServerMessage,
} from '@iot/shared';
import type { IServerMessageHandlerDeps, TServerMessageHandlers } from '@/store/types';

/**
 * @Description Creates one handler per server message type. Snapshot and replayed messages go through the same reconciliation as live ones but are not counted as received
 * @param deps
 */
export const createServerMessageHandlers = ({ deviceStore, diagnostics, now }: IServerMessageHandlerDeps): TServerMessageHandlers => {
  const applySnapshotEntries = (entries: ISnapshotEntry[]) => {
    const receivedAt = now();

    for (const entry of entries) {
      deviceStore.applyState(entry.message, receivedAt - entry.ageMs);
    }
  };

  const handleStateMessage = (message: IStateMessage) => {
    diagnostics.recordReceived();
    diagnostics.recordResult(deviceStore.applyState(message, now()));
  };

  const handleEventMessage = (message: IEventMessage) => {
    diagnostics.recordReceived();
    diagnostics.recordResult(deviceStore.applyEvent(message, now()));
  };

  const handleSnapshotMessage = (message: ISnapshotMessage) => {
    applySnapshotEntries(message.devices);
  };

  const handleResumeMessage = (message: IResumeMessage) => {
    const receivedAt = now();

    applySnapshotEntries(message.snapshot);

    for (const replayed of message.replay) {
      if (replayed.type === MessageType.EVENT) {
        deviceStore.applyEvent(replayed, receivedAt);
      } else {
        deviceStore.applyState(replayed, receivedAt);
      }
    }

    diagnostics.recordResume(message.replayedDeviceIds.length, message.snapshot.length);
  };

  const handleHeartbeatMessage = () => {
    // Nothing to store: the ws client already fed its watchdog when the frame arrived.
  };

  return {
    [MessageType.STATE]: handleStateMessage,
    [MessageType.EVENT]: handleEventMessage,
    [MessageType.SNAPSHOT]: handleSnapshotMessage,
    [MessageType.RESUME]: handleResumeMessage,
    [MessageType.HEARTBEAT]: handleHeartbeatMessage,
  };
};

/**
 * @Description Routes a server message to the handler of its type
 * @param handlers
 * @param message
 */
export const dispatchServerMessage = (handlers: TServerMessageHandlers, message: TServerMessage): void => {
  const handler = handlers[message.type] as (value: TServerMessage) => void;

  handler(message);
};
