/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Globe,
  AlertTriangle,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// ── Static registry (source of truth until Firestore doc is populated) ────────
const DEFAULT_AGENTS = {
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
    consoleUrl: null, // Custom gemini agent
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

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    active: {
      label: 'Active',
      color: 'var(--color-success)',
      bg: 'rgba(16,185,129,0.1)',
      Icon: CheckCircle,
    },
    pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: Clock },
    disabled: {
      label: 'Disabled',
      color: 'var(--color-danger)',
      bg: 'rgba(239,68,68,0.1)',
      Icon: XCircle,
    },
    error: {
      label: 'Error',
      color: 'var(--color-danger)',
      bg: 'rgba(239,68,68,0.1)',
      Icon: AlertTriangle,
    },
  };
  const { label, color, bg, Icon } = map[status] || map.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-sm)',
        background: bg,
        color,
        fontSize: '0.72rem',
        fontWeight: 800,
      }}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

// ── Model badge ───────────────────────────────────────────────────────────────
function ModelBadge({ model }) {
  const isFlash = model?.includes('flash');
  const isPro = model?.includes('pro');
  const color = isPro ? '#8b5cf6' : isFlash ? 'var(--color-primary)' : 'var(--color-text-tertiary)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-sm)',
        background: `${color}15`,
        color,
        fontSize: '0.7rem',
        fontWeight: 700,
        border: `1px solid ${color}30`,
      }}
    >
      <Zap size={10} />
      {model || 'unknown'}
    </span>
  );
}

const MODEL_PRICING = {
  'gemini-2.5-flash': '~$0.075 / 1M tokens',
  'gemini-2.5-pro': '~$1.25 / 1M tokens',
  'gemini-2.0-flash-exp': '~$0.075 / 1M tokens',
  'gemini-1.5-flash': '~$0.075 / 1M tokens',
  'gemini-2.0-flash-lite': '~$0.075 / 1M tokens',
};

function AgentCard({ agentKey, agent, onEdit, isActive, saving, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isActive ? 'var(--success)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'all 0.2s',
        boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.05)' : 'none',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          background: expanded ? 'var(--bg-light)' : 'transparent',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '4px',
              flexShrink: 0,
              background: 'var(--bg-app)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.2rem',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--success)' : 'var(--error)',
                  boxShadow: isActive ? '0 0 8px var(--success)' : 'none',
                }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {agent.displayName}
              </h3>
              <StatusChip status={isActive ? 'active' : 'inactive'} />
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.35rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  borderRadius: '4px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {agent.type === 'native' ? 'Native Gemini' : 'Vertex CX'}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                marginBottom: '0.5rem',
              }}
            >
              {agent.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontWeight: 600 }}>
                {agent.model}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                • {agent.region}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                • {agent.queryType}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <button
            onClick={() => onToggle(agentKey, !isActive)}
            disabled={saving}
            style={{
              background: 'none',
              border: 'none',
              cursor: saving ? 'wait' : 'pointer',
              color: isActive ? 'var(--success)' : 'var(--error)',
              padding: '0.25rem',
              opacity: saving ? 0.5 : 1,
              transition: 'color 0.2s',
            }}
          >
            {isActive ? (
              <ToggleRight size={32} strokeWidth={2} />
            ) : (
              <ToggleLeft size={32} strokeWidth={2} />
            )}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
            }}
            title="Expand details"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ padding: '1.25rem', background: 'var(--surface)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <InfoRow label="Agent ID" value={agent.agentId || '—'} mono />
            <InfoRow label="Query type" value={agent.queryType} mono />
            <InfoRow label="Model" value={agent.model} />
            <InfoRow label="Est. Cost" value={MODEL_PRICING[agent.model] || 'Variable'} />
          </div>

          {agent.tools && agent.tools.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                Active Tools
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {agent.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-main)',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => onEdit(agentKey)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--bg-light)',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit Model / Instructions
            </button>
            {agent.consoleUrl && (
              <a
                href={agent.consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#1a73e8',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                Open in Google Cloud Console <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.2rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          fontFamily: mono ? 'monospace' : 'inherit',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Summary row ───────────────────────────────────────────────────────────────
function SummaryBar({ agents }) {
  const values = Object.values(agents);
  const active = values.filter((a) => a.status === 'active').length;
  const pending = values.filter((a) => a.status === 'pending').length;
  const total = values.length;
  const models = [...new Set(values.map((a) => a.model))].length;

  const items = [
    { label: 'Total Agents', value: total, color: 'var(--color-primary)' },
    { label: 'Active', value: active, color: 'var(--color-success)' },
    { label: 'Pending', value: pending, color: '#f59e0b' },
    { label: 'Models in use', value: models, color: '#8b5cf6' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {items.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color, letterSpacing: '-0.03em' }}>
            {value}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginTop: '0.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminAIAgentsTab() {
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [editModal, setEditModal] = useState({ open: false, agentKey: null, data: {} });

  // Load from Firestore (overrides static defaults if present)
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'ai_config', 'agents'));
      const usageSnap = await getDoc(doc(db, 'ai_metrics', 'usage'));

      if (usageSnap.exists()) {
        setMetrics(usageSnap.data()?.agents || {});
      }

      if (snap.exists()) {
        const data = snap.data();
        // Merge: use Firestore status/agentId but keep static metadata. 
        // We iterate over ALL keys in Firestore to allow dynamic agents to appear.
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
      }
    } catch (err) {
      console.error('[AdminAIAgentsTab] Load failed:', err);
      if (!silent) showToast('Failed to load agent config from Firestore', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [load]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  async function handleToggle(agentKey, enable) {
    setSaving(true);
    try {
      const newStatus = enable ? 'active' : 'disabled';
      // Persist to Firestore
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
      showToast(`${agents[agentKey].displayName} ${enable ? 'enabled' : 'disabled'} ✓`);
    } catch (err) {
      console.error('[AdminAIAgentsTab] Toggle failed:', err);
      showToast('Failed to update agent status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditConfig = (agentKey) => {
    const agent = agents[agentKey];
    setEditModal({
      open: true,
      agentKey,
      data: {
        model: agent.model || 'gemini-2.5-flash',
        systemInstruction: agent.systemInstruction || '',
      },
    });
  };

  async function saveConfig() {
    setSaving(true);
    try {
      const { agentKey, data } = editModal;
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
      showToast('Configuration updated ✓');
      setEditModal({ open: false, agentKey: null, data: {} });
    } catch (err) {
      console.error('[AdminAIAgentsTab] Save config failed:', err);
      showToast('Failed to update config', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: '#1a73e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bot size={22} color="var(--color-bg-surface)" />
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            AI Agents
          </h2>
          <p
            style={{
              margin: '0.15rem 0 0',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            Vertex AI Agent Builder · europe-west1 · Dialogflow CX · Pay-per-use
          </p>
        </div>
        <button
          id="refresh-ai-agents"
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: loading ? 'var(--color-text-tertiary)' : 'var(--primary)',
            color: 'var(--color-bg-surface)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <RefreshCw
            size={13}
            style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
          />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Summary KPIs */}
      <SummaryBar agents={agents} />

      {/* Budget Banner */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem 1.5rem',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'rgba(59, 130, 246, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: '#1a73e8', display: 'flex' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Monthly AI Budget Limit: €50.00
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Enforced via Google Cloud Billing Alerts.
            </div>
          </div>
        </div>
        <a
          href="https://console.cloud.google.com/billing/budgets"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.8rem',
            color: '#1a73e8',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
          }}
        >
          Manage Budget <ExternalLink size={14} />
        </a>
      </div>

      {/* Agent Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        {Object.entries(agents).map(([key, agent]) => (
          <AgentCard
            key={key}
            agentKey={key}
            agent={agent}
            isActive={agent.status === 'active'}
            metric={metrics[key]}
            onToggle={handleToggle}
            onEdit={handleEditConfig}
            saving={saving}
          />
        ))}
      </div>

      {/* Router info note */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(59,130,246,0.2)',
          background: 'rgba(59,130,246,0.04)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--text-main)' }}>🔀 Routing:</strong> Each request's{' '}
        <code
          style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}
        >
          query_type
        </code>{' '}
        field is matched against the AGENT_REGISTRY in{' '}
        <code
          style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}
        >
          ai_utils.js
        </code>
        . Disabling an agent here sets its status in Firestore{' '}
        <code
          style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}
        >
          ai_config/agents
        </code>
        , which the router reads before each call. Disabled agents fall back to AgentRAG.
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'var(--color-bg-surface)',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 9999,
            animation: 'slideUp 0.3s ease',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              width: '90%',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3
              style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800 }}
            >
              Edit Configuration: {agents[editModal.agentKey]?.displayName}
            </h3>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              Model
              <select
                value={editModal.data.model}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: { ...prev.data, model: e.target.value },
                  }))
                }
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-light)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                }}
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, Low Cost)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Accurate, High Cost)</option>
                <option value="gemini-2.0-flash-lite">
                  gemini-2.0-flash-lite (Ultra Fast, Ultra Cheap)
                </option>
              </select>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              System Instructions
              {agents[editModal.agentKey]?.type === 'vertex' && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#f59e0b',
                    background: 'rgba(245,158,11,0.1)',
                    padding: '0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  Note: This is a Vertex CX agent. Updating instructions here may not override
                  Dialogflow's internal system instructions unless properly synced in Google Cloud.
                  Native Gemini agents will apply these instantly.
                </div>
              )}
              <textarea
                value={editModal.data.systemInstruction}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: { ...prev.data, systemInstruction: e.target.value },
                  }))
                }
                placeholder="Override the default system prompt here..."
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-light)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  minHeight: '150px',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                }}
              />
            </label>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={() => setEditModal({ open: false, agentKey: null, data: {} })}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveConfig}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 700px) {
          .agents-summary-bar { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminAIAgentsTab | Props: none
      </div>
    
</div>
  );
}
