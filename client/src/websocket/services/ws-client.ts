import { createEmitter, type TClientMessage, type TServerMessage } from '@iot/shared';
import { INITIAL_CONNECTION_STATE } from '@/websocket/constants';
import { ConnectionStatus, type IConnectionState, type IWsClient, type IWsClientDeps } from '@/websocket/types';
import { parseServerMessage } from '@/websocket/utils/parse-server-message';

/**
 * @Description Owns the WebSocket outside React: connects, reconnects with backoff, detects dead sockets and publishes messages and connection state
 * @param deps
 */
export const createWsClient = ({ url, createSocket, backoff, watchdog, now }: IWsClientDeps): IWsClient => {
  const connectionEmitter = createEmitter<IConnectionState>();
  const messageEmitter = createEmitter<TServerMessage>();
  let connectionState: IConnectionState = INITIAL_CONNECTION_STATE;
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let shouldReconnect = false;

  const updateConnectionState = (patch: Partial<IConnectionState>) => {
    connectionState = { ...connectionState, ...patch };
    connectionEmitter.emit(connectionState);
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer === null) {
      return;
    }

    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  // Detaches handlers first, so a socket that is slow to close can never fire into a newer connection.
  const releaseSocket = () => {
    watchdog.stop();

    if (socket === null) {
      return;
    }

    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.close();
    socket = null;
  };

  const scheduleReconnect = () => {
    const delayMs = backoff.nextDelayMs();

    updateConnectionState({
      status: ConnectionStatus.RECONNECTING,
      retryAt: now() + delayMs,
      attempt: connectionState.attempt + 1,
    });
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      openSocket();
    }, delayMs);
  };

  const handleConnectionLost = () => {
    releaseSocket();

    if (shouldReconnect) {
      scheduleReconnect();

      return;
    }

    updateConnectionState({ status: ConnectionStatus.DISCONNECTED, retryAt: null });
  };

  const handleIncomingData = (data: unknown) => {
    watchdog.feed();

    const message = parseServerMessage(data);

    if (message !== null) {
      messageEmitter.emit(message);
    }
  };

  const handleSocketOpen = () => {
    backoff.reset();
    updateConnectionState({ status: ConnectionStatus.OPEN, retryAt: null, attempt: 0 });
    watchdog.start(handleConnectionLost);
  };

  const openSocket = () => {
    updateConnectionState({ status: ConnectionStatus.CONNECTING, retryAt: null });

    const nextSocket = createSocket(url);

    nextSocket.onopen = handleSocketOpen;
    nextSocket.onmessage = (event) => {
      handleIncomingData(event.data);
    };
    nextSocket.onclose = handleConnectionLost;
    socket = nextSocket;
  };

  const connect = () => {
    if (socket !== null || reconnectTimer !== null) {
      return;
    }

    shouldReconnect = true;
    openSocket();
  };

  const disconnect = () => {
    shouldReconnect = false;
    clearReconnectTimer();
    releaseSocket();
    updateConnectionState({ status: ConnectionStatus.DISCONNECTED, retryAt: null, attempt: 0 });
  };

  const isWaitingToReconnect = () => shouldReconnect && socket === null;

  const pauseRetry = () => {
    if (!isWaitingToReconnect() || reconnectTimer === null) {
      return;
    }

    clearReconnectTimer();
    updateConnectionState({ retryAt: null });
  };

  const retryNow = () => {
    if (!isWaitingToReconnect()) {
      return;
    }

    clearReconnectTimer();
    openSocket();
  };

  const sendMessage = (message: TClientMessage): boolean => {
    if (socket === null || connectionState.status !== ConnectionStatus.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(message));

    return true;
  };

  const getConnectionState = () => connectionState;

  const subscribeToConnection = connectionEmitter.subscribe;

  const subscribeToMessages = messageEmitter.subscribe;

  return {
    connect,
    disconnect,
    pauseRetry,
    retryNow,
    sendMessage,
    getConnectionState,
    subscribeToConnection,
    subscribeToMessages,
  };
};
