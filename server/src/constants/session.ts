/** Above this many unsent bytes in the socket, the client counts as slow ("congested"). */
export const OUTBOX_HIGH_WATER_BYTES = 512 * 1024;

/** Events are never dropped; if this many pile up for a slow client, it is disconnected and resyncs by snapshot. */
export const MAX_QUEUED_EVENTS = 1000;

export const SLOW_CONSUMER_CLOSE_CODE = 4008;

export const SLOW_CONSUMER_CLOSE_REASON = 'slow consumer';

/**
 * Server-side liveness: a WebSocket ping is sent this often; a client that has not answered the previous ping
 * (browser killed the socket, network gone, laptop asleep) is terminated, so a dead session is removed within ≤ 2 intervals.
 */
export const PING_INTERVAL_MS = 10_000;

/** Without a maxHz limit, pending states (only when congested) are retried this often. */
export const UNLIMITED_FLUSH_INTERVAL_MS = 50;
