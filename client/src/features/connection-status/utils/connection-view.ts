import { StatusTone } from '@/types/components';
import { formatSeconds } from '@/utils/format';
import { ConnectionStatus, type IConnectionState } from '@/websocket';
import { CONNECTION_TEXT } from '@/features/connection-status/constants';
import type { IConnectionView } from '@/features/connection-status/types';

const buildView = (tone: StatusTone, badgeLabel: string, detailText: string, hasBanner: boolean): IConnectionView => ({
  tone,
  badgeLabel,
  detailText,
  bannerText: hasBanner ? `${detailText} · ${CONNECTION_TEXT.BANNER_SUFFIX}` : null,
});

/**
 * @Description Describes the connection for the user. A lost connection is shown on its own, separately from silent devices
 * @param state
 * @param now client clock, for the retry countdown
 */
export const buildConnectionView = (state: IConnectionState, now: number): IConnectionView => {
  if (state.status === ConnectionStatus.OPEN) {
    return buildView(StatusTone.SUCCESS, CONNECTION_TEXT.LIVE, CONNECTION_TEXT.LIVE_DETAIL, false);
  }

  if (state.status === ConnectionStatus.DISCONNECTED) {
    return buildView(StatusTone.NEUTRAL, CONNECTION_TEXT.DISCONNECTED, CONNECTION_TEXT.DISCONNECTED_DETAIL, true);
  }

  if (state.status === ConnectionStatus.RECONNECTING && state.retryAt !== null) {
    const detailText = `${CONNECTION_TEXT.LOST_RETRY_PREFIX} ${formatSeconds(state.retryAt - now)}`;

    return buildView(StatusTone.DANGER, CONNECTION_TEXT.LOST, detailText, true);
  }

  if (state.attempt > 0) {
    return buildView(StatusTone.DANGER, CONNECTION_TEXT.LOST, CONNECTION_TEXT.LOST_RECONNECTING, true);
  }

  return buildView(StatusTone.INFO, CONNECTION_TEXT.CONNECTING, CONNECTION_TEXT.CONNECTING_DETAIL, true);
};
