/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatientAIProfile } from '../hooks/usePatientAIProfile';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import {
  ChevronRight, Sparkles, Bot, Clock, Target, ArrowRight,
  Package, CheckCircle2, Truck, AlertCircle, Box, Beaker, FileText, TrendingUp
} from 'lucide-react';
import PatientPrescriptionPanel from '../components/patient/PatientPrescriptionPanel';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ── Goal → peptide metadata ───────────────────────────────────────────────────
const GOAL_PEPTIDE_MAP = {
  'anti-aging':  { label: 'Anti-aging',       peptides: ['Epithalon', 'GHK-Cu', 'Thymosin Alpha-1'] },
  'longevity':   { label: 'Longevity',        peptides: ['NAD+', 'Klotho', 'Rapamycin'] },
  'muscle-gain': { label: 'Muscle Gain',      peptides: ['IGF-1 LR3', 'BPC-157', 'Ipamorelin'] },
  'fat-loss':    { label: 'Fat Loss',         peptides: ['AOD-9604', 'Tirzepatide', 'CJC-1295'] },
  'recovery':    { label: 'Recovery',         peptides: ['BPC-157', 'TB-500', 'GHK-Cu'] },
  'cognitive':   { label: 'Cognitive',        peptides: ['Semax', 'Selank', 'Dihexa'] },
  'hormones':    { label: 'Hormonal',         peptides: ['Kisspeptin', 'PT-141', 'DSIP'] },
  'immune':      { label: 'Immunity',         peptides: ['Thymosin Beta-4', 'LL-37'] },
  'sleep':       { label: 'Sleep Quality',    peptides: ['DSIP', 'Selank', 'Epitalon'] },
};

// ── Trending (static seed) ──
const TRENDING_COMPOUNDS = [
  { name: 'BPC-157',     slug: 'bpc-157',     category: 'Recovery',  trend: '+18%' },
  { name: 'Semaglutide', slug: 'semaglutide', category: 'Metabolic', trend: '+34%' },
  { name: 'Semax',       slug: 'semax',       category: 'Cognitive', trend: '+12%' },
  { name: 'Epithalon',   slug: 'epithalon',   category: 'Longevity', trend: '+9%'  },
  { name: 'Ipamorelin',  slug: 'ipamorelin',  category: 'GH',        trend: '+22%' },
  { name: 'NAD+',        slug: 'nad-plus',    category: 'Longevity', trend: '+15%' },
];

function openAI(q = '') {
  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
    detail: { query: q, autoSend: Boolean(q) },
  }));
}

// ── Technical Panel Container ───────────────────────────────────────────────
function TechnicalPanel({ title, icon: Icon, action, onAction, children }) {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '4px', marginBottom: '1.5rem', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid #dadce0', padding: '0.75rem 1rem', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Icon && <Icon size={16} />} {title}
        </h3>
        {action && onAction && (
          <button onClick={onAction} style={{ background: 'none', border: 'none', color: '#0071bd', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {action} <ChevronRight size={14} />
          </button>
        )}
      </div>
      <div style={{ padding: '0' }}>
        {children}
      </div>
    </div>
  );
}

export default function PatientHome() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid;

  const name = userProfile?.firstName || userProfile?.name?.split(' ')[0] || 'Patient';
  const goals = useMemo(() => Array.isArray(userProfile?.goals) ? userProfile.goals : [], [userProfile]);
  const recently = useMemo(() => Array.isArray(userProfile?.recentlyViewed) ? userProfile.recentlyViewed.slice(0, 5) : [], [userProfile]);

  const { interests, topGoals: aiGoals, loading: aiLoading, hasProfile } = usePatientAIProfile(uid);

  const [activeOrders, setActiveOrders] = useState([]);
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsub = onSnapshot(q, snap => {
      setActiveOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [uid]);

  const allGoalKeys = useMemo(() => {
    const combined = [...new Set([...goals, ...aiGoals])].filter(g => GOAL_PEPTIDE_MAP[g]);
    return combined.slice(0, 6);
  }, [goals, aiGoals]);

  const aiSuggestion = useMemo(() => {
    if (interests.length > 0) {
      const top = interests[0];
      return `Update on ${top.name} dosage protocols and compatibilities.`;
    }
    if (allGoalKeys.length > 0) {
      const g = GOAL_PEPTIDE_MAP[allGoalKeys[0]];
      return g ? `Based on my ${g.label} goal, what is the best starting protocol?` : '';
    }
    return 'How should I begin with research peptides?';
  }, [interests, allGoalKeys]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '4rem' }}>
      
      {/* Header - GCP Style */}
      <div style={{ backgroundColor: 'var(--color-bg-surface)', borderBottom: '1px solid #dadce0', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>Patient Portal</h1>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Welcome back, <strong>{name}</strong></span>
          {hasProfile && (
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
              AI PROFILE ACTIVE
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <TechnicalPanel title="Active Orders & Shipments" icon={Package} action="View all" onAction={() => navigate('/account')}>
              {activeOrders.map((order, idx) => {
                const status = (order.status || 'pending').toLowerCase();
                const isDelivered = ['delivered', 'completed'].includes(status);
                const isShipped   = status === 'shipped';
                return (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx !== activeOrders.length - 1 ? '1px solid #e2e8f0' : 'none', backgroundColor: 'var(--color-bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {isDelivered ? <CheckCircle2 size={16} color="#166534" /> : isShipped ? <Truck size={16} color="var(--color-primary-hover)" /> : <Box size={16} color="#b45309" />}
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{order.orderId || order.id?.slice(0,8)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{isDelivered ? 'Delivered' : isShipped ? 'Shipped' : 'Pending fulfillment'}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDelivered ? '#166534' : isShipped ? 'var(--color-primary-hover)' : '#b45309', backgroundColor: isDelivered ? '#dcfce7' : isShipped ? '#dbeafe' : '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </TechnicalPanel>
          )}

          <RefillReminderBanner role="patient" onNavigate={() => navigate('/account')} />
          <PatientPrescriptionPanel patientUid={uid} />

          {/* AI Insights - Flattened */}
          <TechnicalPanel title="Clinical AI Insights" icon={Bot} action="Open Assistant" onAction={() => openAI()}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>RECOMMENDED ACTION</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#0f172a' }}>{aiSuggestion}</span>
                <button onClick={() => openAI(aiSuggestion)} style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-primary)' }}>Ask AI</button>
              </div>
            </div>
            
            {interests.length > 0 && (
              <div style={{ padding: '0' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  TRACKED COMPOUNDS
                </div>
                {interests.slice(0, 5).map((item, idx) => (
                  <div key={item.slug} onClick={() => navigate(`/products/${item.slug}`)} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx !== 4 ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', backgroundColor: 'var(--color-bg-surface)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Beaker size={14} color="var(--color-text-secondary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>{item.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{item.category}</span>
                    </div>
                    <ChevronRight size={14} color="var(--color-border)" />
                  </div>
                ))}
              </div>
            )}
          </TechnicalPanel>

          {/* Objectives */}
          {allGoalKeys.length > 0 && (
            <TechnicalPanel title="Clinical Objectives" icon={Target} action="View Catalog" onAction={() => navigate('/catalog')}>
              {allGoalKeys.map((goalKey, idx) => {
                const g = GOAL_PEPTIDE_MAP[goalKey];
                return (
                  <div key={goalKey} style={{ padding: '0.75rem 1rem', borderBottom: idx !== allGoalKeys.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{g.label}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {g.peptides.slice(0, 3).map(p => (
                        <span key={p} style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: 'var(--color-text-secondary)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{p}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TechnicalPanel>
          )}

          {recently.length > 0 && (
            <TechnicalPanel title="Recent Activity" icon={Clock}>
              {recently.map((item, idx) => (
                <div key={idx} onClick={() => navigate(`/products/${item.slug || item.id || ''}`)} style={{ padding: '0.75rem 1rem', borderBottom: idx !== recently.length - 1 ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#0f172a' }}>{item.name || item.displayName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{item.category}</div>
                  </div>
                  <ChevronRight size={14} color="var(--color-border)" />
                </div>
              ))}
            </TechnicalPanel>
          )}

          <TechnicalPanel title="Market Trends" icon={TrendingUp}>
            {TRENDING_COMPOUNDS.map((item, idx) => (
              <div key={item.slug} onClick={() => navigate(`/products/${item.slug}`)} style={{ padding: '0.75rem 1rem', borderBottom: idx !== TRENDING_COMPOUNDS.length - 1 ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{item.category}</div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#166534', backgroundColor: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {item.trend}
                </span>
              </div>
            ))}
          </TechnicalPanel>

        </div>
      </div>
    </div>
  );
}
