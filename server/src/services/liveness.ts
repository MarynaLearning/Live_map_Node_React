import type { ILivenessMonitor, ILivenessMonitorDeps } from '../types/liveness';

/**
 * @Description Detects dead clients: pings the socket every interval and terminates it if the previous ping got no pong (the browser answers pings automatically)
 * @param deps
 */
export const createLivenessMonitor = ({ socket, intervalMs }: ILivenessMonitorDeps): ILivenessMonitor => {
  let hasAnsweredPing = true;
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    if (timer === null) {
      return;
    }

    clearInterval(timer);
    timer = null;
  };

  const markAlive = () => {
    hasAnsweredPing = true;
  };

  const checkLiveness = () => {
    if (!hasAnsweredPing) {
      stop();
      socket.terminate();

      return;
    }

    hasAnsweredPing = false;
    socket.ping();
  };

  socket.on('pong', markAlive);
  timer = setInterval(checkLiveness, intervalMs);

  return { stop };
};
