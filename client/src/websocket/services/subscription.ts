import { ClientMessageType, createEmitter, type ISubscription, type TUnsubscribe } from '@iot/shared';
import { ConnectionStatus, type IConnectionState, type ISubscriptionService, type ISubscriptionServiceDeps } from '@/websocket/types';

/**
 * @Description Owns the wanted subscription (devices + maxHz): on every connection open sends hello with it and the last seen ids, on every change sends subscribe
 * @param deps
 */
export const createSubscriptionService = ({ wsClient, initialSubscription, readLastSeen }: ISubscriptionServiceDeps): ISubscriptionService => {
  const changeEmitter = createEmitter<ISubscription>();
  let subscription: ISubscription = initialSubscription;
  let stopListening: TUnsubscribe | null = null;

  const sendHello = () => {
    wsClient.sendMessage({ type: ClientMessageType.HELLO, subscription, lastSeen: readLastSeen() });
  };

  const sendSubscription = () => {
    wsClient.sendMessage({ type: ClientMessageType.SUBSCRIBE, ...subscription });
  };

  const handleConnectionChange = (state: IConnectionState) => {
    if (state.status === ConnectionStatus.OPEN) {
      sendHello();
    }
  };

  const start = () => {
    if (stopListening !== null) {
      return;
    }

    stopListening = wsClient.subscribeToConnection(handleConnectionChange);
  };

  const stop = () => {
    stopListening?.();
    stopListening = null;
  };

  const updateSubscription = (patch: Partial<ISubscription>) => {
    subscription = { ...subscription, ...patch };
    changeEmitter.emit(subscription);
    sendSubscription();
  };

  const getSubscription = () => subscription;

  const subscribeToChanges = changeEmitter.subscribe;

  return { start, stop, getSubscription, updateSubscription, subscribeToChanges };
};
