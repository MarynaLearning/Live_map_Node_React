import { useCallback, useState } from 'react';
import type { IRequestRunner } from '@/features/debug-controls/types';
import { extractErrorMessage } from '@/features/debug-controls/utils/error-message';

/**
 * @Description Tracks busy and error state of an async request
 */
export const useRequestRunner = (): IRequestRunner => {
  const [isBusy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const runRequest = useCallback(async (request: () => Promise<void>) => {
    setBusy(true);
    setErrorText(null);

    try {
      await request();
    } catch (error) {
      setErrorText(extractErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, []);

  return { isBusy, errorText, runRequest };
};
