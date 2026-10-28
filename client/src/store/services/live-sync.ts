import type { TServerMessage } from '@iot/shared';
import type { ILiveSync, ILiveSyncDeps, TStopListening } from '@/store/types';
import { createServerMessageHandlers, dispatchServerMessage } from '@/store/utils/server-message-handlers';

/**
 * @Description Wires the ws client into the store, and closes each frame
 * @param deps
 */
export const createLiveSync = ({ wsClient, deviceStore, diagnostics, frameLoop, now }: ILiveSyncDeps): ILiveSync => {
  const handlers = createServerMessageHandlers({ deviceStore, diagnostics, now });
  let stopListeners: TStopListening[] = [];

  const handleServerMessage = (message: TServerMessage) => {
    dispatchServerMessage(handlers, message);
  };

  const handleFrame = (timestamp: number) => {
    diagnostics.recordFrame(timestamp, deviceStore.commitFrame());
  };

  const start = () => {
    if (stopListeners.length > 0) {
      return;
    }

    stopListeners = [wsClient.subscribeToMessages(handleServerMessage), frameLoop.subscribe(handleFrame)];
  };

  const stop = () => {
    for (const stopListener of stopListeners) {
      stopListener();
    }

    stopListeners = [];
  };

  return { start, stop };
};
