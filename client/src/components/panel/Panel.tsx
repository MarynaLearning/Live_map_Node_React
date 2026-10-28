import type { IPanelProps } from '@/types/components';
import styles from './Panel.module.css';

export const Panel = ({ title, children }: IPanelProps) => (
  <section className={styles.panel}>
    <h2 className={styles.title}>{title}</h2>
    {children}
  </section>
);
