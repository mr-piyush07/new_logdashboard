import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { fetchLogsHistory } from '../services/api';
import { RefreshCw } from 'lucide-react';

const HistoricalGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchLogsHistory(100);
      // The backend API returns the array directly, so res itself is the array
      const historyData = Array.isArray(res) ? res : (res.data || []);
      setData([...historyData].reverse());
    } catch (err) {
      console.error('Error loading historical data:', err);
      setError(`Fetch Error: ${err.message}`);
    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: data.map((point) => dayjs(point.timestamp).format('HH:mm')),
      datasets: [
        {
          label: 'Historical Angle (°)',
          data: data.map((point) => point.servo_angle),
          borderColor: 'rgba(139, 92, 246, 1)', // Purple vibe to distinguish from Real-Time blue
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2),
    plugins: {
      legend: { display: false },
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
      y: { min: 0, max: 180, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 12 } },
    },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Historical Analysis</h2>
        <button 
          onClick={loadData}
          disabled={loading}
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', 
            padding: 'var(--spacing-sm)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
            transition: 'background 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
        {loading && data.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
            Loading historical data...
          </div>
        ) : error ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-error)' }}>
            {error} (Ensure backend DB is populated)
          </div>
        ) : data.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
            No historical data available. Run the simulation script to populate! 
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default HistoricalGraph;
