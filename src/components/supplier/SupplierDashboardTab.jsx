"use client";

import React from 'react';
import Globe from "lucide-react/dist/esm/icons/globe";
import { useAuth } from '../../context/AuthContext';
import DashboardEngine from '../../engine/DashboardEngine';

export default function SupplierDashboardTab() {
  const { userProfile } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
            <Globe size={36} /> Supplier Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
            Panel de control B2B corporativo (Venta de materias primas y distribución masiva).
          </p>
        </div>
        <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
            {userProfile?.firstName?.[0] || 'S'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Supplier
            </div>
          </div>
        </div>
      </div>
      <DashboardEngine role="supplier" dataContext={{}} />
    </div>
  );
}
