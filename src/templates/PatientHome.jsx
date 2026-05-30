import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatientAIProfile } from '../hooks/usePatientAIProfile';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import {
  ChevronRight, Sparkles, Bot, Clock, Target, ArrowRight,
  Package, CheckCircle2, Truck, AlertCircle, Box, Beaker, FileText, TrendingUp,
  LayoutDashboard, ClipboardList, Users
} from 'lucide-react';
import PatientPrescriptionPanel from '../components/patient/PatientPrescriptionPanel';
import PatientAppointments from './PatientAppointments';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AppPortalLayout from '../layout/AppPortalLayout';
import OrdersTab from '../components/admin/OrdersTab';
import DashboardEngine from '../engine/DashboardEngine';
import { MessageSquare, Brain } from 'lucide-react';

const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const ClinicalAIWidget = React.lazy(() => import('../components/admin/ClinicalAIWidget'));

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



const PATIENT_NAV_GROUPS = [
  {
    id: 'overview',
    label: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'health',
    label: 'HEALTH',
    items: [
      { id: 'appointments', label: 'Care Team', icon: Users },
      { id: 'prescriptions', label: 'My Prescriptions', icon: ClipboardList },
      { id: 'messages', label: 'Mensajes', icon: MessageSquare },
      { id: 'clinical-ai', label: 'Atlas Health', icon: Brain },
    ],
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    items: [
      { id: 'orders', label: 'Orders & Settings', icon: Package },
    ],
  }
];



export default function PatientHome() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const uid = user?.uid;

  // Derive active tab from URL (e.g. /patient/prescriptions -> prescriptions)
  const pathParts = location.pathname.split('/').filter(Boolean);
  // Default to 'dashboard' if exactly /patient
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'dashboard';

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

  const handleNavigate = (tabId) => {
    navigate(`/patient/${tabId === 'dashboard' ? '' : tabId}`);
  };

  return (
    <AppPortalLayout allowedRoles={['patient', 'admin']}>
      <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', minHeight: '100%' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', fontWeight: 600, color: '#0f172a' }}>
          {activeTab === 'prescriptions' ? 'My Prescriptions' : `Welcome back, ${name}`}
        </h1>
        <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {activeTab === 'prescriptions' ? 'Manage your active recommendations and protocols.' : 'Overview of your active treatments and insights.'}
        </p>
        <Routes>
          <Route index element={
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <DashboardEngine role="patient" dataContext={userProfile} />
            </div>
          } />
          <Route path="prescriptions" element={
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
              <PatientPrescriptionPanel patientUid={uid} />
            </div>
          } />
          <Route path="messages" element={
            <div style={{ height: 'calc(100vh - 80px)', margin: '-1.5rem' }}>
              <React.Suspense fallback={<div>Loading messaging...</div>}>
                <MessagingWidget />
              </React.Suspense>
            </div>
          } />
          <Route path="clinical-ai" element={
            <div style={{ height: 'calc(100vh - 80px)', margin: '-1.5rem' }}>
              <React.Suspense fallback={<div>Loading Atlas Health AI...</div>}>
                <ClinicalAIWidget />
              </React.Suspense>
            </div>
          } />
          <Route path="appointments" element={
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
              <PatientAppointments />
            </div>
          } />
          <Route path="orders" element={
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
              <OrdersTab buyerId={uid} readOnly={true} />
            </div>
          } />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </div>
    </AppPortalLayout>
  );
}
