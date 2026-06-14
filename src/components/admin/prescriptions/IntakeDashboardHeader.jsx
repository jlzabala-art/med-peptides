import FileText from "lucide-react/dist/esm/icons/file-text";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Activity from "lucide-react/dist/esm/icons/activity";
import React from 'react';







export default function IntakeDashboardHeader() {
  const kpis = [
    { label: "Today's", value: "24", icon: FileText, color: "#3b82f6" },
    { label: "Pending", value: "8", icon: Clock, color: "#f59e0b" },
    { label: "Ready", value: "12", icon: CheckCircle, color: "#10b981" },
    { label: "Missing Products", value: "2", icon: AlertTriangle, color: "#ef4444" },
    { label: "Clinical Alerts", value: "2", icon: AlertCircle, color: "#ef4444" },
    { label: "Processing Time", value: "4 min", icon: Activity, color: "#8b5cf6" },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          PRESCRIPTION INTAKE CENTER
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px'
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon size={16} color={kpi.color} />
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  {kpi.label}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}