import {
  DeviceEventKind,
  MessageType,
  WORLD_SIZE,
  type IDeviceMessageBase,
  type IEventMessage,
  type IStateMessage,
  type TDeviceMessage,
} from '@iot/shared';
import {
  ALERT_RATE_PER_SECOND,
  BATTERY_DRAIN_PER_SECOND,
  BATTERY_START_MAX,
  BATTERY_START_MIN,
  BATTERY_SWAP_PERCENT,
  CLOCK_OFFSET_MAX_MS,
  DEVICE_ID_PREFIX,
  DEVICE_SPEED_PER_SECOND,
  LOW_BATTERY_PERCENT,
  MAX_TURN_RADIANS_PER_SECOND,
  OFFLINE_MAX_MS,
  OFFLINE_MIN_MS,
  OFFLINE_RATE_PER_SECOND,
  POSITION_DECIMALS,
  REBOOT_RATE_PER_SECOND,
  SENSOR_AMPLITUDE,
  SENSOR_BASE,
  SENSOR_DECIMALS,
  SENSOR_NOISE,
  SENSOR_PERIOD_SECONDS,
} from '../constants/simulator';
import type { IDeviceFleetOptions, IVirtualDevice, IVirtualDeviceOptions, IVirtualDeviceState } from '../types/simulator';
import { roundTo } from '../utils/math';
import { createRandomVelocity, moveWithinBounds, steerVelocity } from '../utils/motion';
import { randomBetween, rollChance } from '../utils/random';

/**
 * @Description Creates one virtual device: it moves, reports a sensor value, drains its battery, emits events, goes offline and reboots
 * @param options
 */
export const createVirtualDevice = ({ deviceId, clockOffsetMs, startedAt, random }: IVirtualDeviceOptions): IVirtualDevice => {
  const state: IVirtualDeviceState = {
    bootId: 1,
    seq: 0,
    position: { x: randomBetween(random, 0, WORLD_SIZE), y: randomBetween(random, 0, WORLD_SIZE) },
    velocity: createRandomVelocity(random, DEVICE_SPEED_PER_SECOND),
    sensorPhase: randomBetween(random, 0, Math.PI * 2),
    battery: randomBetween(random, BATTERY_START_MIN, BATTERY_START_MAX),
    offlineUntil: 0,
    isLowBatteryReported: false,
  };

  const takeMessageBase = (now: number): IDeviceMessageBase => {
    const base = { deviceId, bootId: state.bootId, seq: state.seq, ts: now + clockOffsetMs };

    state.seq += 1;

    return base;
  };

  const rebootDevice = () => {
    state.bootId += 1;
    state.seq = 0;
  };

  const startOfflinePeriod = (now: number) => {
    state.offlineUntil = now + randomBetween(random, OFFLINE_MIN_MS, OFFLINE_MAX_MS);
  };

  const moveDevice = (elapsedSeconds: number) => {
    const velocity = steerVelocity(state.velocity, random, MAX_TURN_RADIANS_PER_SECOND * elapsedSeconds);
    const movement = moveWithinBounds({ position: state.position, velocity }, elapsedSeconds, WORLD_SIZE);

    state.position = movement.position;
    state.velocity = movement.velocity;
  };

  const drainBattery = (elapsedSeconds: number) => {
    state.battery -= BATTERY_DRAIN_PER_SECOND * elapsedSeconds;

    if (state.battery <= BATTERY_SWAP_PERCENT) {
      state.battery = BATTERY_START_MAX;
      state.isLowBatteryReported = false;
    }
  };

  const readSensor = (now: number): number => {
    const seconds = (now - startedAt) / 1000;
    const wave = Math.sin((seconds * 2 * Math.PI) / SENSOR_PERIOD_SECONDS + state.sensorPhase);
    const noise = randomBetween(random, -SENSOR_NOISE, SENSOR_NOISE);

    return roundTo(SENSOR_BASE + SENSOR_AMPLITUDE * wave + noise, SENSOR_DECIMALS);
  };

  const buildStateMessage = (now: number, sensor: number): IStateMessage => ({
    ...takeMessageBase(now),
    type: MessageType.STATE,
    payload: {
      x: roundTo(state.position.x, POSITION_DECIMALS),
      y: roundTo(state.position.y, POSITION_DECIMALS),
      sensor,
      battery: Math.round(state.battery),
    },
  });

  const buildEventMessage = (now: number, kind: DeviceEventKind, message: string): IEventMessage => ({
    ...takeMessageBase(now),
    type: MessageType.EVENT,
    payload: { kind, message },
  });

  const collectEvents = (now: number, sensor: number, elapsedSeconds: number): IEventMessage[] => {
    const events: IEventMessage[] = [];

    if (!state.isLowBatteryReported && state.battery <= LOW_BATTERY_PERCENT) {
      state.isLowBatteryReported = true;
      events.push(buildEventMessage(now, DeviceEventKind.LOW_BATTERY, `Battery at ${Math.round(state.battery)}%`));
    }

    if (rollChance(random, ALERT_RATE_PER_SECOND * elapsedSeconds)) {
      events.push(buildEventMessage(now, DeviceEventKind.ALERT, `Sensor reading ${sensor}`));
    }

    return events;
  };

  const tick = (now: number, elapsedMs: number): TDeviceMessage[] => {
    const elapsedSeconds = elapsedMs / 1000;

    if (now < state.offlineUntil) {
      return [];
    }

    if (rollChance(random, OFFLINE_RATE_PER_SECOND * elapsedSeconds)) {
      startOfflinePeriod(now);

      return [];
    }

    if (rollChance(random, REBOOT_RATE_PER_SECOND * elapsedSeconds)) {
      rebootDevice();
    }

    moveDevice(elapsedSeconds);
    drainBattery(elapsedSeconds);

    const sensor = readSensor(now);

    return [buildStateMessage(now, sensor), ...collectEvents(now, sensor, elapsedSeconds)];
  };

  return { deviceId, tick };
};

/**
 * @Description Creates the hardcoded fleet of virtual devices, each with its own clock offset
 * @param options
 */
export const createDeviceFleet = ({ count, random, now }: IDeviceFleetOptions): IVirtualDevice[] => {
  const startedAt = now();

  return Array.from({ length: count }, (_, index) =>
    createVirtualDevice({
      deviceId: `${DEVICE_ID_PREFIX}${index + 1}`,
      clockOffsetMs: Math.round(randomBetween(random, -CLOCK_OFFSET_MAX_MS, CLOCK_OFFSET_MAX_MS)),
      startedAt,
      random,
    }),
  );
};
