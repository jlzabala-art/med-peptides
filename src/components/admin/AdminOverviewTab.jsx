/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Brain,
  CheckCircle2,
  Activity,
  UserPlus,
  AlertTriangle,
  Globe,
  Link2,
  ShoppingBag,
  ShieldCheck,
  Layers,
  RefreshCw,
} from 'lucide-react';
import DashboardEngine from '../../engine/DashboardEngine';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const SKU_AGENT_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/skuSyncAgent';

export default function AdminOverviewTab({
  users,
  products,
  settings,
  handleUpdateProduct,
  handleToggleApproval,
  isSyncingRates,
  handleSyncLiveRates,
  handleSectionChange,
  setActiveSection,
  setActiveTab,
  handleOpenEdit,
  SECTIONS,
}) {
  const [restockAmounts, setRestockAmounts] = useState({});
  const [skuStats, setSkuStats] = useState(null);
  const [agents, setAgents] = useState(null);

  // Load Zoho SKU sync stats on mount
  useEffect(() => {
    fetch(SKU_AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'status', userProfile: { role: 'admin', uid: 'overview' } }),
    })
      .then((r) => r.json())
      .then((d) => setSkuStats(d?.statusCounts || null))
      .catch(() => {});
  }, []);

  // Load Agents stats on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const snap = await getDoc(doc(db, 'ai_config', 'agents'));
        if (snap.exists()) {
          setAgents(snap.data());
        }
      } catch (err) {}
    };
    fetchAgents();
  }, []);

  const agentsList = agents ? Object.values(agents) : [];
  const activeAgents = agentsList.filter((a) => a.status === 'active').length;
  const totalAgents = agentsList.length;

  const pendingUsersList = users.filter((u) => !u.approved || u.role?.endsWith('_pending'));
  const pendingUsers = pendingUsersList.length;

  const lowStockList = products
    .filter((p) => p.stock < 20)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));
  const lowStockItems = lowStockList.length;

  const patientsPendingPhysician = users.filter(
    (u) =>
      (u.role === 'patient' || u.role === 'guest') &&
      (!u.assignedPhysicianIds || u.assignedPhysicianIds.length === 0)
  );
  const pendingPhysiciansCount = patientsPendingPhysician.length;

  const ratesAgeMs = settings.ratesLastUpdated
    ? Date.now() - new Date(settings.ratesLastUpdated).getTime()
    : Infinity;
  const ratesNeedSync = ratesAgeMs > 24 * 60 * 60 * 1000;

  async function handleQuickRestockSubmit(prodId, currentStock) {
    const amount = parseInt(restockAmounts[prodId]);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid number to increase stock.');
      return;
    }
    await handleUpdateProduct(prodId, { stock: currentStock + amount });
    setRestockAmounts((prev) => ({ ...prev, [prodId]: '' }));
  };

  async function handleQuickApprove(userId) {
    await handleToggleApproval(userId, false);
  };

  return (
    <div
      className="anim-slide-up"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* ── HEADER & STATUS ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--surface)',
          padding: '2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--text-main)',
            }}
          >
            <div
              style={{
                padding: '0.5rem',
                background: 'rgba(37, 99, 235, 0.1)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Cpu size={28} style={{ color: 'var(--primary)' }} />
            </div>
            Admin Control Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            System panel with critical pending tasks and KPIs in real time.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <span
              className="admin-pill-status-dot admin-pill-status-dot--pulse"
              style={{ backgroundColor: 'var(--success)' }}
            ></span>
            <span style={{ color: 'var(--success)' }}>Database Online</span>
          </div>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
            }}
          >
            <Brain size={16} style={{ color: 'var(--primary)' }} />
            <span>AI Core: Active</span>
          </div>
        </div>
      </div>

      <div style={{ margin: '1rem 0' }}>
        <DashboardEngine role="admin" />
      </div>

      {/* ── WIDGETS DE KPIS PRINCIPALES ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Total Users
            </span>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {users.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
            Active accounts on the platform
          </span>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Clinical Catalog
            </span>
            <ShoppingBag size={18} style={{ color: 'var(--secondary)' }} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {products.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Integrated product SKUs
          </span>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Exchange Rates
            </span>
            <Globe
              size={18}
              style={{ color: ratesNeedSync ? 'var(--warning)' : 'var(--success)' }}
            />
          </div>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: ratesNeedSync ? 'var(--warning)' : 'var(--text-main)',
              marginTop: '0.5rem',
            }}
          >
            {ratesNeedSync ? 'Sync Required' : 'Synced'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {settings.ratesLastUpdated
              ? new Date(settings.ratesLastUpdated).toLocaleDateString()
              : 'No data'}
          </span>
        </div>

        {/* AI Agents card */}
        <div
          onClick={() => {
            setActiveSection && setActiveSection('ai');
            setActiveTab && setActiveTab('ai-agents');
          }}
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              AI Agents
            </span>
            <Brain size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {agents ? `${activeAgents}/${totalAgents}` : '—'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(37,99,235,0.1)',
                color: 'var(--primary)',
              }}
            >
              {agents ? `${activeAgents} active` : 'Loading…'}
            </span>
          </div>
        </div>

        {/* Zoho Books card */}
        <div
          onClick={() => {
            setActiveSection && setActiveSection('integrations');
            setActiveTab && setActiveTab('sku-sync');
          }}
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Zoho Books
            </span>
            <RefreshCw
              size={18}
              style={{
                color: skuStats
                  ? skuStats.pending > 0
                    ? '#f59e0b'
                    : '#6366f1'
                  : 'var(--color-text-tertiary)',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: skuStats?.synced > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)',
            }}
          >
            {skuStats ? skuStats.synced || 0 : '—'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99,102,241,0.1)',
                color: '#6366f1',
              }}
            >
              {skuStats ? `${skuStats.synced || 0} synced` : 'Loading…'}
            </span>
            {skuStats?.pending > 0 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245,158,11,0.1)',
                  color: '#f59e0b',
                }}
              >
                {skuStats.pending} pending review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── ACCIONES CRÍTICAS PENDIENTES ── */}
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--primary)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Activity size={20} style={{ color: 'var(--error)' }} /> Critical Tasks
        </h3>

        {pendingUsers === 0 &&
        lowStockItems === 0 &&
        !ratesNeedSync &&
        pendingPhysiciansCount === 0 ? (
          <div
            style={{
              backgroundColor: 'rgba(5, 150, 105, 0.05)',
              border: '1px dashed var(--success)',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'var(--success)',
            }}
          >
            <CheckCircle2 size={48} style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              All up to date!
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              No critical actions or pending tasks at this time.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Tarjeta 1: Aprobaciones de Cuenta */}
            {pendingUsers > 0 && (
              <div
                style={{
                  border: '1px solid #fee2e2',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  background: 'var(--color-bg-surface)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: 0,
                    }}
                  >
                    <UserPlus size={18} style={{ color: 'var(--error)' }} /> Account Approvals
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                          detail: {
                            message: `I have ${pendingUsers} pending account approvals. Can you summarize what to look out for when approving new clinic or wholesaler accounts?`,
                            autoSend: true
                          }
                        }));
                      }}
                      title="Ask Atlas for approval guidance"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                        backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)',
                        border: '1px solid rgba(37,99,235,0.3)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Brain size={12} /> Ask Atlas
                    </button>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '99px',
                        backgroundColor: '#fee2e2',
                        color: 'var(--error)',
                      }}
                    >
                      {pendingUsers} pending
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingUsersList.slice(0, 3).map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                        <div
                          style={{
                            fontWeight: 750,
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {u.fullName || u.displayName || 'No Name'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {u.email}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleQuickApprove(u.id)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarjeta 2: Stock Crítico */}
            {lowStockItems > 0 && (
              <div
                style={{
                  border: '1px solid #fef3c7',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  background: 'var(--color-bg-surface)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: 0,
                    }}
                  >
                    <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> Low Stock
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                          detail: {
                            message: `I have ${lowStockItems} items with low stock. Can you suggest a restock strategy or highlight which ones are most critical for clinical protocols?`,
                            autoSend: true
                          }
                        }));
                      }}
                      title="Ask Atlas for a restock strategy"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                        backgroundColor: 'rgba(245,158,11,0.1)', color: '#d97706',
                        border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Brain size={12} /> Ask Atlas
                    </button>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '99px',
                        backgroundColor: '#fef3c7',
                        color: 'var(--warning)',
                      }}
                    >
                      {lowStockItems} item{lowStockItems > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {lowStockList.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                        <div
                          style={{
                            fontWeight: 750,
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Current stock:{' '}
                          <span style={{ fontWeight: 800, color: 'var(--error)' }}>
                            {p.stock || 0}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <input
                          type="number"
                          placeholder="+50"
                          value={restockAmounts[p.id] || ''}
                          onChange={(e) =>
                            setRestockAmounts((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          style={{
                            width: '60px',
                            padding: '0.3rem',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        />
                        <button
                          onClick={() => handleQuickRestockSubmit(p.id, p.stock || 0)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--accent-soft)',
                            color: 'var(--secondary)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarjeta 3: Asignación Médica */}
            {pendingPhysiciansCount > 0 && (
              <div
                style={{
                  border: '1px solid #e0f2fe',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  background: 'var(--color-bg-surface)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: 0,
                    }}
                  >
                    <Link2 size={18} style={{ color: 'var(--secondary)' }} /> Physician Assignment
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '99px',
                      backgroundColor: '#e0f2fe',
                      color: 'var(--secondary)',
                    }}
                  >
                    {pendingPhysiciansCount} patient{pendingPhysiciansCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {patientsPendingPhysician.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                        <div
                          style={{
                            fontWeight: 750,
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.fullName || p.displayName || 'No Name Patient'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSection('operations');
                          setActiveTab('doctor-assignments');
                        }}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--secondary)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── NAVEGACIÓN A PILARES ── */}
      <div>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--primary)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Layers size={20} style={{ color: 'var(--primary)' }} /> Quick Access
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {SECTIONS.filter((s) => s.id !== 'overview').map((section) => (
            <div
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              style={{
                cursor: 'pointer',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = section.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div
                style={{
                  backgroundColor: `${section.color}15`,
                  color: section.color,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <section.icon size={24} />
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {section.label}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.4',
                  }}
                >
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminOverviewTab | Props: none
      </div>
    
</div>
  );
}
