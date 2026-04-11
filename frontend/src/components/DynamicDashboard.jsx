import React, { useState, useEffect } from 'react';
import DeviceManager from './DeviceManager';
import DynamicDeviceCard from './DynamicDeviceCard';

const DynamicDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [componentsConfig, setComponentsConfig] = useState({});

  const fetchDevices = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/devices`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setDevices(data.data);
        } else {
          console.error("API returned failure for devices:", data.message);
        }
      })
      .catch(err => console.error("Failed to load devices:", err));
  };

  const fetchConfig = () => {
     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
     fetch(`${API_URL}/api/components-config`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setComponentsConfig(data.components);
        } else {
          console.error("API returned failure for config:", data.message);
        }
      })
      .catch(err => console.error("Failed to load config:", err));
  }

  useEffect(() => {
    fetchConfig();
    fetchDevices();
  }, []);

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm(`Are you sure you want to completely delete device \${deviceId} and all its historical data?`)) {
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${API_URL}/api/devices/\${deviceId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchDevices();
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting device");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {/* Creation form */}
      <DeviceManager onDeviceCreated={() => fetchDevices()} />

      {/* Render list of devices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <h2 style={{ fontSize: '1.4rem' }}>{devices.length} Registered Devices</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {devices.map(device => (
            <DynamicDeviceCard 
              key={device.deviceId} 
              device={device} 
              componentsConfig={componentsConfig} 
              onDelete={handleDeleteDevice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicDashboard;
