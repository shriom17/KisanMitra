import React, { useState } from 'react';
import { Bug, Upload, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import './PestWidget.css';

const PestWidget = () => {
  const [quickScan, setQuickScan] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Mock quick pest status
  const pestStatus = {
    risk: 'Medium',
    pestsDetected: 2,
    lastScan: '2 hours ago',
    recommendations: 'Monitor aphids in Zone A',
    riskColor: '#f59e0b'
  };

  const handleQuickScan = () => {
    setScanning(true);
    setTimeout(() => {
      setQuickScan({
        status: 'No immediate threats detected',
        confidence: 94,
        color: '#10b981'
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="pest-widget">
      <div className="widget-header">
        <div className="header-left">
          <Bug className="header-icon" />
          <div>
            <h3>Pest Detection</h3>
            <p>AI-powered monitoring</p>
          </div>
        </div>
        <div className="status-indicator" style={{ backgroundColor: pestStatus.riskColor }}>
          {pestStatus.risk}
        </div>
      </div>

      <div className="widget-content">
        <div className="pest-stats">
          <div className="stat-item">
            <span className="stat-value">{pestStatus.pestsDetected}</span>
            <span className="stat-label">Active Threats</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">94%</span>
            <span className="stat-label">Detection Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">15</span>
            <span className="stat-label">Plants Scanned</span>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-item">
            <AlertTriangle size={16} className="activity-icon warning" />
            <div className="activity-text">
              <span className="activity-title">Aphids detected in Zone A</span>
              <span className="activity-time">{pestStatus.lastScan}</span>
            </div>
          </div>
        </div>

        {quickScan && (
          <div className="quick-scan-result">
            <CheckCircle size={16} style={{ color: quickScan.color }} />
            <span>{quickScan.status}</span>
            <span className="confidence">{quickScan.confidence}%</span>
          </div>
        )}

        <div className="widget-actions">
          <button 
            className="action-btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickScan();
            }}
            disabled={scanning}
          >
            <Camera size={14} />
            {scanning ? 'Scanning...' : 'Quick Scan'}
          </button>
          <button 
            className="action-btn primary"
            onClick={(e) => e.stopPropagation()}
          >
            <Upload size={14} />
            Upload Image
          </button>
        </div>
      </div>

      <div className="widget-footer">
        <span className="last-update">Last scan: {pestStatus.lastScan}</span>
        <span className="more-info">Click for detailed analysis</span>
      </div>
    </div>
  );
};

export default PestWidget;