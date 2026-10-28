import { Chart, Filler, LinearScale, LineController, LineElement, PointElement, type Point } from 'chart.js';
import type { ISensorSample } from '@/store';
import { formatClockTime } from '@/utils/format';
import {
  CHART_COLORS,
  CHART_GAP_MS,
  CHART_MAX_X_TICKS,
  CHART_SUGGESTED_MAX,
  CHART_SUGGESTED_MIN,
  CHART_WINDOW_MS,
} from '@/features/device-panel/constants';
import type { TSensorChart } from '@/features/device-panel/types';
import { buildChartPoints } from './chart-samples';

/**
 * @Description Creates a line chart tuned for live data: no animation, no parsing, no tooltips, updated manually
 * @param canvas
 */
export const createSensorChart = (canvas: HTMLCanvasElement): TSensorChart => {
  Chart.register(LineController, LineElement, PointElement, LinearScale, Filler);

  return new Chart<'line', Point[]>(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          data: [],
          borderColor: CHART_COLORS.LINE,
          backgroundColor: CHART_COLORS.FILL,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          fill: 'start',
          spanGaps: false,
        },
      ],
    },
    options: {
      animation: false,
      parsing: false,
      normalized: true,
      responsive: true,
      maintainAspectRatio: false,
      events: [],
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          type: 'linear',
          grid: { color: CHART_COLORS.GRID },
          ticks: {
            color: CHART_COLORS.TICK,
            maxTicksLimit: CHART_MAX_X_TICKS,
            maxRotation: 0,
            callback: (value) => formatClockTime(Number(value)),
          },
        },
        y: {
          suggestedMin: CHART_SUGGESTED_MIN,
          suggestedMax: CHART_SUGGESTED_MAX,
          grid: { color: CHART_COLORS.GRID },
          ticks: { color: CHART_COLORS.TICK },
        },
      },
    },
  });
};

/**
 * @Description Replaces the chart data with the latest samples and scrolls the x-axis to the last 30 s
 * @param chart
 * @param samples
 */
export const updateSensorChart = (chart: TSensorChart, samples: ISensorSample[]): void => {
  const dataset = chart.data.datasets[0];
  const xScale = chart.options.scales?.x;
  const latestTs = samples.at(-1)?.ts;

  if (dataset === undefined || xScale === undefined) {
    return;
  }

  dataset.data = buildChartPoints(samples, CHART_GAP_MS);
  xScale.min = latestTs === undefined ? undefined : latestTs - CHART_WINDOW_MS;
  xScale.max = latestTs;
  chart.update('none');
};
