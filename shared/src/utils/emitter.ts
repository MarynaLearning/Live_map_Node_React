import type { IEmitter, TListener } from '../types/emitter';

/**
 * @Description Creates a tiny synchronous pub/sub emitter
 */
export const createEmitter = <TValue>(): IEmitter<TValue> => {
  let listeners: TListener<TValue>[] = [];

  const subscribe = (listener: TListener<TValue>) => {
    listeners = [...listeners, listener];

    return () => {
      listeners = listeners.filter((item) => item !== listener);
    };
  };

  const emit = (value: TValue) => {
    for (const listener of listeners) {
      listener(value);
    }
  };

  return { subscribe, emit };
};
