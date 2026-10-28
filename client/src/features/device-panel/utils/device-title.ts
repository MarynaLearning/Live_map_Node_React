import { DEVICE_PANEL_TEXT } from '@/features/device-panel/constants';

/**
 * @Description Returns the title of the device panel
 * @param deviceId
 */
export const buildDeviceTitle = (deviceId: string): string => `${DEVICE_PANEL_TEXT.TITLE_PREFIX} ${deviceId}`;
