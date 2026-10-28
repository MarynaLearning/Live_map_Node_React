import { useEffect, useState } from 'react';
import { useConnectionState, useServices } from '@/hooks';
import { ConnectionStatus } from '@/websocket';
import type { IStressModeView } from '@/features/debug-controls/types';
import { useRequestRunner } from './use-request-runner';

/**
 * @Description Keeps the state in sync with the server and switches it on/off
 */
export const useStressMode = (): IStressModeView => {
  const { debugApi } = useServices();
  const connectionState = useConnectionState();
  const { isBusy, errorText, runRequest } = useRequestRunner();
  const [isStressMode, setStressMode] = useState(false);
  const isOpen = connectionState.status === ConnectionStatus.OPEN;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void runRequest(async () => {
      const status = await debugApi.getStatus();

      setStressMode(status.stressMode);
    });
  }, [isOpen, debugApi, runRequest]);

  const toggleStressMode = (enabled: boolean) => {
    void runRequest(async () => {
      const status = await debugApi.setStressMode(enabled);

      setStressMode(status.stressMode);
    });
  };

  return { isStressMode, isBusy, errorText, toggleStressMode };
};
