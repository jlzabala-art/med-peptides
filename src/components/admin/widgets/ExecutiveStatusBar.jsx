import React from 'react';

/**
 * Mobile-First Executive Status Bar
 * Compact strip showing critical live metrics.
 * Height: 48px (Mobile), 56px (Desktop)
 * Scrollable horizontally on mobile to ensure thumb reach without wrapping.
 */
export default function ExecutiveStatusBar({
  status = 'Operational',
  revenueToday = '456K',
  cashPosition = '890K',
  approvalsCount = 5,
  criticalAlerts = 2,
  currency = 'AED',
}) {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-app, #f8fafc)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        padding: '0 0.5rem',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none', // IE and Edge
        scrollbarWidth: 'none', // Firefox
      }}
      className="exec-status-bar"
    >
      <style>{`
        .exec-status-bar::-webkit-scrollbar {
          display: none;
        }
        .exec-status-item {
          display: flex;
          align-items: center;
          white-space: nowrap;
          padding: 0 1rem;
          height: 48px;
          border-right: 1px solid var(--border-color, #e2e8f0);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-color, #334155);
        }
        @media (min-width: 1024px) {
          .exec-status-item {
            height: 56px;
            font-size: 14px;
            padding: 0 1.5rem;
          }
        }
        .exec-status-item:first-child {
          padding-left: 0.5rem;
        }
        .exec-status-item:last-child {
          border-right: none;
          padding-right: 1.5rem;
        }
        .exec-live-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
          margin-right: 8px;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .exec-critical-indicator {
          color: #ef4444;
          background: #fef2f2;
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 6px;
        }
      `}</style>

      <div className="exec-status-item">
        <div className="exec-live-indicator"></div>
        LIVE • {status}
      </div>

      <div className="exec-status-item">
        <span style={{ color: 'var(--text-muted, #64748b)', marginRight: '4px' }}>
          Revenue Today
        </span>
        {currency} {revenueToday}
      </div>

      <div className="exec-status-item">
        <span style={{ color: 'var(--text-muted, #64748b)', marginRight: '4px' }}>
          Cash Position
        </span>
        {currency} {cashPosition}
      </div>

      <div className="exec-status-item" style={{ cursor: 'pointer' }}>
        <span style={{ color: 'var(--text-muted, #64748b)', marginRight: '4px' }}>
          Open Approvals
        </span>
        <span
          style={{
            background: 'var(--primary-light, #e0f2fe)',
            color: 'var(--primary, #0284c7)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
        >
          {approvalsCount}
        </span>
      </div>

      <div className="exec-status-item" style={{ cursor: 'pointer' }}>
        <span style={{ color: 'var(--text-muted, #64748b)' }}>Alerts</span>
        <span className="exec-critical-indicator">{criticalAlerts} Critical</span>
      </div>
    </div>
  );
}
