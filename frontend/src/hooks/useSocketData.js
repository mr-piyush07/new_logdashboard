import { useState, useEffect } from 'react';
import { socket } from '../services/socket';

export const useSocketData = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]); // Buffer for real-time graphs

  useEffect(() => {
    // Expected incoming event from backend Socket.io is "telemetry"
    const handleNewData = (data) => {
      setTelemetry(data);
      setHistory((prev) => {
        // Keep the last 50 data points for active chart visualization
        const updated = [...prev, data];
        return updated.length > 50 ? updated.slice(1) : updated;
      });
    };

    socket.on('telemetry', handleNewData);
    
    return () => {
      socket.off('telemetry', handleNewData);
    };
  }, []);

  return { telemetry, history };
};
