import { OFFLINE_THRESHOLD_MS, ONLINE_THRESHOLD_MS } from '@/constants/device';
import { DeviceStatus } from '@/types/device';

/**
 * @Description Classifies a device by the local time since its last accepted state; unknown while the connection is down
 * @param lastReceivedAt
 * @param now
 * @param isConnectionOpen
 */
export const getDeviceStatus = (lastReceivedAt: number, now: number, isConnectionOpen: boolean): DeviceStatus => {
  if (!isConnectionOpen) {
    return DeviceStatus.UNKNOWN;
  }

  const ageMs = now - lastReceivedAt;

  if (ageMs < ONLINE_THRESHOLD_MS) {
    return DeviceStatus.ONLINE;
  }

  if (ageMs < OFFLINE_THRESHOLD_MS) {
    return DeviceStatus.STALE;
  }

  return DeviceStatus.OFFLINE;
};
