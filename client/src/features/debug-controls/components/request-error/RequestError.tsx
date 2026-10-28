import type { IRequestErrorProps } from '@/features/debug-controls/types';
import styles from './RequestError.module.css';

export const RequestError = ({ text }: IRequestErrorProps) => {
  if (text === null) {
    return null;
  }

  return <p className={styles.requestError}>{text}</p>;
};
