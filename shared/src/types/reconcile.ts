export enum ReconcileResult {
  ACCEPTED = 'accepted',
  DUPLICATE = 'duplicate',
  OUT_OF_ORDER = 'out_of_order',
  STALE_BOOT = 'stale_boot',
}

export interface IMessageId {
  bootId: number;
  seq: number;
}

export interface IReconcileState {
  latestState: IMessageId | null;
  seenKeys: Record<string, true>;
  seenOrder: string[];
}
