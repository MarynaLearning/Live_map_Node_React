import { HIT_RADIUS_PX } from '@/features/live-map/constants';
import type { IDeviceView } from '@/features/live-map/types';

/**
 * @Description Finds the device closest to a click within the hit radius
 * @param devices
 * @param x
 * @param y
 */
export const findDeviceAt = (devices: IDeviceView[], x: number, y: number): string | null => {
  let closestId: string | null = null;
  let closestDistance = HIT_RADIUS_PX;

  for (const device of devices) {
    const distance = Math.hypot(device.x - x, device.y - y);

    if (distance <= closestDistance) {
      closestId = device.deviceId;
      closestDistance = distance;
    }
  }

  return closestId;
};
