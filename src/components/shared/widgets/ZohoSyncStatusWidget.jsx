import Database from "lucide-react/dist/esm/icons/database";
import Link from "lucide-react/dist/esm/icons/link";
import RefreshCcw from "lucide-react/dist/esm/icons/refresh-ccw";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import React from 'react';







/**
 * Generic Zoho Sync Status Widget
 * Useful for Pricing Visibility, Catalog, and Operations.
 * 
 * @param {Array} services - Array of { name, status ('Synced'|'Error'|'Pending'), detail, icon }
 * @param {Function} onSync - Callback for Sync button
 */
export default function ZohoSyncStatusWidget({ services = [], onSync }) {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'Synced': return { color: '#10b981', icon: CheckCircle2 };
      case 'Error': return { color: '#ef4444', icon: AlertCircle };
      case 'Pending': return { color: '#f59e0b', icon: Clock };
      default: return { color: '#64748b', icon: Database };
    }
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#0071bd" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Zoho Integration</span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link size={12} /> Connected
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {services.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(services.length, 3)}, 1fr)`, gap: '12px' }}>
            {services.map((svc, idx) => {
              const { color, icon: StatusIcon } = getStatusConfig(svc.status);
              return (
                <div key={idx} style={{ 
                  background: svc.status === 'Error' ? '#fef2f2' : '#f8fafc', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: `1px solid ${svc.status === 'Error' ? '#fecaca' : '#e2e8f0'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#64748b' }}>{svc.name}</span>
                    <StatusIcon size={16} color={color} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: svc.status === 'Error' ? color : '#0f172a' }}>
                    {svc.status}
                  </div>
                  {svc.detail && (
                    <div style={{ fontSize: '12px', color: svc.status === 'Error' ? '#991b1b' : '#64748b', fontWeight: 500, marginTop: '4px' }}>
                      {svc.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
            No integration services configured.
          </div>
        )}

        {onSync && (
          <button onClick={onSync} style={{
            width: '100%',
            padding: '12px',
            background: '#0071bd',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <RefreshCcw size={16} /> Force Synchronization
          </button>
        )}
      </div>
    </div>
  );
}