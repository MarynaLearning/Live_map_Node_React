import { createEmitter, type TDeviceMessage } from '@iot/shared';
import { NORMAL_TICK_MS, STRESS_TICK_MS, TICK_JITTER } from '../constants/simulator';
import type { ISimulator, ISimulatorDeps, IVirtualDevice } from '../types/simulator';
import { randomBetween } from '../utils/random';

/**
 * @Description Runs every virtual device on its own interval and emits what they produce
 * @param deps
 */
export const createSimulator = ({ devices, random, now, stress }: ISimulatorDeps): ISimulator => {
  const emitter = createEmitter<TDeviceMessage>();
  let isStressEnabled = stress;
  let timers: ReturnType<typeof setInterval>[] = [];

  const startDeviceTimer = (device: IVirtualDevice) => {
    const baseTickMs = isStressEnabled ? STRESS_TICK_MS : NORMAL_TICK_MS;
    const tickMs = Math.max(1, Math.round(baseTickMs * randomBetween(random, 1 - TICK_JITTER, 1 + TICK_JITTER)));
    let lastTickAt = now();

    return setInterval(() => {
      const tickAt = now();
      const messages = device.tick(tickAt, tickAt - lastTickAt);

      lastTickAt = tickAt;

      for (const message of messages) {
        emitter.emit(message);
      }
    }, tickMs);
  };

  const start = () => {
    if (timers.length > 0) {
      return;
    }

    timers = devices.map(startDeviceTimer);
  };

  const stop = () => {
    for (const timer of timers) {
      clearInterval(timer);
    }

    timers = [];
  };

  const setStressMode = (enabled: boolean) => {
    if (enabled === isStressEnabled) {
      return;
    }

    const isRunning = timers.length > 0;

    isStressEnabled = enabled;
    stop();

    if (isRunning) {
      start();
    }
  };

  const isStressMode = () => isStressEnabled;

  const subscribe = emitter.subscribe;

  return { start, stop, setStressMode, isStressMode, subscribe };
};
