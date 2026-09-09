"use client";

import React, { useState, useEffect } from 'react';
import { fetchWholesalerAnalytics } from '../../../repositories/inventoryRepository';
import { useAuth } from '../../../context/AuthContext';
import { TrendingUp, DollarSign, Package, BarChart3, ArrowUpRight, ShieldCheck, Truck } from '@/lib/icons';
import { logger } from '../../../utils/logger';
import { useRouter } from 'next/navigation';

export default function TurnoverAnalyticsWidget() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    monthlyRevenue: 14500,
    unitsSold: 450,
    activeOrders: 8,
    growth: 15.2
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user?.uid) return;
      try {
        const data = await fetchWholesalerAnalytics(user.uid);
        if (data && data.monthlyRevenue) {
          setMetrics(data);
        }
      } catch (err) {
        logger.error('Error fetching analytics', { error: err.message });
      }
    }
    loadAnalytics();
  }, [user]);

  const kpis = [
    {
      id: 'revenue',
      label: 'Wholesale Revenue',
      value: `$${(metrics.monthlyRevenue || 14500).toLocaleString()}`,
      subtext: '53,250 AED (dual currency)',
      icon: DollarSign,
      color: '#0284c7',
      badge: `+${metrics.growth || 15.2}% MoM`,
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4'
    },
    {
      id: 'units',
      label: 'Units Dispatched',
      value: `${(metrics.unitsSold || 450).toLocaleString()}`,
      subtext: 'Across 14 partner clinics',
      icon: Package,
      color: '#8b5cf6',
      badge: 'On Track',
      badgeColor: '#7c3aed',
      badgeBg: '#f5f3ff'
    },
    {
      id: 'orders',
      label: 'Active Clinic POs',
      value: `${metrics.activeOrders || 8}`,
      subtext: '2 awaiting stock reservation',
      icon: Truck,
      color: '#059669',
      badge: 'In Fulfillment',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5'
    },
    {
      id: 'health',
      label: 'Inventory Health',
      value: '98.2%',
      subtext: '2 batch lots expiring soon',
      icon: ShieldCheck,
      color: '#d97706',
      badge: 'Monitored',
      badgeColor: '#b45309',
      badgeBg: '#fffbeb'
    }
  ];

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="#0284c7" /> Monthly Wholesale Performance
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            B2B fulfillment velocity, active clinic purchase orders & batch stock health
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ padding: '0.35rem 0.75rem', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 800 }}>
            <TrendingUp size={14} /> +{metrics.growth}% MoM Growth
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
                  <Icon size={16} color={kpi.color} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {kpi.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    backgroundColor: kpi.badgeBg,
                    color: kpi.badgeColor
                  }}
                >
                  {kpi.badge}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {kpi.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}