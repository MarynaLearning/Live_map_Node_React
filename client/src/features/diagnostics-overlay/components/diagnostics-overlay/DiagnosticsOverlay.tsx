import { useDiagnosticRows } from '@/features/diagnostics-overlay/hooks/use-diagnostic-rows';
import styles from './DiagnosticsOverlay.module.css';

export const DiagnosticsOverlay = () => {
  const rows = useDiagnosticRows();

  return (
    <dl className={styles.diagnosticsOverlay}>
      {rows.map((row) => (
        <div key={row.key} className={styles.row}>
          <dt className={styles.label}>{row.label}</dt>
          <dd className={styles.value}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};
