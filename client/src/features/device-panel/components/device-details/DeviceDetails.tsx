import { StatusDot } from '@/components';
import { useDeviceDetails } from '@/features/device-panel/hooks/use-device-details';
import type { IDeviceDetailsProps } from '@/features/device-panel/types';
import styles from './DeviceDetails.module.css';

export const DeviceDetails = ({ deviceId }: IDeviceDetailsProps) => {
  const details = useDeviceDetails(deviceId);

  return (
    <>
      <div className={styles.headline}>
        <span className={styles.statusDotSlot}>
          <StatusDot tone={details.statusTone} isPulsing={details.isPulsing} />
        </span>
        <span className={styles.value}>{details.valueText}</span>
        <span className={styles.unit}>{details.unitText}</span>
        <span className={styles.statusLabel}>{details.statusLabel}</span>
      </div>
      <dl className={styles.meta}>
        {details.metaItems.map((item) => (
          <div key={item.label} className={styles.metaItem}>
            <dt className={styles.metaLabel}>{item.label}</dt>
            <dd className={styles.metaValue}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
};
