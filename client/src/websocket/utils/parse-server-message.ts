import type { TServerMessage } from '@iot/shared';
import { KNOWN_MESSAGE_TYPES } from '@/websocket/constants';

const isServerMessage = (value: unknown): value is TServerMessage =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  typeof value.type === 'string' &&
  KNOWN_MESSAGE_TYPES[value.type] === true;

/**
 * @Description Parses a raw WebSocket frame into a server message, null when it is not valid JSON or has an unknown type
 * @param data
 */
export const parseServerMessage = (data: unknown): TServerMessage | null => {
  if (typeof data !== 'string') {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(data);

    return isServerMessage(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
