import type { ISnapshotEntry, IStateMessage, TDeviceMessage, TListener, TUnsubscribe } from '@iot/shared';
import type { TNow } from './common';

export interface IMessageSource {
  subscribe(listener: TListener<TDeviceMessage>): TUnsubscribe;
}

export interface ILatestStateEntry {
  message: IStateMessage;
  receivedAt: number;
}

export interface IGateway extends IMessageSource {
  getSnapshot(): ISnapshotEntry[];
}

export interface IGatewayDeps {
  source: IMessageSource;
  now: TNow;
}
