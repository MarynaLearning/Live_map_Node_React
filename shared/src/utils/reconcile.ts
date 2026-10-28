import { SEEN_WINDOW_SIZE } from '../constants/reconcile';
import { MessageType, type TDeviceMessage } from '../types/protocol';
import { ReconcileResult, type IMessageId, type IReconcileState } from '../types/reconcile';

/**
 * @Description Creates an empty per-device reconcile state
 */
export const createReconcileState = (): IReconcileState => ({
  latestState: null,
  seenKeys: {},
  seenOrder: [],
});

/**
 * @Description Orders two message ids: a higher bootId wins, then a higher seq.
 * @param left
 * @param right
 */
export const compareMessageIds = (left: IMessageId, right: IMessageId): number => {
  if (left.bootId !== right.bootId) {
    return left.bootId - right.bootId;
  }

  return left.seq - right.seq;
};

const buildMessageKey = (id: IMessageId): string => `${id.bootId}:${id.seq}`;

const rememberMessageKey = (state: IReconcileState, key: string, windowSize: number): void => {
  state.seenKeys[key] = true;
  state.seenOrder.push(key);

  if (state.seenOrder.length <= windowSize) {
    return;
  }

  const evictedKey = state.seenOrder.shift();

  if (evictedKey !== undefined) {
    delete state.seenKeys[evictedKey];
  }
};

/**
 * @Description Classifies an incoming message of one device (duplicate / out of order / stale boot / accepted) and records it in that device's state. Mutates state.
 * @param state
 * @param message
 * @param windowSize
 */
export const reconcileMessage = (
  state: IReconcileState,
  message: TDeviceMessage,
  windowSize: number = SEEN_WINDOW_SIZE,
): ReconcileResult => {
  const key = buildMessageKey(message);

  if (state.seenKeys[key]) {
    return ReconcileResult.DUPLICATE;
  }

  rememberMessageKey(state, key, windowSize);

  if (message.type === MessageType.EVENT) {
    return ReconcileResult.ACCEPTED;
  }

  const latest = state.latestState;

  if (latest !== null && message.bootId < latest.bootId) {
    return ReconcileResult.STALE_BOOT;
  }

  if (latest !== null && compareMessageIds(message, latest) < 0) {
    return ReconcileResult.OUT_OF_ORDER;
  }

  state.latestState = { bootId: message.bootId, seq: message.seq };

  return ReconcileResult.ACCEPTED;
};
