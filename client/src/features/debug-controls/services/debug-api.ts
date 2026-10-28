import type { IDebugApi, IDebugStatus, IDropConnectionsResult } from '@/types/services';
import { DEBUG_ENDPOINTS, DEBUG_TEXT } from '@/features/debug-controls/constants';
import type { IDebugApiDeps } from '@/features/debug-controls/types';

/**
 * @Description HTTP client for the gateway debug endpoints
 * @param deps
 */
export const createDebugApi = ({ baseUrl, fetchJson }: IDebugApiDeps): IDebugApi => {
  const requestJson = async <TResult>(path: string, init?: RequestInit): Promise<TResult> => {
    const response = await fetchJson(`${baseUrl}${path}`, init);

    if (!response.ok) {
      throw new Error(`${DEBUG_TEXT.REQUEST_FAILED} ${response.status}`);
    }

    return (await response.json()) as TResult;
  };

  const postJson = <TResult>(path: string, body: unknown = {}): Promise<TResult> =>
    requestJson<TResult>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const getStatus = () => requestJson<IDebugStatus>(DEBUG_ENDPOINTS.STATUS);

  const setStressMode = (enabled: boolean) => postJson<IDebugStatus>(DEBUG_ENDPOINTS.STRESS, { enabled });

  const dropAllConnections = () => postJson<IDropConnectionsResult>(DEBUG_ENDPOINTS.DROP_CONNECTIONS);

  return { getStatus, setStressMode, dropAllConnections };
};
