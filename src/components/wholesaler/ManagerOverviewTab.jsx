"use client";
/**
 * ManagerOverviewTab.jsx
 *
 * Dashboard de KPIs para un Account Manager.
 * Sin imports directos de firebase/firestore — usa useManagerStatsQuery.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useManagerStatsQuery } from '@/hooks/data/useWholesalerQuery';
import ManagerChurnWidget from './ManagerChurnWidget';
import Users from "lucide-react/dist/esm/icons/users";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";

// ── Stat Card reutilizable ───────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, isLoading }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{ backgroundColor: color + '20', padding: '1rem', borderRadius: '50%' }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {isLoading ? (
            <span style={{ display: 'inline-block', width: '2rem', height: '1.5rem', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : value}
        </div>
      </div>
    </div>
  );
}

export default function ManagerOverviewTab() {
  const { currentUser } = useAuth();
  const { data: stats, isLoading } = useManagerStatsQuery(currentUser?.uid);

  const kpis = {
    clients: stats?.clients ?? 0,
    pendingOrders: stats?.pendingOrders ?? 0,
    completedOrders: stats?.completedOrders ?? 0,
  };

  // Performance score: ratio de completados sobre total, o '--' si no hay datos
  const totalOrders = kpis.pendingOrders + kpis.completedOrders;
  const performanceScore = totalOrders > 0
    ? `${Math.round((kpis.completedOrders / totalOrders) * 100)}%`
    : '—';

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
        Bienvenido, {currentUser?.displayName || 'Manager'}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Resumen de tu cartera de clientes asignados.
      </p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Mis Clientes" value={kpis.clients} icon={Users} color="var(--color-primary)" isLoading={isLoading} />
        <StatCard title="Pedidos Pendientes" value={kpis.pendingOrders} icon={AlertCircle} color="#f59e0b" isLoading={isLoading} />
        <StatCard title="Pedidos Completados" value={kpis.completedOrders} icon={ShoppingBag} color="var(--color-success)" isLoading={isLoading} />
        <StatCard title="Tasa de Completado" value={performanceScore} icon={TrendingUp} color="#8b5cf6" isLoading={isLoading} />
      </div>

      <ManagerChurnWidget managerId={currentUser?.uid} />

      <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Actividad Reciente</h2>
        {isLoading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Cargando actividad...</div>
        ) : (
          <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            Sin alertas recientes. Usa la pestaña Mensajes para comunicarte con tus clientes, o Pedidos para procesar solicitudes pendientes.
          </div>
        )}
      </div>
    </div>
  );
}
