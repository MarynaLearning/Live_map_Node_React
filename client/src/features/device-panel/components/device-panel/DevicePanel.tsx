import { Panel } from '@/components';
import { DEVICE_PANEL_TEXT } from '@/features/device-panel/constants';
import type { IDevicePanelProps } from '@/features/device-panel/types';
import { buildDeviceTitle } from '@/features/device-panel/utils/device-title';
import { DeviceDetails } from '@/features/device-panel/components/device-details/DeviceDetails';
import { EventList } from '@/features/device-panel/components/event-list/EventList';
import { SensorChart } from '@/features/device-panel/components/sensor-chart/SensorChart';
import styles from './DevicePanel.module.css';

export const DevicePanel = ({ deviceId }: IDevicePanelProps) => (
  <Panel title={buildDeviceTitle(deviceId)}>
    <DeviceDetails deviceId={deviceId} />
    <SensorChart deviceId={deviceId} />
    <p className={styles.hint}>{DEVICE_PANEL_TEXT.HINT}</p>
    <EventList deviceId={deviceId} />
  </Panel>
);
