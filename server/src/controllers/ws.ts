import type { RawData, WebSocket } from 'ws';
import type { IWsController, IWsControllerDeps } from '../types/ws';
import { parseClientMessage } from '../utils/parse-client-message';

/**
 * @Description Handles WebSocket connections: opens a session, watches that the client is still alive (ping/pong), forwards valid client messages and cleans up when the socket goes away
 * @param deps
 */
export const createWsController = ({ connections, openSession, watchLiveness }: IWsControllerDeps): IWsController => {
  const handleConnection = (socket: WebSocket) => {
    const session = openSession(socket);
    const sessionId = connections.add(session);
    const liveness = watchLiveness(socket);

    const handleSocketMessage = (data: RawData) => {
      const message = parseClientMessage(data);

      if (message !== null) {
        session.handleClientMessage(message);
      }
    };

    const endSession = () => {
      liveness.stop();
      session.dispose();
      connections.remove(sessionId);
    };

    socket.on('message', handleSocketMessage);
    socket.on('close', endSession);
    socket.on('error', endSession);
  };

  return { handleConnection };
};
