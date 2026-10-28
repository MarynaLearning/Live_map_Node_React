import { StatusDot } from '@/components';
import { classNames } from '@/utils/class-names';
import { useConnectionView } from '@/features/connection-status/hooks/use-connection-view';
import styles from './ConnectionBanner.module.css';

export const ConnectionBanner = () => {
  const view = useConnectionView();

  if (view.bannerText === null) {
    return null;
  }

  return (
    <div className={classNames(styles.connectionBanner, styles[view.tone])} role="alert">
      <StatusDot tone={view.tone} />
      <span className={styles.text}>{view.bannerText}</span>
    </div>
  );
};
