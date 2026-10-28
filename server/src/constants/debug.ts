import type { IChaosSettings } from '../types/chaos';

/** Application close code for a forced drop; any non-1000 close makes the client reconnect. */
export const DROP_CLOSE_CODE = 4000;

export const DROP_CLOSE_REASON = 'debug drop';

/** Fields accepted by POST /debug/chaos. */
export const CHAOS_SETTING_KEYS: (keyof IChaosSettings)[] = ['delayProbability', 'minDelayMs', 'maxDelayMs', 'duplicateProbability'];
