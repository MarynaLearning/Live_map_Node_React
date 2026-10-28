import { DEVICE_STATUS_LABELS, DEVICE_STATUS_TONES } from '@/constants/device';
import type { IDeviceRecord } from '@/store';
import { DeviceStatus } from '@/types/device';
import { getDeviceStatus } from '@/utils/device-status';
import { DEVICE_PANEL_TEXT, SENSOR_DECIMALS } from '@/features/device-panel/constants';
import type { IDeviceDetails, IDeviceDetailsInput } from '@/features/device-panel/types';

/**
 * @Description Builds the live details of one device: sensor value, status, battery, boot and seq
 * @param input
 * @param device
 */
export const buildDeviceDetails = (
  { now, isConnectionOpen }: IDeviceDetailsInput,
  device: IDeviceRecord | null,
): IDeviceDetails => {
  const status = device === null ? DeviceStatus.UNKNOWN : getDeviceStatus(device.lastReceivedAt, now, isConnectionOpen);

  return {
    statusTone: DEVICE_STATUS_TONES[status],
    statusLabel: DEVICE_STATUS_LABELS[status],
    isPulsing: status === DeviceStatus.ONLINE,
    valueText: device === null ? DEVICE_PANEL_TEXT.NO_VALUE : device.payload.sensor.toFixed(SENSOR_DECIMALS),
    unitText: DEVICE_PANEL_TEXT.UNIT,
    metaItems: [
      { label: DEVICE_PANEL_TEXT.BATTERY, value: device === null ? DEVICE_PANEL_TEXT.NO_VALUE : `${device.payload.battery}%` },
      { label: DEVICE_PANEL_TEXT.BOOT, value: device === null ? DEVICE_PANEL_TEXT.NO_VALUE : String(device.bootId) },
      { label: DEVICE_PANEL_TEXT.SEQ, value: device === null ? DEVICE_PANEL_TEXT.NO_VALUE : String(device.seq) },
    ],
  };
};
