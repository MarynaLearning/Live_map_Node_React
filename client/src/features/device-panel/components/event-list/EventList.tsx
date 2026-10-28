import { classNames } from '@/utils/class-names';
import { DEVICE_PANEL_TEXT } from '@/features/device-panel/constants';
import { useDeviceEvents } from '@/features/device-panel/hooks/use-device-events';
import type { IEventListProps } from '@/features/device-panel/types';
import styles from './EventList.module.css';

export const EventList = ({ deviceId }: IEventListProps) => {
  const { title, rows } = useDeviceEvents(deviceId);

  return (
    <section className={styles.eventList}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.scrollBox}>
        {rows.length === 0 ? (
          <p className={styles.empty}>{DEVICE_PANEL_TEXT.NO_EVENTS}</p>
        ) : (
          <ul className={styles.rows}>
            {rows.map((row) => (
              <li key={row.key} className={classNames(styles.row, row.isNew && styles.rowNew)}>
                <span className={styles.time}>{row.timeText}</span>
                <span className={classNames(styles.kind, styles[row.kind])}>{row.kindLabel}</span>
                <span className={styles.message}>{row.message}</span>
                <span className={styles.meta}>{row.metaText}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
