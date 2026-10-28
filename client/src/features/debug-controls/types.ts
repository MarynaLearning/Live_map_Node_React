export interface IDebugApiDeps {
  baseUrl: string;
  fetchJson: (url: string, init?: RequestInit) => Promise<Response>;
}

export type TRunRequest = (request: () => Promise<void>) => Promise<void>;

export interface IRequestRunner {
  isBusy: boolean;
  errorText: string | null;
  runRequest: TRunRequest;
}

export interface IRequestErrorProps {
  text: string | null;
}

export interface IConnectionControlsView {
  isBusy: boolean;
  errorText: string | null;
  connectionButtonLabel: string;
  dropAllConnections(): void;
  toggleConnection(): void;
}

export interface IStressModeView {
  isStressMode: boolean;
  isBusy: boolean;
  errorText: string | null;
  toggleStressMode(enabled: boolean): void;
}

export interface IThrottleView {
  sliderPosition: number;
  valueText: string;
  delayInfoText: string;
  isDelayHigh: boolean;
  changeSliderPosition(position: number): void;
}
