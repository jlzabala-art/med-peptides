import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import Clock from "lucide-react/dist/esm/icons/clock";
import User from "lucide-react/dist/esm/icons/user";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';




import { useNavigate } from 'react-router-dom';

export default function DailyScheduleList({ appointments }) {
  const navigate = useNavigate();
  // Dummy data if none provided
  const schedule = appointments || [
    { id: 'a1', time: '09:00 AM', patient: 'Robert M.', type: 'Initial Consultation', duration: '45m' },
    { id: 'a2', time: '10:30 AM', patient: 'Elena S.', type: 'Protocol Review', duration: '30m' },
    { id: 'a3', time: '01:15 PM', patient: 'David K.', type: 'Lab Results', duration: '30m' },
    { id: 'a4', time: '03:00 PM', patient: 'Julia R.', type: 'Follow Up', duration: '15m' }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={20} color="#8b5cf6" /> Daily Schedule
        </h3>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
          {schedule.length} Appts
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {schedule.map(appt => (
          <div key={appt.id} style={{ 
            display: 'flex', alignItems: 'stretch', gap: '1rem', 
            padding: '0.75rem', borderRadius: '12px', border: '1px solid #f1f5f9',
            transition: 'background 0.2s', cursor: 'pointer'
          }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-app)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem', borderRight: '1px solid #e2e8f0', minWidth: '70px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{appt.time.split(' ')[0]}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{appt.time.split(' ')[1]}</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={14} color="var(--color-text-secondary)" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{appt.patient}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                <span>{appt.type}</span>
                <span style={{ color: 'var(--color-border)' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12} /> {appt.duration}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingRight: '0.5rem' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}