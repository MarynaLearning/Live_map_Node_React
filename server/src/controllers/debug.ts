import { DROP_CLOSE_CODE, DROP_CLOSE_REASON } from '../constants/debug';
import { TEXT } from '../constants/text';
import type { IDebugController, IDebugControllerDeps, TRouteHandler } from '../types/debug';
import { readChaosPatch, readStressFlag } from '../utils/parse-debug-body';
import { buildDebugStatusView, buildDropConnectionsView } from '../views/debug-status';

/**
 * @Description Debug endpoints: status, stress mode, force-drop connections, runtime chaos settings
 * @param deps
 */
export const createDebugController = ({ simulator, chaos, connections, deviceCount }: IDebugControllerDeps): IDebugController => {
  const buildStatus = () =>
    buildDebugStatusView({
      stressMode: simulator.isStressMode(),
      deviceCount,
      chaos: chaos.getSettings(),
      sessions: connections.listStats(),
    });

  const getStatus: TRouteHandler = (_request, response) => {
    response.json(buildStatus());
  };

  const setStress: TRouteHandler = (request, response) => {
    const enabled = readStressFlag(request.body);

    if (enabled === null) {
      response.status(400).json({ error: TEXT.INVALID_STRESS_BODY });

      return;
    }

    simulator.setStressMode(enabled);
    response.json(buildStatus());
  };

  const dropConnections: TRouteHandler = (_request, response) => {
    const dropped = connections.dropAll(DROP_CLOSE_CODE, DROP_CLOSE_REASON);

    response.json(buildDropConnectionsView(dropped));
  };

  const updateChaos: TRouteHandler = (request, response) => {
    chaos.updateSettings(readChaosPatch(request.body));
    response.json(buildStatus());
  };

  return { getStatus, setStress, dropConnections, updateChaos };
};
