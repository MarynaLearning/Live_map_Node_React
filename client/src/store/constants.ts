import { ReconcileResult } from '@iot/shared';
import type { IDiagnosticTotals, IStoredEvent } from './types';

/** Time for chart samples. */
export const SAMPLE_WINDOW_MS = 30_000;

/** Upper limit on the chart samples stored per device. */
export const MAX_SAMPLES_PER_DEVICE = 1500;

/** Time span within which chart samples are merged into one. */
export const SAMPLE_MERGE_MS = 50;

export const MAX_EVENTS_PER_DEVICE = 50;

export const RATE_WINDOW_MS = 1000;

export const EMPTY_EVENTS: IStoredEvent[] = [];

export const INITIAL_DIAGNOSTIC_TOTALS: IDiagnosticTotals = {
  received: 0,
  duplicate: 0,
  outOfOrder: 0,
  staleBoot: 0,
  coalesced: 0,
  replayed: 0,
  resynced: 0,
};

export const DROPPED_RESULT_COUNTERS: Partial<Record<ReconcileResult, keyof IDiagnosticTotals>> = {
  [ReconcileResult.DUPLICATE]: 'duplicate',
  [ReconcileResult.OUT_OF_ORDER]: 'outOfOrder',
  [ReconcileResult.STALE_BOOT]: 'staleBoot',
};
