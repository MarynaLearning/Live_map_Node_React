import type { WebSocket } from 'ws';
import type { TWatchLiveness } from './liveness';
import type { IConnectionRegistry, TOpenSession } from './session';

export interface IWsController {
  handleConnection(socket: WebSocket): void;
}

export interface IWsControllerDeps {
  connections: IConnectionRegistry;
  openSession: TOpenSession;
  watchLiveness: TWatchLiveness;
}
