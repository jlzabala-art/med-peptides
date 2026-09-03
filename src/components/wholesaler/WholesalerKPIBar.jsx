"use client";
/**
 * WholesalerKPIBar.jsx
 *
 * Barra de KPIs para el panel B2B/Wholesaler.
 * Cumple Regla #22 — KPIs por defecto en toda pantalla con datos.
 * Se monta en las rutas principales: /wholesaler, /wholesaler/clients, /wholesaler/catalogs.
 *
 * Props:
 *   tenantId   - ID del tenant para clientes y catálogos
 *   managerId  - UID del account manager para stats
 */

import React from 'react';
import { useManagerStatsQuery, useClientsQuery } from '@/hooks/data/useWholesalerQuery';
import { Users, ShoppingBag, TrendingUp, AlertCircle, BookOpen } from '@/lib/icons';

// ── Skeleton de carga ─────────────────────────────────────────────────────────
function KPISkeleton() {
  return (
    <div style={{ height: '3rem', width: '5rem', background: 'rgba(255,255,255,0.12)', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
  );
}

// ── Tarjeta individual ────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, trend, color, isLoading }) {
  return (
    <div style={{
      flex: '1 1 170px',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      minWidth: 0,
    }}>
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '10px',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {isLoading ? <KPISkeleton /> : value}
        </div>
        {trend != null && !isLoading && (
          <div style={{ fontSize: '0.72rem', color: trend >= 0 ? 'var(--color-success)' : '#ef4444', marginTop: '0.2rem' }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} este mes
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function WholesalerKPIBar({ tenantId, managerId }) {
  const { data: stats, isLoading: statsLoading } = useManagerStatsQuery(managerId);
  const { data: clients = [], isLoading: clientsLoading } = useClientsQuery(tenantId);

  const totalOrders = (stats?.pendingOrders ?? 0) + (stats?.completedOrders ?? 0);
  const completionRate = totalOrders > 0
    ? `${Math.round(((stats?.completedOrders ?? 0) / totalOrders) * 100)}%`
    : '—';

  const kpis = [
    {
      icon: Users,
      label: 'Clientes Activos',
      value: clientsLoading ? null : clients.length,
      color: 'var(--color-primary)',
      isLoading: clientsLoading,
    },
    {
      icon: AlertCircle,
      label: 'Pedidos Pendientes',
      value: stats?.pendingOrders ?? 0,
      color: '#f59e0b',
      isLoading: statsLoading,
    },
    {
      icon: ShoppingBag,
      label: 'Pedidos Completados',
      value: stats?.completedOrders ?? 0,
      color: '#10b981',
      isLoading: statsLoading,
    },
    {
      icon: TrendingUp,
      label: 'Tasa de Completado',
      value: completionRate,
      color: '#8b5cf6',
      isLoading: statsLoading,
    },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
    }}>
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
