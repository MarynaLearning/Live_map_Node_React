import type { IStateMessage } from '@iot/shared';
import { ONLINE_THRESHOLD_MS, TRACK_WINDOW_MS } from '@/constants/device';
import { MAX_SAMPLES_PER_DEVICE, SAMPLE_MERGE_MS, SAMPLE_WINDOW_MS } from '@/store/constants';
import type { IDeviceRecord } from '@/store/types';

const appendSample = (record: IDeviceRecord, message: IStateMessage): void => {
  const lastSample = record.samples.at(-1);
  const sample = { ts: message.ts, value: message.payload.sensor };
  // Fixed time buckets (not "close to the last sample"): otherwise every replacement moves the last sample forward
  // and at stress rate (< 50 ms apart) all samples would collapse into one.
  const isSameBucket =
    lastSample !== undefined && Math.floor(sample.ts / SAMPLE_MERGE_MS) === Math.floor(lastSample.ts / SAMPLE_MERGE_MS);

  if (isSameBucket) {
    record.samples[record.samples.length - 1] = sample;
  } else {
    record.samples.push(sample);
  }

  const oldestAllowedTs = sample.ts - SAMPLE_WINDOW_MS;

  while (record.samples.length > MAX_SAMPLES_PER_DEVICE || (record.samples[0]?.ts ?? oldestAllowedTs) < oldestAllowedTs) {
    record.samples.shift();
  }

  record.samplesRevision += 1;
};

/** @Description Inserts a position into the track in device-time order and drops points older than the window. */
const insertTrackPoint = (record: IDeviceRecord, message: IStateMessage): void => {
  const point = { ts: message.ts, x: message.payload.x, y: message.payload.y };
  let insertAt = record.track.length;

  while (insertAt > 0 && (record.track[insertAt - 1]?.ts ?? -Infinity) > point.ts) {
    insertAt -= 1;
  }

  if (record.track[insertAt - 1]?.ts === point.ts) {
    return;
  }

  record.track.splice(insertAt, 0, point);

  const newestTs = record.track.at(-1)?.ts ?? point.ts;

  while (record.track.length > 1 && (record.track[0]?.ts ?? newestTs) < newestTs - TRACK_WINDOW_MS) {
    record.track.shift();
  }
};

/** @Description Smallest seen: maps the device clock onto ours, including the shortest network delay. */
const updateClockOffset = (record: IDeviceRecord, message: IStateMessage, receivedAt: number): void => {
  record.clockOffsetMs = Math.min(record.clockOffsetMs, receivedAt - message.ts);
};

/**
 * @Description Creates the record of a device from its first accepted state
 * @param message
 * @param receivedAt client clock
 */
export const createDeviceRecord = (message: IStateMessage, receivedAt: number): IDeviceRecord => {
  const record: IDeviceRecord = {
    deviceId: message.deviceId,
    bootId: message.bootId,
    seq: message.seq,
    ts: message.ts,
    payload: message.payload,
    lastReceivedAt: receivedAt,
    track: [],
    clockOffsetMs: receivedAt - message.ts,
    resumedAt: null,
    rebootedAt: null,
    samples: [],
    samplesRevision: 0,
    pendingFrameUpdates: 1,
  };

  insertTrackPoint(record, message);
  appendSample(record, message);

  return record;
};

/**
 * @Description Applies a newer accepted state in place: becomes the current state and a new point on the track; a silence or a reboot is remembered for the pulse and caption
 * @param record
 * @param message already accepted by reconcile
 * @param receivedAt client clock
 */
export const updateDeviceRecord = (record: IDeviceRecord, message: IStateMessage, receivedAt: number): void => {
  const isResume = receivedAt - record.lastReceivedAt >= ONLINE_THRESHOLD_MS;
  const isReboot = message.bootId > record.bootId;

  record.resumedAt = isResume ? receivedAt : record.resumedAt;
  record.rebootedAt = isReboot ? receivedAt : record.rebootedAt;
  record.bootId = message.bootId;
  record.seq = message.seq;
  record.ts = message.ts;
  record.payload = message.payload;
  record.lastReceivedAt = Math.max(record.lastReceivedAt, receivedAt);
  record.pendingFrameUpdates += 1;
  insertTrackPoint(record, message);
  updateClockOffset(record, message, receivedAt);
  appendSample(record, message);
};

/**
 * @Description Uses a late (out-of-order) state of the current boot only to fill the drawn path; it never becomes the current state
 * @param record
 * @param message
 */
export const addLateTrackPoint = (record: IDeviceRecord, message: IStateMessage): void => {
  if (message.bootId !== record.bootId) {
    return;
  }

  insertTrackPoint(record, message);
};
