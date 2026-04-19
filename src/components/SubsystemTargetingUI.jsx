import React from 'react';
import './SubsystemTargetingUI.css';

export default function SubsystemTargetingUI({ 
  targetShip, 
  isActive, 
  onSelectSubsystem, 
  onCancel 
}) {
  if (!isActive || !targetShip) return null;

  // Helper to map engine status to our neon CSS classes
  const getStatusColorClass = (status) => {
    if (!status) return 'status-green';
    switch (status.toLowerCase()) {
      case 'operational': return 'status-green';
      case 'damaged': return 'status-amber';
      case 'destroyed':
      case 'offline':
      case 'breached':
        return 'status-red';
      default: return 'status-green';
    }
  };

  return (
    <div className="targeting-overlay">
      {/* Scanline wrapper for the CRT effect */}
      <div className="crt-scanlines"></div>
      
      <div className="targeting-panel crt-border">
        <header className="targeting-header">
          <h2>&gt; TACTICAL TARGET LOCK INITIALIZED</h2>
          <p className="blink">AWAITING SUBSYSTEM SELECTION FOR: [ {(targetShip.displayName || 'UNKNOWN').toUpperCase()} ]</p>
        </header>

        {/* Abstract ship wireframe layout */}
        <div className="ship-wireframe-grid">
          {Object.entries(targetShip?.subsystems || {}).map(([sysKey, sysData]) => {
            const status = sysData?.status || 'operational';
            const statusClass = getStatusColorClass(status);
            const isSelectable = status !== 'destroyed' && status !== 'offline';

            return (
              <button
                key={sysKey}
                className={`subsystem-btn ${statusClass}`}
                disabled={!isSelectable}
                onClick={() => onSelectSubsystem(targetShip.id, sysKey)}
              >
                <div className="bracket-left">[</div>
                <div className="subsystem-info">
                  <span className="sys-label">{sysData?.label || sysKey.toUpperCase()}</span>
                  <span className="sys-status">SYS_{status.toUpperCase()}</span>
                </div>
                <div className="bracket-right">]</div>
              </button>
            );
          })}
        </div>

        <footer className="targeting-footer">
          <button className="btn-cancel" onClick={onCancel}>
            [ ESC ] ABORT LOCK
          </button>
        </footer>
      </div>
    </div>
  );
}
