import type { TUnsubscribe } from '@iot/shared';
import {
  ConnectionStatus,
  type IConnectionRecovery,
  type IConnectionRecoveryDeps,
  type IConnectionState,
} from '@/websocket/types';

/**
 * @Description Makes reconnecting fit the user:
 * no attempts while the tab is hidden (nobody is looking),
 * and an immediate attempt when the tab becomes visible again or the browser reports the network is back
 * @param deps
 */
export const createConnectionRecovery = ({ wsClient, environment }: IConnectionRecoveryDeps): IConnectionRecovery => {
  let stopListeners: TUnsubscribe[] = [];

  const handleConnectionChange = (state: IConnectionState) => {
    const isRetryScheduled = state.status === ConnectionStatus.RECONNECTING && state.retryAt !== null;

    if (isRetryScheduled && !environment.isPageVisible()) {
      wsClient.pauseRetry();
    }
  };

  const handleVisibilityChange = (isVisible: boolean) => {
    if (isVisible) {
      wsClient.retryNow();
    } else {
      wsClient.pauseRetry();
    }
  };

  const handleOnline = () => {
    wsClient.retryNow();
  };

  const start = () => {
    if (stopListeners.length > 0) {
      return;
    }

    stopListeners = [
      wsClient.subscribeToConnection(handleConnectionChange),
      environment.subscribeToVisibility(handleVisibilityChange),
      environment.subscribeToOnline(handleOnline),
    ];
  };

  const stop = () => {
    for (const stopListener of stopListeners) {
      stopListener();
    }

    stopListeners = [];
  };

  return { start, stop };
};
