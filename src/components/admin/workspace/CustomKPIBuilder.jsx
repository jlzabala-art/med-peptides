import Plus from "lucide-react/dist/esm/icons/plus";
import X from "lucide-react/dist/esm/icons/x";
import Activity from "lucide-react/dist/esm/icons/activity";
import Users from "lucide-react/dist/esm/icons/users";
import Building from "lucide-react/dist/esm/icons/building";
import Pill from "lucide-react/dist/esm/icons/pill";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React, { useState } from 'react';







import { useWorkspace } from './WorkspaceContext';

const METRIC_TYPES = [
  { id: 'count', label: 'Total Count' },
  { id: 'sum', label: 'Sum of Values' },
  { id: 'average', label: 'Average' },
  { id: 'ratio', label: 'Ratio (%)' }
];

const DATA_SOURCES = [
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'clinics', label: 'Clinics', icon: Building },
  { id: 'physicians', label: 'Physicians', icon: Activity },
  { id: 'orders', label: 'Orders', icon: Pill },
  { id: 'revenue', label: 'Revenue', icon: Activity }
];

export default function CustomKPIBuilder({ onClose }) {
  const { addWidget } = useWorkspace();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    name: 'New Custom KPI',
    source: 'patients',
    type: 'count',
    filter: ''
  });

  const handleSave = () => {
    addWidget({
      id: `custom-kpi-${Date.now()}`,
      type: 'kpi',
      size: 'small',
      data: {
        label: config.name,
        source: config.source,
        calculation: config.type,
        isCustom: true
      }
    });
    onClose();
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Custom KPI Builder</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20}/></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
            <label className="gcp-label">1. Choose Data Source</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {DATA_SOURCES.map(source => {
                const Icon = source.icon;
                const isSelected = config.source === source.id;
                return (
                  <div key={source.id} onClick={() => setConfig({...config, source: source.id})}
                       style={{ padding: '1rem', border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: isSelected ? 'rgba(0,113,189,0.05)' : 'white', transition: 'all 0.2s' }}>
                    <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}><Icon size={20} /></div>
                    <div style={{ fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{source.label}</div>
                  </div>
                )
              })}
            </div>
            <button className="gcp-btn-primary" onClick={() => setStep(2)} style={{ marginTop: '1rem' }}>Next Step <ArrowRight size={16}/></button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
             <div>
               <label className="gcp-label">2. Calculation Type</label>
               <select className="gcp-input" value={config.type} onChange={e => setConfig({...config, type: e.target.value})}>
                 {METRIC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
               </select>
             </div>
             <div>
               <label className="gcp-label">3. Filter (Optional)</label>
               <input type="text" className="gcp-input" placeholder="e.g. status == 'active'" value={config.filter} onChange={e => setConfig({...config, filter: e.target.value})} />
             </div>
             <div>
               <label className="gcp-label">4. KPI Title</label>
               <input type="text" className="gcp-input" placeholder="e.g. Active Patients" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} />
             </div>
             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button className="gcp-btn-secondary" onClick={() => setStep(1)}>Back</button>
               <button className="gcp-btn-primary" onClick={handleSave} style={{ flex: 1, backgroundColor: '#10b981', borderColor: '#10b981' }}>Create Custom KPI <Plus size={16}/></button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}