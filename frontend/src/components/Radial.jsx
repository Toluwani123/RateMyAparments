// src/components/CampusRadar.jsx
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function CampusRadar({ metrics }) {
  const data = {
    labels: ['Cost', 'Safety', 'Management', 'Noise'],
    datasets: [
      {
        label: 'Avg Rating',
        data: [
          metrics.avg_cost      ?? 0,
          metrics.avg_safety    ?? 0,
          metrics.avg_management?? 0,
          metrics.avg_noise     ?? 0,
        ],
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: 'rgba(59,130,246,1)',
        pointBackgroundColor: 'rgba(59,130,246,1)',
      }
    ]
  };

  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: { stepSize: 1 },
        pointLabels: { font: { size: 14 } }
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: 300, width: 300 }}>
      <Radar data={data} options={options} />
    </div>
  );
}
