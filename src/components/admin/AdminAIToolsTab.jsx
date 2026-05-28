import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { Wrench, Database, FileText, Search, Truck, DollarSign, ShoppingCart, User, Save, CheckCircle2, Image as ImageIcon, ClipboardList, GitMerge, GraduationCap, ShieldAlert, FileOutput } from 'lucide-react';
import AppDataTable from '../ui/AppDataTable';
import AppFilterBar from '../ui/AppFilterBar';
import AppActionGroup from '../ui/AppActionGroup';

const MASTER_TOOLS = [
  { id: 'catalog_search', label: 'Catalog Search', description: 'Performs a semantic and exact search in the Firebase product database. Extracts details such as concentration, administration routes (oral, injectable), vial size, and inventory status to suggest appropriate products.', icon: Search, color: '#3B82F6' },
  { id: 'read_pdf_knowledge_base', label: 'Knowledge Base Reader', description: 'Securely accesses the "knowledge_base" Cloud Storage folder. Scans, vectorizes, and reads PDF documents or scientific articles to answer medical questions based strictly on your authorized literature.', icon: Database, color: '#8B5CF6' },
  { id: 'calculate_shipping', label: 'Calculate Shipping', description: 'Connects with the logistics gateway to calculate accurate shipping costs, customs taxes (import/export), and transit times based on the destination country (using FedEx/UPS API).', icon: Truck, color: '#F59E0B' },
  { id: 'get_pricing', label: 'Get Pricing', description: 'Retrieves dynamic product pricing by evaluating the user\'s role (Patient vs Professional) and region. Automatically applies volume rules (Bulk Orders) for B2B and wholesalers.', icon: DollarSign, color: '#10B981' },
  { id: 'create_order_draft', label: 'Create Order Draft', description: 'Autonomously builds a draft order (or a medical prescription) directly in the user\'s cart. Adds the correct products, exact quantities, and required consumables (syringes, bacteriostatic water).', icon: ShoppingCart, color: '#EF4444' },
  { id: 'get_patient_history', label: 'Patient History', description: 'Securely accesses the active patient\'s clinical data under strict privacy protocols. Allows the agent to review past orders, uploaded lab results, and previously assigned medical protocols to provide personalized answers.', icon: User, color: '#14B8A6' },
  { id: 'parse_prescription', label: 'Prescription Parser', description: 'Medical natural language processing engine. Analyzes unstructured clinical text or transcriptions to extract key entities: peptide names, dosage guidelines, milligrams, frequencies, and patient metabolic goals.', icon: ClipboardList, color: '#EC4899' },
  { id: 'catalog_semantic_matcher', label: 'Catalog Semantic Matcher', description: 'Vital tool for B2B imports. Cross-references an external raw material (API) list with our internal catalog. Detects clinical equivalencies (even if trade names differ) and proposes automatic integrations for missing products.', icon: GitMerge, color: '#F97316' },
  { id: 'analyze_medical_images', label: 'Image Analyzer', description: 'Enables multimodal vision for the agent. Allows it to "see" and interpret lab result charts, molecular diagrams, or medical prescription photos, extracting relevant alphanumeric data.', icon: ImageIcon, color: '#0EA5E9' },
  { id: 'interactive_onboarding', label: 'Interactive Onboarding', description: 'Initiates a dynamic, step-by-step tutorial adapted to the user\'s role. Detects if they are a Patient, Doctor, or Wholesaler, and teaches them how to use the platform, access B2B pricing, or sign protocols, maximizing tech adoption.', icon: GraduationCap, color: '#6366F1' },
  { id: 'generate_clinical_pdf', label: 'Generate Clinical PDF', description: 'Compiles all medical information discussed in the session and generates an official "Medical Protocol" PDF document with the clinic\'s branding, sending it directly to the patient\'s portal.', icon: FileOutput, color: '#8B5CF6' },
  { id: 'check_compliance_rules', label: 'Compliance & Safety Check', description: 'Medical audit tool. Evaluates in real-time whether the suggested protocol violates any safety guidelines (e.g., excessive peptide dosage) or cosmetic vs. therapeutic advertising regulations (FDA/EMA).', icon: ShieldAlert, color: '#EF4444' },
];

export default function AdminAIToolsTab() {
  const [agents, setAgents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'ai_config', 'agents'));
      if (snap.exists()) {
        const data = snap.data();
        // Ensure all agents have a tools array
        const normalized = {};
        for (const [key, agent] of Object.entries(data)) {
          normalized[key] = {
            ...agent,
            tools: Array.isArray(agent.tools) ? agent.tools : []
          };
        }
        setAgents(normalized);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      showToast('Error loading agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleTool = (agentKey, toolId) => {
    setAgents(prev => {
      const agent = prev[agentKey];
      const tools = new Set(agent.tools || []);
      if (tools.has(toolId)) {
        tools.delete(toolId);
      } else {
        tools.add(toolId);
      }
      return {
        ...prev,
        [agentKey]: {
          ...agent,
          tools: Array.from(tools)
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'ai_config', 'agents'), agents, { merge: true });
      showToast('Agent toolkit updated successfully');
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading AI toolkit configuration...
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={24} style={{ color: 'var(--primary)' }} />
            AI Toolkit & Skills
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
            Assign specific capabilities to each AI agent. When an agent has a tool enabled, it can autonomously use it during conversations to fetch data or perform actions.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '0.9rem', cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1, boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Dictionary Section */}
      <div>
        <AppFilterBar 
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search tools by name, ID, or description..."
        />
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
          <AppDataTable
            columns={[
              {
                key: 'tool',
                header: 'Tool / Skill',
                sortValue: t => t.label,
                render: t => {
                  const Icon = t.icon;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} style={{ color: t.color }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{t.label}</div>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.id}</code>
                      </div>
                    </div>
                  );
                }
              },
              {
                key: 'description',
                header: 'Description',
                render: t => (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '450px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.description}
                  </div>
                )
              }
            ]}
            data={MASTER_TOOLS.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()))}
            keyField="id"
            emptyTitle="No skills found"
            emptyDescription="Try adjusting your search criteria."
            expandableRender={(t) => (
              <div style={{ padding: '1.5rem', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Database size={16} color="var(--primary)" />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>Skill Tree Detail & Metadata</h4>
                </div>
                <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {t.description}
                </div>
                <pre style={{ margin: 0, padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b', fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
{JSON.stringify({ id: t.id, label: t.label, color: t.color, system_prompt_injection: 'Injecting capabilities for ' + t.id + '...', permissions: ['read', 'execute'] }, null, 2)}
                </pre>
              </div>
            )}
          />
        </div>
      </div>

      {/* Assignment Matrix */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>Agent Assignments</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(agents).map(([agentKey, agent]) => (
            <div key={agentKey} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${agentKey}`} alt="avatar" style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{agent.displayName || agentKey}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {agent.type === 'native' ? 'Native Gemini' : 'Vertex CX'} • {agent.model || 'Default Model'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {MASTER_TOOLS.map(tool => {
                  const isActive = agent.tools?.includes(tool.id);
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToggleTool(agentKey, tool.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                        background: isActive ? `${tool.color}10` : 'transparent',
                        border: `1px solid ${isActive ? tool.color : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s',
                        color: isActive ? tool.color : 'var(--text-muted)'
                      }}
                    >
                      {isActive ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                      <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }}>{tool.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 1.5rem',
          background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white',
          borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
          animation: 'slideUp 0.3s ease'
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.5, pointerEvents: 'none', zIndex: 100 }}>
        Widget: AdminAIToolsTab
      </div>
    </div>
  );
}
