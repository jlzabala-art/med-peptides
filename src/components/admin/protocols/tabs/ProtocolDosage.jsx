import React from 'react';
import { CalendarDays, Droplet, ActivitySquare } from 'lucide-react';
import ProtocolDosingCalendar from '../ProtocolDosingCalendar';
import DosageMatrix from '../DosageMatrix';
import ReconstitutionPlanner from '../ReconstitutionPlanner';

export default function ProtocolDosage({ protocol, onUpdate }) {
  
  // Calculate total weekly volume just as an aggregated KPI
  const weeklyVolume = protocol?.phases?.[0]?.items?.reduce((acc, item) => acc + (item.frequencyPerWeek * (item.doseValue || 0)), 0) || 0;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header & KPI Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={24} color="var(--primary)" /> Dosage & Administration Calendar
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Configure exact weekly dosages, day-by-day administration schedules, and precise reconstitution instructions for lyophilized products.
          </p>
        </div>
      </div>

      {/* Mini KPIs for Dosage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fed7aa' }}>
          <div style={{ color: '#c2410c', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Weekly Admin Volume</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={24} /> {weeklyVolume.toFixed(2)} units/wk
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
          <div style={{ color: '#047857', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Compounds</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ActivitySquare size={24} /> {protocol?.phases?.[0]?.items?.length || 0}
          </div>
        </div>
      </div>

      {/* Embedded Deep Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
             <CalendarDays size={18} color="var(--primary)" /> Interactive Schedule
          </h4>
          <ProtocolDosingCalendar protocol={protocol} onUpdate={onUpdate} />
        </div>

        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
             <ActivitySquare size={18} color="#059669" /> Dosage Calculations
          </h4>
          <DosageMatrix protocol={protocol} />
        </div>

        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
             <Droplet size={18} color="#0284c7" /> Reconstitution Formulas
          </h4>
          <ReconstitutionPlanner protocol={protocol} />
        </div>
      </div>
      
    </div>
  );
}
