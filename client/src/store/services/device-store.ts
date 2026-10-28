import {
  compareMessageIds,
  createEmitter,
  createReconcileState,
  reconcileMessage,
  ReconcileResult,
  type IEventMessage,
  type IReconcileState,
  type IStateMessage,
  type TDeviceMessage,
  type TLastSeen,
} from '@iot/shared';
import { EMPTY_EVENTS, MAX_EVENTS_PER_DEVICE } from '@/store/constants';
import type { IDeviceRecord, IDeviceStore, IStoredEvent } from '@/store/types';
import { addLateTrackPoint, createDeviceRecord, updateDeviceRecord } from '@/store/utils/device-record';
import { insertEventSorted } from '@/store/utils/insert-sorted';

/**
 * @Description Mutable store outside React: reconciles every message and keeps the latest state, sensor samples, events and last seen id per device; tells subscribers when a device gets a new event
 */
export const createDeviceStore = (): IDeviceStore => {
  const records: Record<string, IDeviceRecord> = {};
  const reconcileStates: Record<string, IReconcileState> = {};
  const events: Record<string, IStoredEvent[]> = {};
  const lastSeen: TLastSeen = {};
  const eventEmitter = createEmitter<string>();
  let deviceList: IDeviceRecord[] = [];

  const readReconcileState = (deviceId: string): IReconcileState => {
    const existing = reconcileStates[deviceId];

    if (existing !== undefined) {
      return existing;
    }

    const created = createReconcileState();

    reconcileStates[deviceId] = created;

    return created;
  };

  const registerRecord = (record: IDeviceRecord) => {
    records[record.deviceId] = record;
    deviceList = Object.values(records).sort((left, right) =>
      left.deviceId.localeCompare(right.deviceId, undefined, { numeric: true }),
    );
  };

  const rememberLastSeen = (message: TDeviceMessage) => {
    const current = lastSeen[message.deviceId];

    if (current === undefined || compareMessageIds(message, current) > 0) {
      lastSeen[message.deviceId] = { bootId: message.bootId, seq: message.seq };
    }
  };

  const applyState = (message: IStateMessage, receivedAt: number): ReconcileResult => {
    const result = reconcileMessage(readReconcileState(message.deviceId), message);
    const record = records[message.deviceId];

    if (result === ReconcileResult.OUT_OF_ORDER && record !== undefined) {
      addLateTrackPoint(record, message);
    }

    if (result !== ReconcileResult.ACCEPTED) {
      return result;
    }

    rememberLastSeen(message);

    if (record === undefined) {
      registerRecord(createDeviceRecord(message, receivedAt));
    } else {
      updateDeviceRecord(record, message, receivedAt);
    }

    return result;
  };

  const applyEvent = (message: IEventMessage, receivedAt: number): ReconcileResult => {
    const result = reconcileMessage(readReconcileState(message.deviceId), message);

    if (result === ReconcileResult.ACCEPTED) {
      rememberLastSeen(message);
      events[message.deviceId] = insertEventSorted(
        events[message.deviceId] ?? EMPTY_EVENTS,
        { message, receivedAt },
        MAX_EVENTS_PER_DEVICE,
      );
      eventEmitter.emit(message.deviceId);
    }

    return result;
  };

  const commitFrame = (): number => {
    let coalescedCount = 0;

    for (const record of deviceList) {
      coalescedCount += Math.max(0, record.pendingFrameUpdates - 1);
      record.pendingFrameUpdates = 0;
    }

    return coalescedCount;
  };

  const getDevices = () => deviceList;

  const getDevice = (deviceId: string) => records[deviceId] ?? null;

  const getEvents = (deviceId: string) => events[deviceId] ?? EMPTY_EVENTS;

  const getLastSeen = (): TLastSeen => ({ ...lastSeen });

  const subscribeToEvents = eventEmitter.subscribe;

  return { applyState, applyEvent, commitFrame, getDevices, getDevice, getEvents, getLastSeen, subscribeToEvents };
};
