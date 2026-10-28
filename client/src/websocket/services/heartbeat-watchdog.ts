import type { IHeartbeatWatchdog, IHeartbeatWatchdogDeps } from '@/websocket/types';

/**
 * @Description Detects a dead-but-open socket:
 * fires onTimeout when nothing arrived for timeoutMs.
 * @param deps
 */
export const createHeartbeatWatchdog = ({ timeoutMs, checkIntervalMs, now }: IHeartbeatWatchdogDeps): IHeartbeatWatchdog => {
  let lastActivityAt = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    if (timer === null) {
      return;
    }

    clearInterval(timer);
    timer = null;
  };

  const start = (onTimeout: () => void) => {
    stop();
    lastActivityAt = now();
    timer = setInterval(() => {
      if (now() - lastActivityAt <= timeoutMs) {
        return;
      }

      stop();
      onTimeout();
    }, checkIntervalMs);
  };

  const feed = () => {
    lastActivityAt = now();
  };

  return { start, feed, stop };
};
