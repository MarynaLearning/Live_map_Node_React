import { WS_PATH } from '@iot/shared';

/**
 * @Description Builds the gateway WebSocket URL on the same host as the page (ws:// or wss://)
 * @param location
 */
export const buildWsUrl = (location: Pick<Location, 'protocol' | 'host'>): string => {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

  return `${protocol}//${location.host}${WS_PATH}`;
};
