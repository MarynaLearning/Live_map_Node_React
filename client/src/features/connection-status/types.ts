import type { StatusTone } from '@/types/components';

export interface IConnectionView {
  tone: StatusTone;
  badgeLabel: string;
  detailText: string;
  bannerText: string | null;
}
