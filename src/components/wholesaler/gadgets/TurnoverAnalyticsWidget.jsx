"use client";

import React, { useState, useEffect } from 'react';
import { fetchWholesalerAnalytics } from '../../../repositories/inventoryRepository';
import { useAuth } from '../../../context/AuthContext';
import { TrendingUp, DollarSign, Package, BarChart3, ArrowUpRight } from '@/lib/icons';
import { logger } from '../../../utils/logger';

export default function TurnoverAnalyticsWidget() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    monthlyRevenue: 0,
    unitsSold: 0,
    activeOrders: 0,
    growth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user?.uid) return;
      try {
        const data = await fetchWholesalerAnalytics(user.uid);
        setMetrics(data);
      } catch (err) {
        logger.error('Error fetching analytics', { error: err.message });
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);


  return (
    <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--primary)" /> Rendimiento Mensual
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Volumen de rotación B2B</p>
        </div>
        <div style={{ padding: '0.5rem', background: 'var(--color-success-bg)', borderRadius: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 800 }}>
          <TrendingUp size={14} /> +{metrics.growth}%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
        <div style={{ padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <DollarSign size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Ingresos</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
            ${metrics.monthlyRevenue.toLocaleString()}
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <Package size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Unidades</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
            {metrics.unitsSold.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>Órdenes Activas</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{metrics.activeOrders} En Proceso</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowUpRight size={20} />
        </div>
      </div>
    </div>
  );
}