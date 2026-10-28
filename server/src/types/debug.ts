import type { Request, Response } from 'express';
import type { IChaosLayer, IChaosSettings } from './chaos';
import type { IConnectionRegistry, ISessionStats } from './session';
import type { ISimulator } from './simulator';

export type TRouteHandler = (request: Request, response: Response) => void;

export interface IDebugController {
  getStatus: TRouteHandler;
  setStress: TRouteHandler;
  dropConnections: TRouteHandler;
  updateChaos: TRouteHandler;
}

export interface IDebugControllerDeps {
  simulator: ISimulator;
  chaos: IChaosLayer;
  connections: IConnectionRegistry;
  deviceCount: number;
}

export interface IDebugStatusInput {
  stressMode: boolean;
  deviceCount: number;
  chaos: IChaosSettings;
  sessions: ISessionStats[];
}

export interface IDebugStatusView extends IDebugStatusInput {
  connections: number;
}

export interface IDropConnectionsView {
  dropped: number;
}
