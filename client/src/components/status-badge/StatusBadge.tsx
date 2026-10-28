import type { IStatusBadgeProps } from '@/types/components';
import { classNames } from '@/utils/class-names';
import { StatusDot } from '@/components/status-dot/StatusDot';
import styles from './StatusBadge.module.css';

export const StatusBadge = ({ label, tone, isPulsing = false }: IStatusBadgeProps) => (
  <span className={classNames(styles.statusBadge, styles[tone])}>
    <StatusDot tone={tone} isPulsing={isPulsing} />
    <span className={styles.label}>{label}</span>
  </span>
);
