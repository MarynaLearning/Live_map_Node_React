import { createEmitter, type TDeviceMessage } from '@iot/shared';
import type { IChaosDeps, IChaosLayer, IChaosSettings } from '../types/chaos';
import { mergeChaosSettings } from '../utils/chaos-settings';
import { randomBetween, rollChance } from '../utils/random';

/**
 * @Description Sits between devices and the gateway: randomly delays some messages and duplicates a few, so delivery order differs from emission order
 * @param deps
 */
export const createChaosLayer = ({ settings, random }: IChaosDeps): IChaosLayer => {
  const emitter = createEmitter<TDeviceMessage>();
  let currentSettings: IChaosSettings = { ...settings };

  const deliverLater = (message: TDeviceMessage) => {
    const delayMs = randomBetween(random, currentSettings.minDelayMs, currentSettings.maxDelayMs);

    setTimeout(() => {
      emitter.emit(message);
    }, delayMs);
  };

  const send = (message: TDeviceMessage) => {
    if (rollChance(random, currentSettings.delayProbability)) {
      deliverLater(message);
    } else {
      emitter.emit(message);
    }

    if (rollChance(random, currentSettings.duplicateProbability)) {
      deliverLater(message);
    }
  };

  const updateSettings = (patch: Partial<IChaosSettings>) => {
    currentSettings = mergeChaosSettings(currentSettings, patch);

    return { ...currentSettings };
  };

  const getSettings = () => ({ ...currentSettings });

  const subscribe = emitter.subscribe;

  return { send, subscribe, getSettings, updateSettings };
};
