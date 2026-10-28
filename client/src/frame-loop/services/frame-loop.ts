import type { IFrameLoop, IFrameLoopDeps, TFrameCallback } from '@/frame-loop/types';

/**
 * @Description Creates requestAnimationFrame loop for the whole app: map, chart and diagnostics draw at the display rate
 * @param deps
 */
export const createFrameLoop = ({ requestFrame, cancelFrame }: IFrameLoopDeps): IFrameLoop => {
  let callbacks: TFrameCallback[] = [];
  let frameId: number | null = null;

  const runFrame = (timestamp: number) => {
    frameId = requestFrame(runFrame);

    for (const callback of callbacks) {
      callback(timestamp);
    }
  };

  const start = () => {
    if (frameId !== null) {
      return;
    }

    frameId = requestFrame(runFrame);
  };

  const stop = () => {
    if (frameId === null) {
      return;
    }

    cancelFrame(frameId);
    frameId = null;
  };

  const subscribe = (callback: TFrameCallback) => {
    callbacks = [...callbacks, callback];

    return () => {
      callbacks = callbacks.filter((item) => item !== callback);
    };
  };

  return { start, stop, subscribe };
};
