import { useConnectionState, useServices } from '@/hooks';
import { ConnectionStatus } from '@/websocket';
import { DEBUG_TEXT } from '@/features/debug-controls/constants';
import type { IConnectionControlsView } from '@/features/debug-controls/types';
import { useRequestRunner } from './use-request-runner';

/**
 * @Description Drops all clients on the server (they reconnect)
 * and disconnects/connects this client
 */
export const useConnectionControls = (): IConnectionControlsView => {
  const { debugApi, wsClient } = useServices();
  const connectionState = useConnectionState();
  const { isBusy, errorText, runRequest } = useRequestRunner();
  const isManuallyDisconnected = connectionState.status === ConnectionStatus.DISCONNECTED;
  const connectionButtonLabel = isManuallyDisconnected ? DEBUG_TEXT.CONNECT : DEBUG_TEXT.DISCONNECT;

  const dropAllConnections = () => {
    void runRequest(async () => {
      await debugApi.dropAllConnections();
    });
  };

  const toggleConnection = () => {
    if (isManuallyDisconnected) {
      wsClient.connect();
    } else {
      wsClient.disconnect();
    }
  };

  return { isBusy, errorText, connectionButtonLabel, dropAllConnections, toggleConnection };
};
