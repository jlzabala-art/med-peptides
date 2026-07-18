"use client";

import { useState, useMemo, useCallback } from 'react';
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Zap from "lucide-react/dist/esm/icons/zap";
import Globe from "lucide-react/dist/esm/icons/globe";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import ToggleLeft from "lucide-react/dist/esm/icons/toggle-left";
import ToggleRight from "lucide-react/dist/esm/icons/toggle-right";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Network from "lucide-react/dist/esm/icons/network";
import { useAIAgents } from '../../hooks/admin/useAIAgents';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import GridSkeleton from '../ui/skeletons/GridSkeleton';
// Default agents are now managed in useAIAgents

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
          <div style={{ padding: '0.8rem', background: 'var(--color-bg-app)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Sparkles size={20} />
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
export default function AdminAIAgentsTab({ isSubTab }) {
  const { agents, metrics, loading, refresh, toggleAgent, saveAgentConfig } = useAIAgents();
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, agentKey: null, data: {} });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggle = async (key, currentStatus) => {
    const isEnable = currentStatus !== 'active';
    try {
      await toggleAgent(key, isEnable);
      showToast(isEnable ? 'Agent activated' : 'Agent disabled', 'success');
    } catch (err) {
      showToast('Toggle failed', 'error');
    }
  };

  const handleSaveConfig = async (key, data) => {
    try {
      await saveAgentConfig(key, data);
      showToast('Agent config saved', 'success');
      setEditModal({ open: false, agentKey: null, data: {} });
    } catch (err) {
      showToast('Save failed', 'error');
    }
  };

  const openEdit = (agentKey) => {
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

  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgentEntries = useMemo(() => {
    if (!searchTerm) return Object.entries(agents);
    const term = searchTerm.toLowerCase();
    return Object.entries(agents).filter(([key, agent]) =>
      (agent.name || key).toLowerCase().includes(term) ||
      (agent.description || '').toLowerCase().includes(term)
    );
  }, [agents, searchTerm]);

  return (
    <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!isSubTab && (
        <PageHeader
          title="AI Agents Topology"
          subtitle="Manage, configure, and monitor all Atlas autonomous agents across the network."
          icon={Network}
        />
      )}

      <div style={{ marginBottom: '0.5rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search agents by name or function..."
          resultCount={filteredAgentEntries.length}
          namespace="admin-ai-agents"
          size="lg"
        />
      </div>

      <AgentsSummaryBar agents={agents} />

      {/* Agent Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        {filteredAgentEntries.map(([key, agent]) => (
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
