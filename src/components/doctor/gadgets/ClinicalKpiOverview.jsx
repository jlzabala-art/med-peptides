'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Microscope, Activity, ShoppingCart, FileText, DollarSign, ClipboardList, Clock, CheckCircle2, Package, TrendingUp, UserCheck } from '@/lib/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchKPIsAction } from '../../../actions/kpiActions';
import { useAuth } from '../../../context/AuthContext';

const MetricCard = motion.create(React.forwardRef(({ title, value, trend, icon: Icon, color, bgColor, alert = false }, ref) => {
  return (
    <div ref={ref} style={{
      backgroundColor: 'white', borderRadius: '24px', padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${alert ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)'}`,
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
       onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: bgColor, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {alert && (
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '10px', animation: 'pulse 2s infinite' }}>
            Action Needed
          </span>
        )}
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{title}</h4>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem', letterSpacing: '-0.03em' }}>
          {value}
        </div>
        <div style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: alert ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {trend}
        </div>
      </div>
    </div>
  );
}));

// KPI card definitions per role
function getKpiCards(role, kpis) {
  const v = (key, fallback = '—') => kpis?.[key] ?? fallback;
  
  switch (role) {
    case 'doctor':
      return [
        { title: 'Active Patients',       value: v('activePatients', 0),       icon: Users,        color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.1)',   trend: '' },
        { title: 'Pending Prescriptions', value: v('pendingPrescriptions', 0), icon: FileText,      color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)',    trend: '', alert: v('pendingPrescriptions', 0) > 0 },
        { title: 'Active Prescriptions',  value: v('activePrescriptions', 0),  icon: Activity,     color: '#10b981', bgColor: 'rgba(16,185,129,0.1)',   trend: '' },
        { title: 'Active Orders',         value: v('activeOrders', 0),         icon: ShoppingCart, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)',   trend: '' },
      ];
    case 'patient':
      return [
        { title: 'Active Prescriptions', value: v('activePrescriptions', 0), icon: FileText,      color: '#7c3aed', bgColor: 'rgba(124,58,237,0.1)',  trend: '' },
        { title: 'Total Orders',         value: v('totalOrders', 0),         icon: ShoppingCart,  color: '#2563eb', bgColor: 'rgba(37,99,235,0.1)',   trend: '' },
        { title: 'Pending Orders',       value: v('pendingOrders', 0),       icon: Clock,         color: '#d97706', bgColor: 'rgba(217,119,6,0.1)',   trend: '', alert: v('pendingOrders', 0) > 0 },
        { title: 'Consultations',        value: v('upcomingConsultations', 0),icon: Calendar,      color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)',   trend: '' },
      ];
    case 'wholesaler':
      return [
        { title: 'Total Bulk Orders',  value: v('totalBulkOrders', 0),   icon: Package,      color: '#c2410c', bgColor: 'rgba(194,65,12,0.1)',   trend: '' },
        { title: 'Pending Orders',     value: v('pendingBulkOrders', 0), icon: Clock,        color: '#d97706', bgColor: 'rgba(217,119,6,0.1)',   trend: '', alert: v('pendingBulkOrders', 0) > 0 },
        { title: 'Delivered Orders',   value: v('deliveredOrders', 0),   icon: CheckCircle2, color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)',   trend: '' },
        { title: 'Managed Clients',    value: v('managedClients', 0),    icon: UserCheck,    color: '#0d9488', bgColor: 'rgba(13,148,136,0.1)',  trend: '' },
      ];
    case 'admin':
    default:
      return [
        { title: 'Active Patients',    value: v('activePatients', 0),       icon: Users,        color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.1)',  trend: '+4% this month' },
        { title: 'Active Orders',      value: v('activeOrders', 0),         icon: ShoppingCart, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', trend: '' },
        { title: 'Pending Rx',         value: v('pendingPrescriptions', 0), icon: Microscope,   color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)',  trend: '', alert: v('pendingPrescriptions', 0) > 0 },
        { title: 'Active Protocols',   value: v('activeProtocols', 0),      icon: Activity,     color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', trend: '' },
      ];
  }
}

export default function ClinicalKpiOverview({ metrics, role: roleProp }) {
  const { user, userProfile } = useAuth();
  const role = roleProp || userProfile?.role || 'doctor';
  const userId = user?.uid;
  
  // If metrics are passed directly (e.g. from DashboardEngine dataContext), use them.
  // Otherwise, self-fetch from the server action via React Query.
  const { data: fetchedKpis, isLoading } = useQuery({
    queryKey: ['kpis', role, userId],
    queryFn: () => fetchKPIsAction(role, userId),
    enabled: !metrics && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const resolvedMetrics = metrics ?? fetchedKpis;
  const cards = getKpiCards(role, resolvedMetrics);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ borderRadius: '24px', padding: '1.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', minHeight: 120, animation: 'shimmer 1.4s infinite' }} />
        ))}
        <style>{`@keyframes shimmer { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }`}</style>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ 
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem'
    }}>
      {cards.map(card => (
        <MetricCard key={card.title} variants={itemVariants} {...card} />
      ))}
    </motion.div>
  );
}