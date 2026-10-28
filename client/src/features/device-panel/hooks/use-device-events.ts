import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useServices } from '@/hooks/use-services';
import type { IDeviceEvents } from '@/features/device-panel/types';
import { buildDeviceEvents } from '@/features/device-panel/utils/device-events';

/**
 * @Description Keeps the event list of one device in sync with the store;
 * @param deviceId
 */
export const useDeviceEvents = (deviceId: string): IDeviceEvents => {
  const { deviceStore, now } = useServices();
  const readEvents = useCallback(() => deviceStore.getEvents(deviceId), [deviceStore, deviceId]);
  const storedEvents = useSyncExternalStore(deviceStore.subscribeToEvents, readEvents);

  return useMemo(() => buildDeviceEvents(storedEvents, now()), [storedEvents, now]);
};
