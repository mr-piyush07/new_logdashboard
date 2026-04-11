import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import { useSocketData } from '../hooks/useSocketData';
import { useAuth } from '../context/AuthContext';
import LiveStatusCard from '../components/LiveStatusCard';
import RealTimeGraph from '../components/RealTimeGraph';
import HistoricalGraph from '../components/HistoricalGraph';
import DynamicDashboard from '../components/DynamicDashboard';
import { LogOut, User } from 'lucide-react';

function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('servo'); // 'servo' or 'dynamic'
  const { telemetry, history } = useSocketData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Decorative Orbs */}
      <div className="bg-blob bg-blob-1"></div>
      <div className="bg-blob bg-blob-2"></div>

      <main style={{ padding: 'var(--spacing-xl)', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        <header className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-md) var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>IoT Data Hub</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span className={`live-indicator ${!isConnected ? 'offline' : ''}`}></span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-lg)', borderLeft: '1px solid var(--border-color)' }}>
              <User size={18} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.email}</span>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: 'var(--spacing-xs)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                <LogOut size={14} />
                <span style={{ fontSize: '0.85rem' }}>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-xs)' }}>
          <button 
            onClick={() => setActiveTab('servo')}
            style={{ 
              background: 'none', border: 'none', padding: 'var(--spacing-sm) var(--spacing-md)', cursor: 'pointer', fontSize: '1.1rem',
              color: activeTab === 'servo' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'servo' ? '2px solid var(--brand-primary)' : '2px solid transparent',
              fontWeight: 600
            }}>
            Legacy Servo
          </button>
          <button 
            onClick={() => setActiveTab('dynamic')}
            style={{ 
              background: 'none', border: 'none', padding: 'var(--spacing-sm) var(--spacing-md)', cursor: 'pointer', fontSize: '1.1rem',
              color: activeTab === 'dynamic' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'dynamic' ? '2px solid var(--brand-primary)' : '2px solid transparent',
              fontWeight: 600
            }}>
            Dynamic Platform (Beta)
          </button>
        </div>

        {activeTab === 'servo' ? (
          <>
            <section className="dashboard-grid">
              {/* Main layout grid */}
              <LiveStatusCard data={telemetry} />
              <RealTimeGraph history={history} />
            </section>

            <section className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', minHeight: '400px', animationDelay: '0.3s' }}>
              <HistoricalGraph />
            </section>
          </>
        ) : (
          <DynamicDashboard />
        )}
      </main>
    </>
  );
}

export default Dashboard;
