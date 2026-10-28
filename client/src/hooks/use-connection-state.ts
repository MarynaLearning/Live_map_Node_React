import { useSyncExternalStore } from 'react';
import type { IConnectionState } from '@/websocket';
import { useServices } from './use-services';

/**
 * @Description Subscribes a component to the ws client connection state
 */
export const useConnectionState = (): IConnectionState => {
  const { wsClient } = useServices();

  return useSyncExternalStore(wsClient.subscribeToConnection, wsClient.getConnectionState);
};
