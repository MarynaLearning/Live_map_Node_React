import { MAX_TRACK_GAP_MS } from '@/constants/device';
import type { IDeviceRecord } from '@/store';
import { DeviceStatus } from '@/types/device';
import { getDeviceStatus } from '@/utils/device-status';
import { formatSeconds } from '@/utils/format';
import { samplePositionAt } from '@/utils/interpolate';
import { MAP_TEXT, PULSE_DURATION_MS, REBOOT_CAPTION_MS } from '@/features/live-map/constants';
import type { IDeviceView, IDeviceViewsInput } from '@/features/live-map/types';
import { formatDeviceLabel } from './device-label';
import { projectToScreen } from './viewport';

const buildCaption = (device: IDeviceRecord, status: DeviceStatus, now: number): string | null => {
  if (status === DeviceStatus.STALE || status === DeviceStatus.OFFLINE) {
    return `${formatSeconds(now - device.lastReceivedAt)} ${MAP_TEXT.AGO_SUFFIX}`;
  }

  if (device.rebootedAt !== null && now - device.rebootedAt < REBOOT_CAPTION_MS) {
    return MAP_TEXT.REBOOTED;
  }

  return null;
};

const readPulseProgress = (device: IDeviceRecord, now: number, renderDelayMs: number): number | null => {
  const pulseStartedAt = Math.max(device.resumedAt ?? -Infinity, device.rebootedAt ?? -Infinity) + renderDelayMs;
  const progress = (now - pulseStartedAt) / PULSE_DURATION_MS;

  return progress >= 0 && progress < 1 ? progress : null;
};

const readRenderPosition = (device: IDeviceRecord, now: number, renderDelayMs: number) =>
  samplePositionAt(device.track, now - device.clockOffsetMs - renderDelayMs, MAX_TRACK_GAP_MS);

/**
 * @Description Turns store records into what one frame draws: position from the interpolation buffer, current status, caption and pulse
 * @param input
 */
export const buildDeviceViews = ({
  devices,
  now,
  renderDelayMs,
  isConnectionOpen,
  viewport,
  selectedDeviceId,
  hoveredDeviceId,
}: IDeviceViewsInput): IDeviceView[] =>
  devices.map((device) => {
    const status = getDeviceStatus(device.lastReceivedAt, now, isConnectionOpen);
    const screen = projectToScreen(readRenderPosition(device, now, renderDelayMs), viewport);

    return {
      deviceId: device.deviceId,
      label: formatDeviceLabel(device.deviceId),
      x: screen.x,
      y: screen.y,
      status,
      isSelected: device.deviceId === selectedDeviceId,
      isHovered: device.deviceId === hoveredDeviceId,
      caption: buildCaption(device, status, now),
      pulseProgress: readPulseProgress(device, now, renderDelayMs),
    };
  });
