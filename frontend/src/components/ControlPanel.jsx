import React, { useState, useEffect } from 'react';
import { Power, Send, Clock, Cpu } from 'lucide-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ControlPanel = ({ telemetry }) => {
  const [devicePowerState, setDevicePowerState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  // If telemetry is coming in, try to infer real power status
  // or uptime from telemetry directly.
  const isOnline = telemetry?.status?.toLowerCase() === 'active';
  
  // Synchronize internal button toggle UI to match the hardware's real live telemetry state
  useEffect(() => {
    if (telemetry) {
      setDevicePowerState(isOnline);
    }
  }, [isOnline, telemetry]);
  
  // Format uptime in hours, mins, seconds if we have a telemetry payload
  const formatUptime = (ms) => {
    if (!ms) return 'N/A';
    const d = dayjs.duration(ms);
    return `${Math.floor(d.asHours())}h ${d.minutes()}m ${d.seconds()}s`;
  };

  const issueCommand = async (newState) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/telemetry/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: telemetry?.device_id || 'esp32_01', 
          command: 'power',
          state: newState ? 'ON' : 'OFF'
        })
      });

      if (!res.ok) throw new Error('Network error');

      setLastEvent(`Command Sent: Power ${newState ? 'ON' : 'OFF'}. Waiting for telemetry sync...`);
      
      // Clear popup after a few seconds
      setTimeout(() => setLastEvent(null), 3500);

    } catch (err) {
      setLastEvent(`Command Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--spacing-md)' }}>
       <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-sm)' }}>
        <Power size={20} color="var(--accent-primary)" /> Hardware Control Node
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr)', gap: 'var(--spacing-md)', flex: 1 }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
           <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Remote Toggle</h3>
           
           <button 
             onClick={() => issueCommand(!devicePowerState)}
             disabled={loading}
             style={{
               width: '120px', height: '120px', borderRadius: '50%', border: 'none', cursor: 'pointer',
               display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
               background: devicePowerState ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
               boxShadow: devicePowerState ? '0 0 40px rgba(16, 185, 129, 0.4)' : 'none',
               color: devicePowerState ? 'var(--accent-success)' : 'var(--accent-error)'
             }}
           >
             <Power size={48} />
           </button>
           
           <div style={{ fontWeight: 600, marginTop: 'var(--spacing-sm)' }}>
             {loading ? 'Transmitting...' : devicePowerState ? 'System ENERGIZED' : 'System STANDBY'}
           </div>

           {lastEvent && (
             <div style={{ color: lastEvent.includes('Failed') ? 'var(--accent-error)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
               {lastEvent}
             </div>
           )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Cpu size={14} /> Link Connectivity
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: isOnline ? 'var(--accent-success)' : 'var(--accent-error)' }}>
              {isOnline ? 'Online (Real-Time)' : 'Offline'}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Clock size={14} /> Continuous Hardware Uptime
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
              {formatUptime(telemetry?.uptime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
