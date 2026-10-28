export const CONNECTION_VIEW_REFRESH_MS = 100;

export const CONNECTION_TEXT = {
  LIVE: 'Live',
  LIVE_DETAIL: 'Connected to gateway',
  CONNECTING: 'Connecting',
  CONNECTING_DETAIL: 'Opening connection to gateway…',
  LOST: 'Offline',
  LOST_RETRY_PREFIX: 'Connection lost · retry in',
  LOST_RECONNECTING: 'Connection lost · reconnecting…',
  DISCONNECTED: 'Disconnected',
  DISCONNECTED_DETAIL: 'Disconnected by you · press Connect',
  BANNER_SUFFIX: 'device status unknown',
} as const;
