import {StatusDot} from '@/components';
import {DEVICE_STATUS_TONES} from '@/constants/device';
import {LEGEND_ITEMS} from '@/features/live-map/constants';
import styles from './MapLegend.module.css';

export const MapLegend = () => (
  <ul className={styles.mapLegend}>
    {LEGEND_ITEMS.map((item) => (
      <li key={item.status} className={styles.item}>
        <StatusDot tone={DEVICE_STATUS_TONES[item.status]}/>
        <span className={styles.label}>{item.label}</span>
        <span className={styles.hint}>{item.hint}</span>
      </li>
    ))}
  </ul>
);
