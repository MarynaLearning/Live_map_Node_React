import { Router } from 'express';
import type { IDebugController } from '../types/debug';

/**
 * @Description Maps the debug URLs to the debug controller
 * @param controller
 */
export const createDebugRouter = (controller: IDebugController): Router => {
  const router = Router();

  router.get('/status', controller.getStatus);
  router.post('/stress', controller.setStress);
  router.post('/drop-connections', controller.dropConnections);
  router.post('/chaos', controller.updateChaos);

  return router;
};
