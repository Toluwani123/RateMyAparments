// src/components/RadarChart.jsx
import React, { useMemo } from 'react';
import { Radar }            from 'react-chartjs-2';
import {
  Chart        as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// ✅ register ONCE – subsequent calls are no-ops
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/** ----------------------------------------------------------------
 *  metrics = {
 *    avg_cost:       number | null,
 *    avg_safety:     number | null,
 *    avg_management: number | null,
 *    avg_noise:      number | null,
 *  }
 * ----------------------------------------------------------------*/
export default function RadarChart({ metrics, height = 320, width = 320 }) {
  /* Memoise so React-ChartJS only re-renders when the numbers change */
  const chartData = useMemo(() => ({
    labels: ['Cost', 'Safety', 'Management', 'Noise'],
    datasets: [
      {
        label: 'Average rating (1-5)',
        data: [
          metrics?.avg_cost       ?? 0,
          metrics?.avg_safety     ?? 0,
          metrics?.avg_management ?? 0,
          metrics?.avg_noise      ?? 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',  // Tailwind's blue-500 @ 20 %
        borderColor:     'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  }), [metrics]);

  const chartOptions = useMemo(() => ({
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: { stepSize: 1, backdropColor: 'transparent' },
        pointLabels: { font: { size: 14 } },
        grid:  { color: '#e5e7eb' },      // gray-200
        angleLines: { color: '#e5e7eb' },
      },
    },
    plugins: {
      legend:  { display: false },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  }), []);

  return (
    <div style={{ height, width }}>
      <Radar data={chartData} options={chartOptions} />
    </div>
  );
}
