import React from 'react';
import dayjs from 'dayjs';
import { Activity, Power, Clock, Hash } from 'lucide-react';

const LiveStatusCard = ({ data }) => {
  if (!data) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', height: '100%' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--text-secondary)" /> Live Device Status
        </h2>
        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', justifyContent: 'center', margin: 'auto' }}>
          ⏳ Waiting for device telemetry...
        </div>
      </div>
    );
  }

  const { device_id, servo_angle, status, timestamp } = data;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-sm)' }}>
        <Activity size={20} color="var(--accent-primary)" /> Live Device Status
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        {/* Device ID */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
            <Hash size={14} /> Device ID
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{device_id}</div>
        </div>

        {/* Status */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
            <Power size={14} /> System Status
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: status === 'ACTIVE' ? 'var(--accent-success)' : 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={status === 'ACTIVE' ? 'live-indicator' : 'live-indicator offline'}></span>
            {status}
          </div>
        </div>

        {/* Servo Angle */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)', gridColumn: '1 / -1' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
            <Activity size={14} /> Servo Angle
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {servo_angle}°
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Clock size={12} /> Last Update: {dayjs(timestamp).format('DD MMM YYYY, HH:mm:ss')}
      </div>
    </div>
  );
};

export default LiveStatusCard;
