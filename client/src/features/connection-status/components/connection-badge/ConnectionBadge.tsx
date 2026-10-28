import { StatusBadge } from '@/components';
import { useConnectionView } from '@/features/connection-status/hooks/use-connection-view';
import styles from './ConnectionBadge.module.css';

export const ConnectionBadge = () => {
  const view = useConnectionView();

  return (
    <div className={styles.connectionBadge} role="status">
      <StatusBadge label={view.badgeLabel} tone={view.tone} />
      <span className={styles.detail}>{view.detailText}</span>
    </div>
  );
};
