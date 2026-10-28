import { useConnectionState } from '@/hooks/use-connection-state';
import { useIntervalValue } from '@/hooks/use-interval-value';
import { useServices } from '@/hooks/use-services';
import { CONNECTION_VIEW_REFRESH_MS } from '@/features/connection-status/constants';
import type { IConnectionView } from '@/features/connection-status/types';
import { buildConnectionView } from '@/features/connection-status/utils/connection-view';

/**
 * @Description Connection status for the header badge and the map banner, with a ticking retry countdown
 */
export const useConnectionView = (): IConnectionView => {
  const { now } = useServices();
  const connectionState = useConnectionState();
  const currentTime = useIntervalValue(now, CONNECTION_VIEW_REFRESH_MS);

  return buildConnectionView(connectionState, currentTime);
};
