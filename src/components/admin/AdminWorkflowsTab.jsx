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
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-xl">
          <Settings2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Engine</h1>
          <p className="text-gray-400">Global settings for B2B brokerage and compounding autonomous agents.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.values(workflows).map(wf => (
          <Card key={wf.id} className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${wf.enabled ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-gray-800 text-gray-500'}`}>
                  <wf.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    {wf.name}
                    <button onClick={() => toggleWorkflow(wf.id)} className="focus:outline-none">
                      {wf.enabled ? (
                        <ToggleRight className="w-8 h-8 text-fuchsia-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-600" />
                      )}
                    </button>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-2xl">{wf.description}</p>
                </div>
              </div>
              <button 
                onClick={() => handleSave(wf.id)}
                disabled={savingId === wf.id}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-gray-700 transition-colors"
              >
                {savingId === wf.id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                Save Config
              </button>
            </div>

            {/* Configurable Parameters */}
            <div className={`mt-6 pt-6 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${wf.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              {Object.keys(wf.params).map(paramKey => {
                const val = wf.params[paramKey];
                const type = typeof val;
                
                return (
                  <div key={paramKey} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {paramKey.replace(/_/g, ' ')}
                    </label>
                    {type === 'boolean' ? (
                      <select 
                        value={val.toString()} 
                        onChange={(e) => updateParam(wf.id, paramKey, e.target.value === 'true')}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                      >
                        <option value="true">Enabled (Yes)</option>
                        <option value="false">Disabled (No)</option>
                      </select>
                    ) : type === 'number' ? (
                      <input 
                        type="number" 
                        value={val}
                        onChange={(e) => updateParam(wf.id, paramKey, parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                      />
                    ) : (
                      <input 
                        type="text" 
                        value={val}
                        onChange={(e) => updateParam(wf.id, paramKey, e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
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
