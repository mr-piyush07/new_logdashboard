import React, { useEffect, useState } from 'react';
import { socket } from './services/socket';
import { useSocketData } from './hooks/useSocketData';
import LiveStatusCard from './components/LiveStatusCard';
import RealTimeGraph from './components/RealTimeGraph';
import HistoricalGraph from './components/HistoricalGraph';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const { telemetry, history } = useSocketData();

  useEffect(() => {
    socket.connect();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* Decorative Orbs */}
      <div className="bg-blob bg-blob-1"></div>
      <div className="bg-blob bg-blob-2"></div>

      <main style={{ padding: 'var(--spacing-xl)', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        <header className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-md) var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>IoT Data Hub</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span className={`live-indicator ${!isConnected ? 'offline' : ''}`}></span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </header>

        <section className="dashboard-grid">
          {/* Main layout grid */}
          <LiveStatusCard data={telemetry} />
          <RealTimeGraph history={history} />
        </section>

        <section className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', minHeight: '400px', animationDelay: '0.3s' }}>
           <HistoricalGraph />
        </section>
      </main>
    </>
  );
}

export default App;
