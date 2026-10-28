import type { ReconcileResult } from '@iot/shared';
import { DROPPED_RESULT_COUNTERS, INITIAL_DIAGNOSTIC_TOTALS } from '@/store/constants';
import type { IDiagnostics, IDiagnosticsDeps, IDiagnosticsSnapshot } from '@/store/types';
import { countRateEvent, createRateMeter, readRate } from '@/store/utils/rate-meter';

/**
 * @Description Creates diagnostic info: counts received messages, rendered frames, every dropped message (duplicate, out of order, stale boot, coalesced) and how reconnects were resumed (replayed vs resynced devices)
 * @param deps
 */
export const createDiagnostics = ({ now }: IDiagnosticsDeps): IDiagnostics => {
  const totals = { ...INITIAL_DIAGNOSTIC_TOTALS };
  const messageRate = createRateMeter(now());
  const frameRate = createRateMeter(now());

  const recordReceived = () => {
    totals.received += 1;
    countRateEvent(messageRate, now());
  };

  const recordResult = (result: ReconcileResult) => {
    const counter = DROPPED_RESULT_COUNTERS[result];

    if (counter !== undefined) {
      totals[counter] += 1;
    }
  };

  const recordFrame = (timestamp: number, coalescedCount: number) => {
    totals.coalesced += coalescedCount;
    countRateEvent(frameRate, timestamp);
  };

  const recordResume = (replayedDevices: number, resyncedDevices: number) => {
    totals.replayed += replayedDevices;
    totals.resynced += resyncedDevices;
  };

  const getSnapshot = (): IDiagnosticsSnapshot => {
    const snapshotAt = now();

    return {
      ...totals,
      messagesPerSecond: readRate(messageRate, snapshotAt),
      framesPerSecond: readRate(frameRate, snapshotAt),
    };
  };

  return { recordReceived, recordResult, recordFrame, recordResume, getSnapshot };
};
