import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Package from "lucide-react/dist/esm/icons/package";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';






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
    async function fetchAnalytics() {
      if (!user?.uid) return;
      try {
        // En un caso real, estas métricas se calcularían en backend o se agruparían de 'orders'
        // Por la demo, mostraremos cómo se estructura el componente visual
        const q = query(collection(db, 'orders'), where('wholesalerId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          // Lógica básica de sumarización
          let rev = 0;
          let units = 0;
          let active = 0;
          snap.docs.forEach(d => {
            const data = d.data();
            rev += data.total || 0;
            units += (data.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
            if (data.status === 'pending' || data.status === 'processing') active++;
          });
          setMetrics({
            monthlyRevenue: rev,
            unitsSold: units,
            activeOrders: active,
            growth: 12.5 // Mock growth
          });
        } else {
          // Fallback para demo
          setMetrics({
            monthlyRevenue: 14500,
            unitsSold: 450,
            activeOrders: 8,
            growth: 15.2
          });
        }
      } catch (err) {
        console.error("Error fetching analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
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