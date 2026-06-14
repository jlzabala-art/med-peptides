import Users from "lucide-react/dist/esm/icons/users";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import React from 'react';
import { useNavigate } from 'react-router-dom';






function ActionBtn({ icon: Icon, title, desc, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', flexDirection: 'column', gap: '1rem', 
        padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9',
        background: 'var(--color-bg-app)', color: '#0f172a', cursor: 'pointer',
        transition: 'all 0.2s', textAlign: 'left', outline: 'none'
      }}
      onMouseOver={(e) => { 
        e.currentTarget.style.background = 'white'; 
        e.currentTarget.style.borderColor = color; 
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}15`; 
        e.currentTarget.style.transform = 'translateY(-2px)'; 
      }}
      onMouseOut={(e) => { 
        e.currentTarget.style.background = 'var(--color-bg-app)'; 
        e.currentTarget.style.borderColor = '#f1f5f9'; 
        e.currentTarget.style.boxShadow = 'none'; 
        e.currentTarget.style.transform = 'translateY(0)'; 
      }}
    >
      <div style={{ padding: '0.6rem', borderRadius: '12px', background: `${color}15`, color: color, width: 'fit-content' }}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '2px' }}>{desc}</div>
      </div>
    </button>
  );
}

export default function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={20} color="var(--primary)" /> Quick Actions
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <ActionBtn icon={Users} title="Patient Directory" desc="Manage profiles" onClick={() => navigate('/doctor/patients')} color="#0ea5e9" />
        <ActionBtn icon={FlaskConical} title="Clinical Research" desc="Studies & literature" onClick={() => navigate('/doctor/research')} color="var(--color-success)" />
        <ActionBtn icon={ClipboardList} title="Lab Results" desc="Biomarker review" onClick={() => navigate('/doctor/lab-results')} color="var(--color-warning)" />
        <ActionBtn icon={Calendar} title="Appointments" desc="Schedule visits" onClick={() => navigate('/doctor/appointments')} color="#8b5cf6" />
      </div>
    </div>
  );
}