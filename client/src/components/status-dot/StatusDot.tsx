import type { IStatusDotProps } from '@/types/components';
import { classNames } from '@/utils/class-names';
import styles from './StatusDot.module.css';

export const StatusDot = ({ tone, isPulsing = false }: IStatusDotProps) => (
  <span className={classNames(styles.statusDot, styles[tone], isPulsing && styles.pulsing)} />
);
