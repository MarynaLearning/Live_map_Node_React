export type TListener<TValue> = (value: TValue) => void;

export type TUnsubscribe = () => void;

export interface IEmitter<TValue> {
  subscribe(listener: TListener<TValue>): TUnsubscribe;
  emit(value: TValue): void;
}
