import type { IDiagnosticsSnapshot } from '@/store';
import { DIAGNOSTIC_ROW_DEFINITIONS, MAP_DELAY_ROW } from '@/features/diagnostics-overlay/constants';
import type { IDiagnosticRow } from '@/features/diagnostics-overlay/types';

/**
 * @Description Turns a diagnostics snapshot into labelled rows for the overlay
 * @param snapshot
 * @param renderDelayMs
 */
export const buildDiagnosticRows = (snapshot: IDiagnosticsSnapshot, renderDelayMs: number): IDiagnosticRow[] => [
  ...DIAGNOSTIC_ROW_DEFINITIONS.map(({ key, label }) => ({ key, label, value: String(snapshot[key]) })),
  { key: MAP_DELAY_ROW.KEY, label: MAP_DELAY_ROW.LABEL, value: `${Math.round(renderDelayMs)} ${MAP_DELAY_ROW.UNIT}` },
];
