import type { IDiagnosticsSnapshot } from '@/store';

export interface IDiagnosticRow {
  key: string;
  label: string;
  value: string;
}

export interface IDiagnosticRowDefinition {
  key: keyof IDiagnosticsSnapshot;
  label: string;
}
