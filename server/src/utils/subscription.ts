import { MAX_MAX_HZ, MIN_MAX_HZ, type ISnapshotEntry, type ISubscription } from '@iot/shared';
import type { INormalizedSubscription } from '../types/session';
import { clamp } from './math';

/**
 * @Description Validates a subscription: maxHz clamped to the allowed range, device list turned into an object for O(1) lookups
 * @param subscription
 */
export const normalizeSubscription = ({ deviceIds, maxHz }: ISubscription): INormalizedSubscription => {
  const deviceFilter = deviceIds === null ? null : Object.fromEntries(deviceIds.map((deviceId) => [deviceId, true as const]));

  return {
    deviceFilter,
    maxHz: maxHz === null ? null : clamp(maxHz, MIN_MAX_HZ, MAX_MAX_HZ),
  };
};

/**
 * @Description Tells whether the client subscribed to this device
 * @param subscription
 * @param deviceId
 */
export const isDeviceSubscribed = (subscription: INormalizedSubscription, deviceId: string): boolean =>
  subscription.deviceFilter === null || subscription.deviceFilter[deviceId] === true;

/**
 * @Description Keeps only the snapshot entries of subscribed devices
 * @param entries
 * @param subscription
 */
export const filterSnapshot = (entries: ISnapshotEntry[], subscription: INormalizedSubscription): ISnapshotEntry[] =>
  entries.filter((entry) => isDeviceSubscribed(subscription, entry.message.deviceId));
