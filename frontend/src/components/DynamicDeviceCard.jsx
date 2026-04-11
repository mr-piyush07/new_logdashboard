import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';

const DynamicDeviceCard = ({ device, componentsConfig, onDelete }) => {
  const [telemetry, setTelemetry] = useState(null);
  
  // Calculate if device is online based on lastSeen 
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (device.lastSeen) {
       const timeDiff = Date.now() - new Date(device.lastSeen).getTime();
       setIsOnline(timeDiff < 60000); 
    }

    const eventName = `dynamic_telemetry_${device.deviceId}`;
    
    const handleData = (payload) => {
      setTelemetry(payload);
      setIsOnline(true);
    };

    socket.on(eventName, handleData);

    const interval = setInterval(() => {
      if (telemetry?.timestamp) {
        const timeDiff = Date.now() - new Date(telemetry.timestamp).getTime();
        if (timeDiff > 60000) setIsOnline(false);
      }
    }, 10000);

    return () => {
      socket.off(eventName, handleData);
      clearInterval(interval);
    };
  }, [device.deviceId, device.lastSeen, telemetry]);

  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', position: 'relative' }}>
      
      {/* Header & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', margin: '0 0 var(--spacing-xs) 0', color: 'var(--text-primary)' }}>{device.deviceId}</h3>
          
          {/* Capabilities Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--spacing-xs)' }}>
            {device.components.map(comp => (
              <span key={comp} style={{ 
                fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', 
                background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)'
              }}>
                {comp.replace('_', ' ')}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <span className={`live-indicator ${!isOnline ? 'offline' : ''}`}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isOnline ? 'Online via MQTT' : 'Offline'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => onDelete(device.deviceId)}
          style={{
            background: 'var(--status-error)', color: 'white', border: 'none', 
            padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)', 
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
          }}
          title="Delete Device & Data"
        >
          Delete
        </button>
      </div>

      {/* Render Component Blocks with Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
        {device.components.map(comp => {
          const config = componentsConfig[comp] || {};
          const value = telemetry?.data?.[comp];
          const displayValue = value !== undefined ? value : '--';
          
          // Calculate percentage for gauge insight if numeric
          let percentage = 0;
          if (config.type === 'Number' && value !== undefined && config.max > config.min) {
             const clampVal = Math.max(config.min, Math.min(config.max, value));
             percentage = ((clampVal - config.min) / (config.max - config.min)) * 100;
          }

          return (
            <div key={comp} style={{ background: 'var(--surface-bg-hover)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {comp.replace('_', ' ')}
                </span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--brand-primary)' }}>
                    {typeof displayValue === 'boolean' ? (displayValue ? 'TRUE' : 'FALSE') : displayValue}
                  </span>
                  {config?.unit && displayValue !== '--' && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{config.unit}</span>
                  )}
                </span>
              </div>

              {/* Progress Gauge for Numeric values */}
              {config.type === 'Number' && (
                <div style={{ width: '100%', height: '8px', background: 'var(--surface-bg)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, height: '100%', 
                    width: `${percentage}%`, 
                    background: `linear-gradient(90deg, var(--brand-secondary), var(--brand-primary))`,
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
              )}
              
              {/* Type/Range Limits info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-xs)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Type: {config.type}</span>
                {config.type === 'Number' && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Range: {config.min} to {config.max}</span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicDeviceCard;
