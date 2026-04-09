const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchLatestLog = async () => {
  const response = await fetch(`${API_URL}/telemetry/latest`);
  if (!response.ok) throw new Error('Failed to fetch latest log');
  return response.json();
};

export const fetchLogsHistory = async (limit = 100) => {
  const response = await fetch(`${API_URL}/telemetry/history?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};
