import { useIntervalValue } from '@/hooks/use-interval-value';
import { useServices } from '@/hooks/use-services';
import { calculateRenderDelay } from '@/utils/render-delay';
import { DIAGNOSTICS_REFRESH_MS } from '@/features/diagnostics-overlay/constants';
import type { IDiagnosticRow } from '@/features/diagnostics-overlay/types';
import { buildDiagnosticRows } from '@/features/diagnostics-overlay/utils/diagnostic-rows';

/**
 * @Description Keeps the diagnostics overlay rows up to date:
 * counters and the current map delay
 */
export const useDiagnosticRows = (): IDiagnosticRow[] => {
  const { diagnostics, subscription } = useServices();

  return useIntervalValue(
    () => buildDiagnosticRows(diagnostics.getSnapshot(), calculateRenderDelay(subscription.getSubscription().maxHz)),
    DIAGNOSTICS_REFRESH_MS,
  );
};
