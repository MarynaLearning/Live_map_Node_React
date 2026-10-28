import { classNames } from '@/utils/class-names';
import { DEBUG_TEXT, HZ_SLIDER } from '@/features/debug-controls/constants';
import { useThrottle } from '@/features/debug-controls/hooks/use-throttle';
import styles from './HzSlider.module.css';

export const HzSlider = () => {
  const throttle = useThrottle();

  return (
    <label className={styles.hzSlider}>
      <span className={styles.header}>
        <span className={styles.label}>{DEBUG_TEXT.HZ_LABEL}</span>
        <span className={styles.value}>{throttle.valueText}</span>
      </span>
      <input
        className={styles.input}
        type="range"
        min={HZ_SLIDER.MIN}
        max={HZ_SLIDER.UNLIMITED_POSITION}
        step={1}
        value={throttle.sliderPosition}
        onChange={(event) => throttle.changeSliderPosition(Number(event.target.value))}
      />
      <span className={styles.hint}>{DEBUG_TEXT.HZ_HINT}</span>
      <span className={classNames(styles.delayInfo, throttle.isDelayHigh && styles.delayInfoHigh)} role="status">
        {throttle.delayInfoText}
      </span>
    </label>
  );
};
