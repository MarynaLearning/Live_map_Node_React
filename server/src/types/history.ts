import type { IMessageId, ISnapshotEntry, TDeviceMessage, TLastSeen } from '@iot/shared';
import type { TNow } from './common';
import type { INormalizedSubscription } from './session';

export interface IHistoryEntry {
  message: TDeviceMessage;
  receivedAt: number;
}

export interface IDeviceHistory {
  record(message: TDeviceMessage): void;
  /** Messages newer than lastSeen, or null when the history no longer reaches back to lastSeen (gap too large). */
  readSince(deviceId: string, lastSeen: IMessageId): TDeviceMessage[] | null;
}

export interface IDeviceHistoryDeps {
  maxMessagesPerDevice: number;
  maxAgeMs: number;
  now: TNow;
}

export interface IResumePlanInput {
  snapshot: ISnapshotEntry[];
  lastSeen: TLastSeen;
  history: IDeviceHistory;
  subscription: INormalizedSubscription;
}

export interface IResumePlan {
  snapshot: ISnapshotEntry[];
  replay: TDeviceMessage[];
  replayedDeviceIds: string[];
}
