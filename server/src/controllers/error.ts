import type { NextFunction, Request, Response } from 'express';
import { TEXT } from '../constants/text';

const readClientErrorStatus = (error: unknown): number | null => {
  if (typeof error !== 'object' || error === null || !('status' in error) || typeof error.status !== 'number') {
    return null;
  }

  return error.status >= 400 && error.status < 500 ? error.status : null;
};

/**
 * @Description Ends any request that no route matched with 404
 * @param _request
 * @param response
 */
export const handleNotFound = (_request: Request, response: Response): void => {
  response.status(404).json({ error: TEXT.NOT_FOUND });
};

/**
 * @Description Ends a failed request: keeps 4xx from body parsing, everything else becomes 500
 * @param error
 * @param _request
 * @param response
 * @param _next required so Express treats this as an error handler
 */
export const handleServerError = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  const clientErrorStatus = readClientErrorStatus(error);

  if (clientErrorStatus !== null) {
    response.status(clientErrorStatus).json({ error: String((error as Error).message) });

    return;
  }

  console.error(error);
  response.status(500).json({ error: TEXT.SERVER_ERROR });
};
