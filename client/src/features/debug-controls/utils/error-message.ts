import { DEBUG_TEXT } from '@/features/debug-controls/constants';

/**
 * @Description Returns a text for any thrown value
 * @param error
 */
export const extractErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : DEBUG_TEXT.UNKNOWN_ERROR);
