import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Package from "lucide-react/dist/esm/icons/package";
import React, { useState, useEffect } from 'react';



import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../../firebase';

export default function RevenueWidget({ entityId, entityType }) {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRevenue() {
      if (!entityId || !entityType) return;
      setLoading(true);
      setError(null);
      try {
        const functions = getFunctions(app);
        const calculateRevenue = httpsCallable(functions, 'calculateRevenueAttribution');
        const result = await calculateRevenue({ entityId, entityType });
        setRevenueData(result.data);
      } catch (err) {
        console.error("Failed to fetch revenue attribution:", err);
        setError("Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, [entityId, entityType]);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Calculating Revenue Attribution...</div>
      </div>
    );
  }

  if (error || !revenueData) {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #fecdd3', color: '#e11d48', fontSize: '0.85rem' }}>
        {error || "Revenue data unavailable."}
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DollarSign size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Attributed Revenue
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            ${revenueData.totalRevenue.toLocaleString()}
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={14} /> Active
            </span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Attributed Orders</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {revenueData.orderCount} <Package size={16} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
}