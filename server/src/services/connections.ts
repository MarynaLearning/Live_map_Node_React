import type { IConnectionRegistry, ISession } from '../types/session';

/**
 * @Description Tracks live sessions so they can be counted, inspected and force-dropped
 */
export const createConnectionRegistry = (): IConnectionRegistry => {
  const sessions: Record<string, ISession> = {};
  let nextSessionNumber = 1;

  const add = (session: ISession) => {
    const sessionId = `session-${nextSessionNumber}`;

    nextSessionNumber += 1;
    sessions[sessionId] = session;

    return sessionId;
  };

  const remove = (sessionId: string) => {
    delete sessions[sessionId];
  };

  const dropAll = (code: number, reason: string) => {
    const sessionIds = Object.keys(sessions);

    for (const sessionId of sessionIds) {
      sessions[sessionId]?.close(code, reason);
      remove(sessionId);
    }

    return sessionIds.length;
  };

  const count = () => Object.keys(sessions).length;

  const listStats = () => Object.entries(sessions).map(([sessionId, session]) => session.getStats(sessionId));

  return { add, remove, dropAll, count, listStats };
};
