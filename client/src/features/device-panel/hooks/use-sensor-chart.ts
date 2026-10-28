import { useEffect, useRef } from 'react';
import { useServices } from '@/hooks/use-services';
import { EMPTY_SAMPLES } from '@/features/device-panel/constants';
import { createSensorChart, updateSensorChart } from '@/features/device-panel/utils/sensor-chart';

/**
 * @Description Owns a chart for one device and redraws it in the shared frame loop
 * @param deviceId
 */
export const useSensorChart = (deviceId: string) => {
  const { frameLoop, deviceStore } = useServices();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas === null) {
      return;
    }

    const chart = createSensorChart(canvas);
    let drawnRevision = -1;

    const unsubscribe = frameLoop.subscribe(() => {
      const device = deviceStore.getDevice(deviceId);
      const revision = device?.samplesRevision ?? 0;

      if (revision === drawnRevision) {
        return;
      }

      drawnRevision = revision;
      updateSensorChart(chart, device?.samples ?? EMPTY_SAMPLES);
    });

    return () => {
      unsubscribe();
      chart.destroy();
    };
  }, [deviceId, frameLoop, deviceStore]);

  return canvasRef;
};
