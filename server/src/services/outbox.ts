import type { IEventMessage, IStateMessage, TServerMessage } from '@iot/shared';
import { SOCKET_OPEN_STATE } from '../constants/server';
import type { IOutbox, IOutboxDeps } from '../types/session';
import { serializeMessage } from '../views/messages';

/**
 * @Description Bounded sending to one client: while the socket buffer is above the high-water mark, states are refused (the throttle coalesces them) and events wait in a capped queue; a full queue means the client is too slow and onOverflow fires
 * @param deps
 */
export const createOutbox = ({ socket, highWaterBytes, maxQueuedEvents, onOverflow }: IOutboxDeps): IOutbox => {
  let queuedEvents: IEventMessage[] = [];
  let hasOverflowed = false;

  const isOpen = () => socket.readyState === SOCKET_OPEN_STATE;

  const isCongested = () => socket.bufferedAmount > highWaterBytes;

  const writeMessage = (message: TServerMessage) => {
    socket.send(serializeMessage(message));
  };

  const drainQueuedEvents = () => {
    while (queuedEvents.length > 0 && !isCongested()) {
      const event = queuedEvents.shift();

      if (event !== undefined) {
        writeMessage(event);
      }
    }
  };

  const reportOverflow = () => {
    if (hasOverflowed) {
      return;
    }

    hasOverflowed = true;
    queuedEvents = [];
    onOverflow();
  };

  const sendControl = (message: TServerMessage) => {
    if (isOpen()) {
      writeMessage(message);
    }
  };

  const sendEvent = (message: IEventMessage) => {
    if (!isOpen()) {
      return;
    }

    queuedEvents.push(message);

    if (queuedEvents.length > maxQueuedEvents) {
      reportOverflow();

      return;
    }

    drainQueuedEvents();
  };

  const sendStates = (messages: IStateMessage[]): boolean => {
    if (!isOpen()) {
      return true;
    }

    drainQueuedEvents();

    if (isCongested() || queuedEvents.length > 0) {
      return false;
    }

    for (const message of messages) {
      writeMessage(message);
    }

    return true;
  };

  const getStats = () => ({ bufferedBytes: socket.bufferedAmount, queuedEvents: queuedEvents.length });

  return { sendControl, sendEvent, sendStates, getStats };
};
