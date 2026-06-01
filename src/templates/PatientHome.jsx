import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatientAIProfile } from '../hooks/usePatientAIProfile';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import {
  ChevronRight, Sparkles, Bot, Clock, Target, ArrowRight,
  Package, CheckCircle2, Truck, AlertCircle, Box, Beaker, FileText, TrendingUp,
  LayoutDashboard, ClipboardList, Users, Settings
} from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AppPortalLayout from '../layout/AppPortalLayout';
import DashboardEngine from '../engine/DashboardEngine';
import { MessageSquare, Brain } from 'lucide-react';

// ── Goal → peptide metadata ───────────────────────────────────────────────────
export const GOAL_PEPTIDE_MAP = {
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

export const TRENDING_COMPOUNDS = [
  { name: 'BPC-157',     slug: 'bpc-157',     category: 'Recovery',  trend: '+18%' },
  { name: 'Semaglutide', slug: 'semaglutide', category: 'Metabolic', trend: '+34%' },
  { name: 'Semax',       slug: 'semax',       category: 'Cognitive', trend: '+12%' },
  { name: 'Epithalon',   slug: 'epithalon',   category: 'Longevity', trend: '+9%'  },
  { name: 'Ipamorelin',  slug: 'ipamorelin',  category: 'GH',        trend: '+22%' },
  { name: 'NAD+',        slug: 'nad-plus',    category: 'Longevity', trend: '+15%' },
];

export const PATIENT_NAV_GROUPS = [
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
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'clinical-ai', label: 'Atlas Health', icon: Brain },
    ],
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    items: [
      { id: 'orders', label: 'My Orders', icon: Package },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  }
];

export function openAI(q = '') {
  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
    detail: { query: q, autoSend: Boolean(q) },
  }));
}

export default function PatientHome() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const uid = user?.uid;

  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'dashboard';

  const name = userProfile?.firstName || userProfile?.name?.split(' ')[0] || 'Patient';

  return (
    <AppPortalLayout allowedRoles={['patient', 'admin']}>
      <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', minHeight: '100%' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', fontWeight: 600, color: '#0f172a' }}>
          {activeTab === 'prescriptions' ? 'My Prescriptions' : `Welcome back, ${name}`}
        </h1>
        <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {activeTab === 'prescriptions' ? 'Manage your active recommendations and protocols.' : 'Overview of your active treatments and insights.'}
        </p>
        <Outlet context={{ userProfile, uid, name }} />
      </div>
    </AppPortalLayout>
  );
}
