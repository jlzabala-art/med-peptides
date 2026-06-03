import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card } from '../ui';
import { Settings2, Zap, ShieldCheck, Mail, Users, ToggleLeft, ToggleRight, Save, Loader2 } from 'lucide-react';

const DEFAULT_WORKFLOWS = {
  replenishment: {
    id: 'replenishment',
    name: 'AI Automated Replenishment',
    description: 'Predicts stockouts and generates Draft POs automatically.',
    icon: Zap,
    enabled: true,
    params: {
      days_to_stockout: 15,
      auto_approve: false
    }
  },
  compliance: {
    id: 'compliance',
    name: 'Regulatory Compliance Check',
    description: 'Auto-audits Supplier COAs for purity and endotoxin limits.',
    icon: ShieldCheck,
    enabled: true,
    params: {
      min_purity: 99.0,
      max_endotoxin: 0.1,
      quarantine_on_fail: true
    }
  },
  dispute: {
    id: 'dispute',
    name: 'Dispute & Invoice Resolver',
    description: 'Pauses Zoho Books payment sync and auto-emails suppliers when invoices do not match RFQs.',
    icon: Mail,
    enabled: false,
    params: {
      tolerance_amount: 5.00
    }
  },
  routing: {
    id: 'routing',
    name: 'Lead Scoring & VIP Routing',
    description: 'Scores incoming B2B registrations and routes VIP clinics to Senior Account Managers.',
    icon: Users,
    enabled: true,
    params: {
      vip_score_threshold: 80
    }
  }
};

export default function AdminWorkflowsTab() {
  const [workflows, setWorkflows] = useState(DEFAULT_WORKFLOWS);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'system_config', 'workflows');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        // Merge DB settings with defaults
        const dbData = snap.data();
        const merged = { ...DEFAULT_WORKFLOWS };
        for (const key in merged) {
          if (dbData[key]) {
            merged[key].enabled = dbData[key].enabled;
            merged[key].params = { ...merged[key].params, ...dbData[key].params };
          }
        }
        setWorkflows(merged);
      }
    } catch (err) {
      console.error("Error loading workflow settings:", err);
    }
    setLoading(false);
  };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      const docRef = doc(db, 'system_config', 'workflows');
      await setDoc(docRef, workflows, { merge: true });
    } catch (err) {
      console.error("Error saving workflow settings:", err);
    }
    setSavingId(null);
  };

  const toggleWorkflow = (id) => {
    setWorkflows(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled }
    }));
  };

  const updateParam = (id, paramKey, value) => {
    setWorkflows(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        params: { ...prev[id].params, [paramKey]: value } 
      }
    }));
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} /></div>;
  }

  return (
    <div style={{ paddingBottom: '5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', borderRadius: '12px' }}>
          <Settings2 size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Automation Engine</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>Global settings for B2B brokerage and compounding autonomous agents.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.values(workflows).map(wf => (
          <Card key={wf.id} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: wf.enabled ? 'rgba(139, 92, 246, 0.1)' : 'var(--color-bg-tertiary)', color: wf.enabled ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                  <wf.icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    {wf.name}
                    <button onClick={() => toggleWorkflow(wf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}>
                      {wf.enabled ? (
                        <ToggleRight style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)' }} />
                      ) : (
                        <ToggleLeft style={{ width: '2rem', height: '2rem', color: 'var(--color-text-tertiary)' }} />
                      )}
                    </button>
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', maxWidth: '42rem' }}>{wf.description}</p>
                </div>
              </div>
              <button 
                onClick={() => handleSave(wf.id)}
                disabled={savingId === wf.id}
                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                {savingId === wf.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> : <Save size={16}/>}
                Save Config
              </button>
            </div>

            {/* Configurable Parameters */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', opacity: wf.enabled ? 1 : 0.4, pointerEvents: wf.enabled ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
              {Object.keys(wf.params).map(paramKey => {
                const val = wf.params[paramKey];
                const type = typeof val;
                
                return (
                  <div key={paramKey} style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      {paramKey.replace(/_/g, ' ')}
                    </label>
                    {type === 'boolean' ? (
                      <select 
                        value={val.toString()} 
                        onChange={(e) => updateParam(wf.id, paramKey, e.target.value === 'true')}
                        style={{ width: '100%', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}
                      >
                        <option value="true">Enabled (Yes)</option>
                        <option value="false">Disabled (No)</option>
                      </select>
                    ) : type === 'number' ? (
                      <input 
                        type="number" 
                        value={val}
                        onChange={(e) => updateParam(wf.id, paramKey, parseFloat(e.target.value))}
                        style={{ width: '100%', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}
                      />
                    ) : (
                      <input 
                        type="text" 
                        value={val}
                        onChange={(e) => updateParam(wf.id, paramKey, e.target.value)}
                        style={{ width: '100%', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
