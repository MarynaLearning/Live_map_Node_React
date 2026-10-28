import type { Chart, Point } from 'chart.js';
import type { DeviceEventKind } from '@iot/shared';
import type { StatusTone } from '@/types/components';

export interface IDevicePanelProps {
  deviceId: string;
}

export interface IEventRow {
  key: string;
  kind: DeviceEventKind;
  timeText: string;
  kindLabel: string;
  message: string;
  metaText: string;
  /** Arrived within the last few seconds when the list was built: plays the highlight animation. */
  isNew: boolean;
}

export interface IDeviceEvents {
  title: string;
  rows: IEventRow[];
}

export interface IEventListProps {
  deviceId: string;
}

export interface ISensorChartProps {
  deviceId: string;
}

export interface IDeviceDetailsProps {
  deviceId: string;
}

export interface IMetaItem {
  label: string;
  value: string;
}

export interface IDeviceDetails {
  statusTone: StatusTone;
  statusLabel: string;
  isPulsing: boolean;
  valueText: string;
  unitText: string;
  metaItems: IMetaItem[];
}

export interface IDeviceDetailsInput {
  now: number;
  isConnectionOpen: boolean;
}

export type TSensorChart = Chart<'line', Point[]>;
