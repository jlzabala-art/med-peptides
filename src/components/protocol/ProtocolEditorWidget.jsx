import React, { useState, Suspense, lazy } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Save, FlaskConical, Beaker, FileText, Activity, TrendingUp, Layers, Cloud, CloudOff, CheckCircle2 } from 'lucide-react';
import PhaseEditor from './PhaseEditor';
import { useShop } from '../../context/ShopProvider';

const PharmacokineticsSimulator = lazy(() => import('./PharmacokineticsSimulator'));
const ProtocolHeaderCharts = lazy(() => import('./ProtocolHeaderCharts'));
const ProtocolGanttChart = lazy(() => import('./ProtocolGanttChart'));

// eslint-disable-next-line no-unused-vars
const AccordionSection = React.memo(({ icon: Icon, title, isActive, onToggle, children }) => {
  return (
    <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <button 
        onClick={onToggle}
        style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isActive ? '#f8fafc' : 'white', border: 'none', cursor: 'pointer', borderBottom: isActive ? '1px solid #e2e8f0' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
          <Icon size={18} color="#3b82f6" /> {title}
        </div>
        <ChevronDown size={18} style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {isActive && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: 'white' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function ProtocolEditorWidget({
  initialData,
  onSave,
  isSaving,
  lastSavedAt,
  onCancel,
  showCancel = false
}) {
  const [formData, setFormData] = useState({
    protocol_id: '',
    protocol_name: '',
    protocol_slug: '',
    category: '',
    theme: '',
    description: '',
    status: 'draft',
    phases: [],
    supplements: [],
    technicalInfo: {
      mechanismOfAction: '',
      halfLife: '24 hours',
      clinicalEvidence: '',
      sideEffects: '',
      contraindications: '',
    },
    outcomes: [],
    reconstitution: {
      vialSizeMg: 5,
      bacWaterMl: 2
    },
    ...initialData
  });

  const { products } = useShop();

  const [activeSection, setActiveSection] = useState('general');

  const updateForm = (field, value) => setFormData(p => ({ ...p, [field]: value }));
  const updateTech = (field, value) => setFormData(p => ({ 
    ...p, 
    technicalInfo: { ...p.technicalInfo, [field]: value } 
  }));
  const updateRecon = (field, value) => setFormData(p => ({
    ...p,
    reconstitution: { ...p.reconstitution, [field]: value }
  }));

  const handleToggleAccordion = (id) => {
    setActiveSection(prev => prev === id ? '' : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{initialData?.protocol_name ? 'Edit Protocol' : 'New Protocol'}</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Autosave Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
            {isSaving ? (
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Cloud size={14} color="#3b82f6" /> <span>Saving changes...</span>
              </motion.div>
            ) : lastSavedAt ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> <span>Saved {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CloudOff size={14} /> <span>Unsaved changes</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {showCancel && <button onClick={onCancel} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>}
            <button onClick={() => onSave(formData)} disabled={isSaving} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AccordionSection id="general" icon={FileText} title="General & Configuration" isActive={activeSection === 'general'} onToggle={() => handleToggleAccordion('general')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Protocol Name</label>
                <input className="admin-premium-input" value={formData.protocol_name || ''} onChange={e => updateForm('protocol_name', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Slug</label>
                <input className="admin-premium-input" value={formData.protocol_slug || formData.protocol_id || ''} onChange={e => updateForm('protocol_slug', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Description</label>
                <textarea className="admin-premium-input" rows={4} value={formData.description || ''} onChange={e => updateForm('description', e.target.value)} />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection id="phases" icon={Layers} title="Phases & Dosage" isActive={activeSection === 'phases'} onToggle={() => handleToggleAccordion('phases')}>
            <PhaseEditor 
              phases={formData.phases || []} 
              products={products} 
              onChange={newPhases => updateForm('phases', newPhases)} 
            />
          </AccordionSection>

          <AccordionSection id="clinical" icon={Activity} title="Clinical & Science" isActive={activeSection === 'clinical'} onToggle={() => handleToggleAccordion('clinical')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Mechanism of Action</label>
                <textarea className="admin-premium-input" rows={3} value={formData.technicalInfo?.mechanismOfAction || ''} onChange={e => updateTech('mechanismOfAction', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Half-Life (e.g., "12 hours")</label>
                  <input className="admin-premium-input" value={formData.technicalInfo?.halfLife || ''} onChange={e => updateTech('halfLife', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Contraindications</label>
                <textarea className="admin-premium-input" rows={2} value={formData.technicalInfo?.contraindications || ''} onChange={e => updateTech('contraindications', e.target.value)} />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection id="reconstitution" icon={Beaker} title="Reconstitution & Syringe Math" isActive={activeSection === 'reconstitution'} onToggle={() => handleToggleAccordion('reconstitution')}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Vial Size (mg)</label>
                <input type="number" min="1" className="admin-premium-input" value={formData.reconstitution?.vialSizeMg || 5} onChange={e => updateRecon('vialSizeMg', parseFloat(e.target.value))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>BAC Water (mL)</label>
                <input type="number" min="0.5" step="0.5" className="admin-premium-input" value={formData.reconstitution?.bacWaterMl || 2} onChange={e => updateRecon('bacWaterMl', parseFloat(e.target.value))} />
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Live Preview Pane */}
        <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '300px' }}>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} color="#3b82f6" /> Live Preview: Pharmacokinetics</h3>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Simulator...</div>}>
              <PharmacokineticsSimulator peptideData={{
                halfLife: formData.technicalInfo?.halfLife || '24 hours',
                schedule: formData.phases?.[0]?.items?.[0]?.frequency || 'Daily',
                dose: formData.phases?.[0]?.items?.[0]?.dosage || 1000
              }} />
            </Suspense>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '300px' }}>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={16} color="#3b82f6" /> Live Preview: Efficacy Timeline</h3>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', minHeight: '250px' }}>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Timeline...</div>}>
                <ProtocolHeaderCharts protocol={formData} />
              </Suspense>
            </div>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
             <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Gantt...</div>}>
                <ProtocolGanttChart phases={formData.phases} durationScale={1} />
             </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
