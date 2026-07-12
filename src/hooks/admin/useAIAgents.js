import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

export const DEFAULT_AGENTS = {
  rag: {
    displayName: 'AgentRAG',
    agentId: 'agent_1779649883481',
    model: 'gemini-2.5-flash',
    region: 'us-west1',
    status: 'active',
    queryType: 'rag',
    description: 'General information & RAG queries. Default route for all standard questions.',
    emoji: '🧠',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    tools: ['Google Search (Grounding)', 'RAG Datastore'],
    consoleUrl: 'https://dialogflow.cloud.google.com/cx/projects/-/locations/us-west1/agents',
  },
  prescription: {
    displayName: 'AgentPrescription',
    agentId: '0686affe-d47d-4efd-8afb-b64c41276f88',
    type: 'vertex',
    model: 'gemini-1.5-flash',
    region: 'europe-west1',
    status: 'active',
    queryType: 'prescription',
    description: 'Handles medical intake and prescription parsing.',
    emoji: '℞',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    tools: ['OCR Parsing', 'Medical Safety Guardrails'],
    consoleUrl: 'https://dialogflow.cloud.google.com/cx/projects/-/locations/europe-west1/agents',
  },
  clinical_data: {
    displayName: 'AgentClinicalData',
    agentId: '4abfec3d-9305-4f34-a1b9-2fdaa8ff071a',
    type: 'vertex',
    model: 'gemini-2.0-flash-exp',
    region: 'europe-west1',
    status: 'active',
    queryType: 'clinical_data',
    description: 'In-depth analysis of scientific literature and peptides.',
    emoji: '🧬',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    tools: ['PubMed Search API', 'Clinical Datastore', 'Biomarker Extraction'],
    consoleUrl: 'https://dialogflow.cloud.google.com/cx/projects/-/locations/europe-west1/agents',
  },
  doctor_protocol: {
    displayName: 'Doctor Protocol AI',
    agentId: 'f320b876-5f0f-468d-9a7e-294026a5e613',
    type: 'vertex',
    model: 'gemini-2.5-pro',
    region: 'europe-west1',
    status: 'active',
    queryType: 'doctor_protocol',
    description: 'Advanced clinical reasoning for custom patient protocol generation.',
    emoji: '👨‍⚕️',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    tools: ['Clinical Reasoning', 'Protocol Formatter', 'Interaction Checker'],
    consoleUrl: 'https://dialogflow.cloud.google.com/cx/projects/-/locations/europe-west1/agents',
  },
  logistics: {
    displayName: 'AgentLogistics',
    agentId: 'logistics-native-001',
    type: 'native',
    model: 'gemini-2.0-flash-lite',
    region: 'global',
    status: 'active',
    queryType: 'logistics',
    description: 'Orders, shipping, pricing, and stock queries. Native Gemini integration.',
    emoji: '📦',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    tools: ['Shipping Cost Estimator', 'Inventory Checker', 'UPS API'],
    consoleUrl: null,
  },
  catalog_builder: {
    displayName: 'Catalog Builder',
    agentId: 'catalog-builder-agent-001',
    type: 'native',
    model: 'gemini-2.5-flash',
    region: 'global',
    status: 'active',
    queryType: 'catalog_builder',
    description: 'Generates structured clinical merchandising catalogs, groupings, and copy.',
    emoji: '📖',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    tools: ['JSON Schema Generator', 'SEO Copywriting'],
    consoleUrl: null,
  },
  document_processor: {
    displayName: 'Document Processing AI',
    agentId: 'doc-processor-001',
    type: 'native',
    model: 'gemini-2.5-flash',
    region: 'global',
    status: 'active',
    queryType: 'document_processing',
    description: 'Reads PDFs, extracts Product Name, Purity, Batch, and generates semantic text for Vector DB.',
    emoji: '📄',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    tools: ['Gemini Vision', 'Text Extraction', 'Data Matching'],
    consoleUrl: null,
  },
  admin_assistant: {
    displayName: 'Admin Co-Pilot',
    agentId: 'admin-agent-001',
    type: 'native',
    model: 'gemini-2.5-pro',
    region: 'global',
    status: 'active',
    queryType: 'admin_assistant',
    description: 'Autonomous Admin Assistant. Analyzes commercial data (sales, LTV, trends) and helps orchestrate ERP tasks.',
    emoji: '🤖',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    tools: ['Sales Intelligence', 'CRM Lookup', 'Financial Reports'],
    consoleUrl: null,
  },
};

export function useAIAgents() {
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadAgents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, 'ai_config', 'agents'));
      const usageSnap = await getDoc(doc(db, 'ai_metrics', 'usage'));

      if (usageSnap.exists()) {
        setMetrics(usageSnap.data()?.agents || {});
      }

      if (snap.exists()) {
        const data = snap.data();
        const merged = { ...DEFAULT_AGENTS };
        for (const key of Object.keys(data)) {
          merged[key] = {
            ...(merged[key] || {
              displayName: key,
              status: 'active',
              type: 'native',
              model: 'unknown',
              region: 'global',
              emoji: '🤖',
              tools: [],
              description: 'Dynamically loaded from database.'
            }),
            ...data[key]
          };
        }
        setAgents(merged);
        
        // Inject data context for Atlas AI
        const activeAgents = Object.entries(merged).filter(([_, a]) => a.status === 'active');
        const tokenSum = Object.values(usageSnap.data()?.agents || {}).reduce((acc, m) => acc + (m.tokens || 0), 0);
        
        window.dispatchEvent(new CustomEvent('admin-context-update', {
          detail: {
            page: 'ai-agents',
            totalAgents: Object.keys(merged).length,
            activeAgentsCount: activeAgents.length,
            totalTokensUsed: tokenSum,
            agentList: activeAgents.map(([key, a]) => ({ key, name: a.name, model: a.model })),
            summary: `AI Agents Panel: ${activeAgents.length} active agents. Total tokens used: ${tokenSum}.`
          }
        }));
      }
    } catch (err) {
      console.error('[useAIAgents] Load failed:', err);
      setError(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(() => loadAgents(true), 30000);
    return () => clearInterval(interval);
  }, [loadAgents]);

  const toggleAgent = async (agentKey, enable) => {
    setSaving(true);
    setError(null);
    try {
      const newStatus = enable ? 'active' : 'disabled';
      const configRef = doc(db, 'ai_config', 'agents');
      const snap = await getDoc(configRef);
      const existing = snap.exists() ? snap.data() : {};
      
      await setDoc(configRef, {
        ...existing,
        [agentKey]: {
          ...(existing[agentKey] || {}),
          status: newStatus,
          agentId: agents[agentKey].agentId,
        },
      });
      
      setAgents((prev) => ({
        ...prev,
        [agentKey]: { ...prev[agentKey], status: newStatus },
      }));
      return true;
    } catch (err) {
      console.error('[useAIAgents] Toggle failed:', err);
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const saveAgentConfig = async (agentKey, data) => {
    setSaving(true);
    setError(null);
    try {
      const configRef = doc(db, 'ai_config', 'agents');
      const snap = await getDoc(configRef);
      const existing = snap.exists() ? snap.data() : {};
      
      await setDoc(configRef, {
        ...existing,
        [agentKey]: {
          ...(existing[agentKey] || {}),
          model: data.model,
          systemInstruction: data.systemInstruction,
        },
      });
      
      setAgents((prev) => ({
        ...prev,
        [agentKey]: {
          ...prev[agentKey],
          model: data.model,
          systemInstruction: data.systemInstruction,
        },
      }));
      return true;
    } catch (err) {
      console.error('[useAIAgents] Save config failed:', err);
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    agents,
    metrics,
    loading,
    saving,
    error,
    refresh: loadAgents,
    toggleAgent,
    saveAgentConfig
  };
}
