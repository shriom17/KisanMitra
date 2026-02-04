import React, { useState, useEffect } from 'react';
import { Droplets, Zap, Thermometer, Cloud, Wifi, Battery } from 'lucide-react';
import './IrrigationWidget.css';

const IrrigationWidget = () => {
  const [systemStatus, setSystemStatus] = useState('auto');
  const [sensorData, setSensorData] = useState({
    soilMoisture: 45,
    temperature: 28,
    waterUsed: 2450
  });

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ...prev,
        soilMoisture: Math.max(20, Math.min(80, prev.soilMoisture + (Math.random() - 0.5) * 3)),
        temperature: Math.max(20, Math.min(40, prev.temperature + (Math.random() - 0.5) * 1)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'auto': return '#10b981';
      case 'manual': return '#3b82f6';
      case 'off': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMoistureStatus = (moisture) => {
    if (moisture < 30) return { text: 'Low', color: '#ef4444' };
    if (moisture < 60) return { text: 'Optimal', color: '#10b981' };
    return { text: 'High', color: '#3b82f6' };
  };

  const toggleSystem = () => {
    const modes = ['auto', 'manual', 'off'];
    const currentIndex = modes.indexOf(systemStatus);
    const nextIndex = (currentIndex + 1) % modes.length;
    setSystemStatus(modes[nextIndex]);
  };

  return (
    <div className="irrigation-widget">
      <div className="widget-header">
        <div className="header-left">
          <Droplets className="header-icon" />
          <div>
            <h3>Smart Irrigation</h3>
            <p>IoT water management</p>
          </div>
        </div>
        <div 
          className="status-indicator"
          style={{ backgroundColor: getStatusColor() }}
        >
          <div className="status-dot"></div>
          {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
        </div>
      </div>

      <div className="widget-content">
        <div className="irrigation-stats">
          <div className="stat-item">
            <div className="stat-icon moisture">
              <Droplets size={16} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{sensorData.soilMoisture}%</span>
              <span 
                className="stat-status"
                style={{ color: getMoistureStatus(sensorData.soilMoisture).color }}
              >
                {getMoistureStatus(sensorData.soilMoisture).text}
              </span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon temperature">
              <Thermometer size={16} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{sensorData.temperature}°C</span>
              <span className="stat-status">Normal</span>
            </div>
          </div>
        </div>

        <div className="water-usage">
          <div className="usage-header">
            <span className="usage-label">Today's Water Usage</span>
            <span className="usage-value">{sensorData.waterUsed.toLocaleString()}L</span>
          </div>
          <div className="usage-bar">
            <div 
              className="usage-fill"
              style={{ width: `${Math.min(100, (sensorData.waterUsed / 3000) * 100)}%` }}
            ></div>
          </div>
          <div className="usage-footer">
            <span className="usage-savings">-12% vs yesterday</span>
            <span className="usage-efficiency">94% efficiency</span>
          </div>
        </div>

        <div className="iot-devices">
          <div className="devices-header">
            <Wifi size={14} />
            <span>IoT Network</span>
            <span className="devices-count">4 devices</span>
          </div>
          <div className="devices-list">
            <div className="device-item">
              <div className="device-status online"></div>
              <span className="device-name">Soil Sensor A1</span>
              <Battery size={12} className="battery-icon" />
              <span className="battery-level">87%</span>
            </div>
            <div className="device-item">
              <div className="device-status online"></div>
              <span className="device-name">Valve Controller</span>
              <Battery size={12} className="battery-icon" />
              <span className="battery-level">92%</span>
            </div>
          </div>
        </div>

        <div className="next-irrigation">
          <div className="next-schedule">
            <span className="schedule-label">Next Irrigation</span>
            <span className="schedule-time">18:00 - Zone C</span>
          </div>
          <div className="schedule-duration">25 min • 120L</div>
        </div>

        <div className="widget-actions">
          <button 
            className="action-btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              toggleSystem();
            }}
          >
            <Zap size={14} />
            Switch Mode
          </button>
          <button 
            className="action-btn primary"
            onClick={(e) => e.stopPropagation()}
          >
            <Droplets size={14} />
            Start Now
          </button>
        </div>
      </div>

      <div className="widget-footer">
        <span className="last-update">Updated 30s ago</span>
        <span className="more-info">View full dashboard</span>
      </div>
    </div>
  );
};

export default IrrigationWidget;