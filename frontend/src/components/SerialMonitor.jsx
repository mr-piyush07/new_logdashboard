import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';
import { Download, Trash2, Terminal } from 'lucide-react';
import dayjs from 'dayjs';

const SerialMonitor = () => {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleNewData = (data) => {
      setLogs((prev) => {
        const newLogs = [...prev, { timestamp: Date.now(), data }];
        // Keep a generous buffer to prevent browser lag, flush old
        return newLogs.length > 500 ? newLogs.slice(1) : newLogs;
      });
    };

    socket.on('telemetry', handleNewData);
    
    return () => {
      socket.off('telemetry', handleNewData);
    };
  }, []);

  // auto-scroll behavior
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs.map(l => l.data), null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `telemetry_logs_${dayjs().format('YYYYMMDD_HHmmss')}.json`);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', height: '600px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={20} color="var(--accent-primary)" /> Serial Data Monitor
        </h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button 
            onClick={handleClear}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem 0.8rem', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <Trash2 size={16} /> Clear
          </button>
          <button 
            onClick={handleDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
          >
            <Download size={16} /> Download JSON
          </button>
        </div>
      </header>

      <div style={{ flex: 1, backgroundColor: '#020617', borderRadius: 'var(--border-radius-sm)', padding: 'var(--spacing-md)', overflowY: 'auto', border: '1px solid var(--glass-border)', fontFamily: 'monospace', fontSize: '0.9rem', color: '#10b981' }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            Waiting for real-time telemetry stream...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', wordBreak: 'break-all' }}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>[{dayjs(log.timestamp).format('HH:mm:ss.SSS')}]</span>
              <span style={{ color: '#60a5fa' }}>{JSON.stringify(log.data)}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default SerialMonitor;
