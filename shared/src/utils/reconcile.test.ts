import { describe, expect, it } from 'vitest';
import { DeviceEventKind, MessageType, type IEventMessage, type IStateMessage } from '../types/protocol';
import { ReconcileResult } from '../types/reconcile';
import { compareMessageIds, createReconcileState, reconcileMessage } from './reconcile';

const buildState = (bootId: number, seq: number): IStateMessage => ({
  type: MessageType.STATE,
  deviceId: 'device-1',
  bootId,
  seq,
  ts: 1_000 + seq,
  payload: { x: seq, y: seq, sensor: 20, battery: 90 },
});

const buildEvent = (bootId: number, seq: number): IEventMessage => ({
  type: MessageType.EVENT,
  deviceId: 'device-1',
  bootId,
  seq,
  ts: 1_000 + seq,
  payload: { kind: DeviceEventKind.ALERT, message: 'alert' },
});

describe('reconcileMessage', () => {
  it('accepts the first state and every newer state', () => {
    const state = createReconcileState();

    expect(reconcileMessage(state, buildState(1, 0))).toBe(ReconcileResult.ACCEPTED);
    expect(reconcileMessage(state, buildState(1, 1))).toBe(ReconcileResult.ACCEPTED);
    expect(state.latestState).toEqual({ bootId: 1, seq: 1 });
  });

  it('drops an exact duplicate', () => {
    const state = createReconcileState();

    reconcileMessage(state, buildState(1, 5));

    expect(reconcileMessage(state, buildState(1, 5))).toBe(ReconcileResult.DUPLICATE);
  });

  it('drops a delayed older state as out of order and keeps the newest one current', () => {
    const state = createReconcileState();

    reconcileMessage(state, buildState(1, 5));

    expect(reconcileMessage(state, buildState(1, 3))).toBe(ReconcileResult.OUT_OF_ORDER);
    expect(state.latestState).toEqual({ bootId: 1, seq: 5 });
    expect(reconcileMessage(state, buildState(1, 6))).toBe(ReconcileResult.ACCEPTED);
  });

  it('accepts a newer state after a seq gap and drops the late gap messages', () => {
    const state = createReconcileState();

    reconcileMessage(state, buildState(1, 1));

    expect(reconcileMessage(state, buildState(1, 10))).toBe(ReconcileResult.ACCEPTED);
    expect(reconcileMessage(state, buildState(1, 5))).toBe(ReconcileResult.OUT_OF_ORDER);
  });

  it('accepts a reboot even though seq restarted from 0', () => {
    const state = createReconcileState();

    reconcileMessage(state, buildState(1, 50));

    expect(reconcileMessage(state, buildState(2, 0))).toBe(ReconcileResult.ACCEPTED);
    expect(state.latestState).toEqual({ bootId: 2, seq: 0 });
  });

  it('drops late states from the previous boot after a reboot', () => {
    const state = createReconcileState();

    reconcileMessage(state, buildState(1, 50));
    reconcileMessage(state, buildState(2, 0));

    expect(reconcileMessage(state, buildState(1, 51))).toBe(ReconcileResult.STALE_BOOT);
  });

  it('keeps late events but drops duplicated events', () => {
    const state = createReconcileState();

    reconcileMessage(state, buildState(1, 10));

    expect(reconcileMessage(state, buildEvent(1, 3))).toBe(ReconcileResult.ACCEPTED);
    expect(reconcileMessage(state, buildEvent(1, 3))).toBe(ReconcileResult.DUPLICATE);
    expect(state.latestState).toEqual({ bootId: 1, seq: 10 });
  });

  it('forgets keys that fall out of the duplicate window', () => {
    const state = createReconcileState();
    const windowSize = 2;

    reconcileMessage(state, buildEvent(1, 1), windowSize);
    reconcileMessage(state, buildEvent(1, 2), windowSize);
    reconcileMessage(state, buildEvent(1, 3), windowSize);

    expect(state.seenOrder).toEqual(['1:2', '1:3']);
    expect(reconcileMessage(state, buildEvent(1, 1), windowSize)).toBe(ReconcileResult.ACCEPTED);
  });
});

describe('compareMessageIds', () => {
  it('orders by bootId first, then by seq', () => {
    expect(compareMessageIds({ bootId: 2, seq: 0 }, { bootId: 1, seq: 99 })).toBeGreaterThan(0);
    expect(compareMessageIds({ bootId: 1, seq: 3 }, { bootId: 1, seq: 7 })).toBeLessThan(0);
    expect(compareMessageIds({ bootId: 1, seq: 7 }, { bootId: 1, seq: 7 })).toBe(0);
  });
});
