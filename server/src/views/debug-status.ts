import type { IDebugStatusInput, IDebugStatusView, IDropConnectionsView } from '../types/debug';

/**
 * @Description Builds the JSON body returned by the debug endpoints, including per-client throttle and buffer stats
 * @param status
 */
export const buildDebugStatusView = (status: IDebugStatusInput): IDebugStatusView => ({
  ...status,
  connections: status.sessions.length,
});

/**
 * @Description Builds the JSON body returned after force-dropping connections
 * @param dropped
 */
export const buildDropConnectionsView = (dropped: number): IDropConnectionsView => ({ dropped });
