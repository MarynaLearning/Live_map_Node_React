export const DEVICE_ID_PREFIX = 'device-';

/** ~10 msg/s per device in normal mode (task: 5–10). */
export const NORMAL_TICK_MS = 100;

/** ~90 msg/s per device in stress mode: 8 devices ≈ 700 msg/s plus duplicates. */
export const STRESS_TICK_MS = 11;

/** Each device's interval is randomised by ±15% so devices are not in lockstep. */
export const TICK_JITTER = 0.15;

export const CLOCK_OFFSET_MAX_MS = 1500;

export const DEVICE_SPEED_PER_SECOND = 60;

export const MAX_TURN_RADIANS_PER_SECOND = 1.2;

// Rates are per second so behaviour is the same in normal and stress mode.
export const OFFLINE_RATE_PER_SECOND = 1 / 60;

export const OFFLINE_MIN_MS = 3000;

export const OFFLINE_MAX_MS = 14000;

export const REBOOT_RATE_PER_SECOND = 1 / 90;

export const ALERT_RATE_PER_SECOND = 1 / 20;

export const BATTERY_START_MIN = 30;

export const BATTERY_START_MAX = 100;

export const BATTERY_DRAIN_PER_SECOND = 0.4;

export const LOW_BATTERY_PERCENT = 20;

/** Below this the battery is "swapped" back to 100% so the demo keeps cycling. */
export const BATTERY_SWAP_PERCENT = 5;

export const SENSOR_BASE = 22;

export const SENSOR_AMPLITUDE = 6;

export const SENSOR_PERIOD_SECONDS = 20;

export const SENSOR_NOISE = 0.4;

export const SENSOR_DECIMALS = 2;

export const POSITION_DECIMALS = 1;
