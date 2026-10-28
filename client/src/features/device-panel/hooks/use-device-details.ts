import { useIntervalValue } from '@/hooks/use-interval-value';
import { useServices } from '@/hooks/use-services';
import { ConnectionStatus } from '@/websocket';
import { DETAILS_REFRESH_MS } from '@/features/device-panel/constants';
import type { IDeviceDetails } from '@/features/device-panel/types';
import { buildDeviceDetails } from '@/features/device-panel/utils/device-details';

/**
 * @Description Keeps the live details of one device up to date;
 * re-reads it on a timer because the status changes with time
 * @param deviceId
 */
export const useDeviceDetails = (deviceId: string): IDeviceDetails => {
  const { deviceStore, wsClient, now } = useServices();

  return useIntervalValue(
    () =>
      buildDeviceDetails(
        { now: now(), isConnectionOpen: wsClient.getConnectionState().status === ConnectionStatus.OPEN },
        deviceStore.getDevice(deviceId),
      ),
    DETAILS_REFRESH_MS,
    deviceId,
  );
};
