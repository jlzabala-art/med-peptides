import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Save, FlaskConical, Beaker, FileText, Activity, TrendingUp, Layers } from 'lucide-react';
import InjectionDoseChart from './InjectionDoseChart';
import PharmacokineticsSimulator from './PharmacokineticsSimulator';
import ProtocolHeaderCharts from './ProtocolHeaderCharts';
import PhaseEditor from './PhaseEditor';
import { useShop } from '../../context/ShopProvider';

export default function ProtocolEditorWidget({
  initialData,
  onSave,
  isSaving,
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

  const AccordionSection = ({ id, icon: Icon, title, children }) => {
    const isActive = activeSection === id;
    return (
      <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <button 
          onClick={() => setActiveSection(isActive ? '' : id)}
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{initialData?.protocol_name ? 'Edit Protocol' : 'New Protocol'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {showCancel && <button onClick={onCancel} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>}
          <button onClick={() => onSave(formData)} disabled={isSaving} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AccordionSection id="general" icon={FileText} title="General & Configuration">
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

          <AccordionSection id="phases" icon={Layers} title="Phases & Dosage">
            <PhaseEditor 
              phases={formData.phases || []} 
              products={products} 
              onChange={newPhases => updateForm('phases', newPhases)} 
            />
          </AccordionSection>

          <AccordionSection id="clinical" icon={Activity} title="Clinical & Science">
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

          <AccordionSection id="reconstitution" icon={Beaker} title="Reconstitution & Syringe Math">
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
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} color="#3b82f6" /> Live Preview: Pharmacokinetics</h3>
            <PharmacokineticsSimulator peptideData={{
              halfLife: formData.technicalInfo?.halfLife || '24 hours',
              schedule: formData.phases?.[0]?.items?.[0]?.frequency || 'Daily',
              dose: formData.phases?.[0]?.items?.[0]?.dosage || 1000
            }} />
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '300px' }}>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={16} color="#3b82f6" /> Live Preview: Efficacy Timeline</h3>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
              <ProtocolHeaderCharts protocol={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
