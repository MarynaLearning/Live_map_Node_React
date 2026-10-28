import {
  DEFAULT_CHAOS_SETTINGS,
  DEFAULT_DEVICE_COUNT,
  DEFAULT_PORT,
  DEFAULT_STRESS,
  ENV_KEYS,
  MAX_DEVICE_COUNT,
  MIN_DEVICE_COUNT,
} from '../constants/server';
import type { IChaosSettings } from '../types/chaos';
import type { IServerConfig } from '../types/config';
import { mergeChaosSettings } from '../utils/chaos-settings';
import { readBooleanEnv, readNumberEnv } from '../utils/env';
import { clamp } from '../utils/math';

const readChaosSettings = (env: NodeJS.ProcessEnv): IChaosSettings =>
  mergeChaosSettings(DEFAULT_CHAOS_SETTINGS, {
    delayProbability: readNumberEnv(env, ENV_KEYS.CHAOS_DELAY_PROBABILITY, DEFAULT_CHAOS_SETTINGS.delayProbability),
    minDelayMs: readNumberEnv(env, ENV_KEYS.CHAOS_MIN_DELAY_MS, DEFAULT_CHAOS_SETTINGS.minDelayMs),
    maxDelayMs: readNumberEnv(env, ENV_KEYS.CHAOS_MAX_DELAY_MS, DEFAULT_CHAOS_SETTINGS.maxDelayMs),
    duplicateProbability: readNumberEnv(env, ENV_KEYS.CHAOS_DUPLICATE_PROBABILITY, DEFAULT_CHAOS_SETTINGS.duplicateProbability),
  });

const readDeviceCount = (env: NodeJS.ProcessEnv): number => {
  const deviceCount = readNumberEnv(env, ENV_KEYS.DEVICE_COUNT, DEFAULT_DEVICE_COUNT);

  return Math.round(clamp(deviceCount, MIN_DEVICE_COUNT, MAX_DEVICE_COUNT));
};

/**
 * @Description Builds the server config from environment variables with safe defaults
 * @param env
 */
export const readServerConfig = (env: NodeJS.ProcessEnv): IServerConfig => ({
  port: readNumberEnv(env, ENV_KEYS.PORT, DEFAULT_PORT),
  deviceCount: readDeviceCount(env),
  stress: readBooleanEnv(env, ENV_KEYS.STRESS, DEFAULT_STRESS),
  chaos: readChaosSettings(env),
});
