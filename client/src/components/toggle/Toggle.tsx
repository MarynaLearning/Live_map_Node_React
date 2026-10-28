import type { IToggleProps } from '@/types/components';
import { classNames } from '@/utils/class-names';
import styles from './Toggle.module.css';

export const Toggle = ({ label, checked, disabled = false, onChange }: IToggleProps) => (
  <label className={classNames(styles.toggle, disabled && styles.disabled)}>
    <input
      className={styles.input}
      type="checkbox"
      role="switch"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span className={classNames(styles.track, checked && styles.trackOn)}>
      <span className={classNames(styles.thumb, checked && styles.thumbOn)} />
    </span>
    <span className={styles.label}>{label}</span>
  </label>
);
