import { DEVICE_PANEL_TEXT } from '@/features/device-panel/constants';
import { useSensorChart } from '@/features/device-panel/hooks/use-sensor-chart';
import type { ISensorChartProps } from '@/features/device-panel/types';
import styles from './SensorChart.module.css';

export const SensorChart = ({ deviceId }: ISensorChartProps) => {
  const chartCanvasRef = useSensorChart(deviceId);

  return (
    <div className={styles.chartBox}>
      <canvas ref={chartCanvasRef} className={styles.chartCanvas} role="img" aria-label={DEVICE_PANEL_TEXT.CHART_ARIA_LABEL} />
    </div>
  );
};
