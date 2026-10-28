import { useSyncExternalStore } from 'react';
import { useServices } from '@/hooks';
import { calculateRenderDelay } from '@/utils/render-delay';
import { HIGH_RENDER_DELAY_MS } from '@/features/debug-controls/constants';
import type { IThrottleView } from '@/features/debug-controls/types';
import {
  convertMaxHzToPosition,
  convertPositionToMaxHz,
  formatMaxHz,
  formatRenderDelayInfo,
} from '@/features/debug-controls/utils/hz-value';

/**
 * @Description Reads and changes the subscription's maxHz
 * and describes the resulting map delay
 */
export const useThrottle = (): IThrottleView => {
  const { subscription } = useServices();
  const { maxHz } = useSyncExternalStore(subscription.subscribeToChanges, subscription.getSubscription);
  const renderDelayMs = calculateRenderDelay(maxHz);
  const sliderPosition = convertMaxHzToPosition(maxHz);
  const valueText = formatMaxHz(maxHz);
  const delayInfoText = formatRenderDelayInfo(maxHz, renderDelayMs);
  const isDelayHigh = renderDelayMs > HIGH_RENDER_DELAY_MS;

  const changeSliderPosition = (position: number) => {
    subscription.updateSubscription({ maxHz: convertPositionToMaxHz(position) });
  };

  return { sliderPosition, valueText, delayInfoText, isDelayHigh, changeSliderPosition };
};
