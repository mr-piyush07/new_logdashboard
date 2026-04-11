import React, { useState, useEffect } from 'react';

const DeviceManager = ({ onDeviceCreated }) => {
  const [deviceId, setDeviceId] = useState('');
  const [componentsConfig, setComponentsConfig] = useState({});
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Fetch available components configuration
    fetch(`${API_URL}/api/components-config`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setComponentsConfig(data.components);
        } else {
          console.error("API returned failure for components config:", data.message);
        }
      })
      .catch(err => console.error("Failed to load components config:", err));
  }, []);

  const handleToggleComponent = (compKey) => {
    if (selectedComponents.includes(compKey)) {
      setSelectedComponents(prev => prev.filter(c => c !== compKey));
    } else {
      if (selectedComponents.length >= 5) {
        setError('Maximum 5 components allowed per device.');
        return;
      }
      setError('');
      setSelectedComponents(prev => [...prev, compKey]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceId.trim() || selectedComponents.length === 0) {
      setError('Please provide a Device ID and select at least one component.');
      return;
    }

    setLoading(true);
    setError('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${API_URL}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, components: selectedComponents })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
         throw new Error(result.message || 'Failed to create device');
      }

      setDeviceId('');
      setSelectedComponents([]);
      onDeviceCreated(result.data); // Notify parent to refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative gradient overlay */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)', opacity: 0.1, filter: 'blur(30px)' }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.5px' }}>Deploy New Node</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.9rem' }}>Provision a new IoT device and select its tracking capabilities.</p>
        
        {error && (
          <div style={{ color: '#ff6b6b', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Device ID Input Section */}
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>
              Device Identifier
            </label>
            <input 
              type="text" 
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: '1px solid var(--border-color)', 
                color: '#fff',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--brand-primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(var(--brand-primary-rgb), 0.2), inset 0 2px 4px rgba(0,0,0,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
              }}
              placeholder="e.g. core_reactor_temp_01"
              required
            />
          </div>

          {/* Capabilities Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
               <label style={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>
                 Sensor Array Configuration
               </label>
               <span style={{ fontSize: '0.8rem', color: selectedComponents.length === 5 ? '#ff6b6b' : 'var(--text-secondary)' }}>
                 {selectedComponents.length} / 5 Selected
               </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--spacing-sm)' }}>
              {Object.keys(componentsConfig).map((key) => {
                const conf = componentsConfig[key];
                const isSelected = selectedComponents.includes(key);
                
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleToggleComponent(key)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      padding: '12px 14px',
                      background: isSelected ? 'rgba(var(--brand-primary-rgb), 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      boxShadow: isSelected ? '0 4px 12px rgba(var(--brand-primary-rgb), 0.15)' : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                       if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                       if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: isSelected ? 'var(--brand-primary)' : 'rgba(255,255,255,0.2)',
                        transition: 'background 0.3s ease'
                      }}></div>
                      <span style={{ fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-primary)', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                        {key.replace('_', ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', paddingLeft: '16px' }}>
                      {conf.type} {conf.unit ? `(${conf.unit})` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 'var(--spacing-xs) 0' }} />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              alignSelf: 'flex-end',
              padding: '12px 32px', 
              background: loading ? 'var(--text-secondary)' : 'var(--brand-primary)', 
              color: '#fff', 
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: '30px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(var(--brand-primary-rgb), 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
               if(!loading) {
                 e.currentTarget.style.transform = 'translateY(-2px)';
                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--brand-primary-rgb), 0.4)';
               }
            }}
            onMouseLeave={(e) => {
               if(!loading) {
                 e.currentTarget.style.transform = 'none';
                 e.currentTarget.style.boxShadow = '0 4px 14px rgba(var(--brand-primary-rgb), 0.3)';
               }
            }}
          >
            {loading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                Deploying...
              </>
            ) : (
               <>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                 </svg>
                 Deploy Device
               </>
            )}
          </button>
        </form>
      </div>
      
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DeviceManager;
