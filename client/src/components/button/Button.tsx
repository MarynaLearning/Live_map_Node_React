import { ButtonVariant, type IButtonProps } from '@/types/components';
import { classNames } from '@/utils/class-names';
import styles from './Button.module.css';

export const Button = ({ children, variant = ButtonVariant.DEFAULT, disabled = false, onClick }: IButtonProps) => (
  <button type="button" className={classNames(styles.button, styles[variant])} disabled={disabled} onClick={onClick}>
    {children}
  </button>
);
