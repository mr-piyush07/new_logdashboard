import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const RealTimeGraph = ({ history }) => {
  const chartData = useMemo(() => {
    return {
      labels: history.map((point) => dayjs(point.timestamp).format('HH:mm:ss')),
      datasets: [
        {
          label: 'Servo Angle (°)',
          data: history.map((point) => point.servo_angle),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4, // Smooth curve
        },
      ],
    };
  }, [history]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2), // Force crisp rendering by oversampling
    animation: {
      duration: 0, // Disable chartjs animation for real-time performance so it flows instantly
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 180,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 8,
          maxRotation: 0,
        },
      },
    },
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', height: '100%', animationDelay: '0.2s' }}>
      <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Real-time Telemetry Stream</span>
        {history.length > 0 && <span className="live-indicator"></span>}
      </h2>
      <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
        {history.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Stream disconnected. Waiting for socket telemetry...
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default RealTimeGraph;
