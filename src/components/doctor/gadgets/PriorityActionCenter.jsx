import Clock from "lucide-react/dist/esm/icons/clock";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Activity from "lucide-react/dist/esm/icons/activity";
import React from 'react';
import { useNavigate } from 'react-router-dom';






export default function PriorityActionCenter({ activities }) {
  const navigate = useNavigate();

  const defaultActivities = activities || [
    { id: '1', type: 'lab_result', title: 'Critical Review Required', patient: 'Michael T.', time: '1 hr ago', status: 'urgent', icon: AlertTriangle, color: 'var(--color-danger)' },
    { id: '2', type: 'appointment', title: 'Consultation Complete', patient: 'Sarah J.', time: '2 hrs ago', status: 'done', icon: CheckCircle2, color: 'var(--color-success)' },
    { id: '3', type: 'prescription', title: 'Protocol Renewal', patient: 'Emma W.', time: 'Yesterday', status: 'pending', icon: Activity, color: '#f59e0b' }
  ];

  return (
    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--primary)" /> Requires Attention
        </h3>
        <button onClick={() => navigate('/doctor/patients')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
          View All Queue
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {defaultActivities.map(activity => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', 
              borderRadius: '16px', border: `1px solid ${activity.status === 'urgent' ? 'rgba(239, 68, 68, 0.3)' : '#f1f5f9'}`, 
              background: activity.status === 'urgent' ? 'rgba(239, 68, 68, 0.02)' : 'var(--color-bg-app)',
              transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '12px', 
                background: `${activity.color}15`, color: activity.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{activity.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '2px' }}>{activity.patient} • {activity.time}</div>
              </div>
              <div>
                <ArrowRight size={18} color="var(--color-text-tertiary)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}