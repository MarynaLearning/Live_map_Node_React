import type { IDiagnosticRowDefinition } from './types';

export const DIAGNOSTICS_REFRESH_MS = 500;

export const MAP_DELAY_ROW = {
  KEY: 'mapDelay',
  LABEL: 'Map delay',
  UNIT: 'ms',
} as const;

export const DIAGNOSTIC_ROW_DEFINITIONS: IDiagnosticRowDefinition[] = [
  { key: 'messagesPerSecond', label: 'Messages/s' },
  { key: 'framesPerSecond', label: 'Frames/s' },
  { key: 'received', label: 'Received' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'outOfOrder', label: 'Out of order' },
  { key: 'staleBoot', label: 'Stale boot' },
  { key: 'coalesced', label: 'Coalesced' },
  { key: 'replayed', label: 'Replayed devices' },
  { key: 'resynced', label: 'Resynced devices' },
];
