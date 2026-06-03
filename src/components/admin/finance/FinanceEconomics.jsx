import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { AlertTriangle, TrendingUp, DollarSign, CheckCircle, PieChart, Landmark } from 'lucide-react';
import ProfitMarginAnalysis from './ProfitMarginAnalysis';

export default function FinanceEconomics({ dashboardData }) {
  const lotusBilled = dashboardData?.lotuslandData?.totalBilled || 0;
  const [marginAlerts, setMarginAlerts] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'financial_approvals'),
      where('type', '==', 'margin_risk'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((docSnap) => {
        alerts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMarginAlerts(alerts);
    });

    return () => unsubscribe();
  }, []);

  const handleApprovePriceIncrease = async (alertId) => {
    try {
      const alertRef = doc(db, 'financial_approvals', alertId);
      await updateDoc(alertRef, {
        status: 'approved',
        resolved_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error approving price increase:", err);
    }
  };

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Metrics Row */}
      <div className="finance-grid-3">
        
        {/* LTV:CAC */}
        <div className="glass-card-premium" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
            Unit Economics (LTV:CAC)
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Customer LTV</p>
              <p style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>$1,250</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Blended CAC</p>
              <p style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--warning)', margin: 0 }}>$380</p>
            </div>
          </div>
          
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontWeight: '800', color: 'var(--success)', fontSize: '0.875rem' }}>Ratio</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>3.2 : 1</span>
          </div>
        </div>
        
        {/* B2B Revenue */}
        <div className="glass-card-premium" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            B2B Revenue Concentration
          </h3>
          
          <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Lotusland Total Billed</p>
          <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#3b82f6', margin: '0 0 1.5rem 0' }}>${lotusBilled.toLocaleString()}</p>
          
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>
              <span style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(59, 130, 246, 0.2)', padding: '0.125rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem' }}>Note</span>
              B2B wholesale performance indicator directly from Zoho Books.
            </p>
          </div>
        </div>
        
        {/* Tax Liability */}
        <div className="glass-card-premium" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'rgba(244, 63, 94, 0.1)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Landmark style={{ width: '16px', height: '16px', color: 'var(--error)' }} />
            Estimated Tax Liability
          </h3>
          
          <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Accrued VAT/Corporate (5%)</p>
          <p style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--error)', margin: '0 0 1.5rem 0' }}>$12,450.00</p>
          
          <div className="finance-progress-bg" style={{ background: 'var(--surface-raised)' }}>
            <div className="finance-progress-bar" style={{ width: '45%', background: 'var(--error)' }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--error)' }}>45% of Target</div>
        </div>
        
      </div>

      {/* Protocol Margin Analysis */}
      <ProfitMarginAnalysis />

      {/* Margin Alerts */}
      <div className="glass-card-premium" style={{ borderTop: '4px solid var(--warning)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <AlertTriangle style={{ width: '24px', height: '24px', color: 'var(--warning)' }} />
            AI Margin Protection Alerts
          </h3>
          
          {marginAlerts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-raised)', borderRadius: '16px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                 <CheckCircle style={{ width: '40px', height: '40px', color: 'var(--success)' }} />
               </div>
               <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.125rem', margin: '0 0 0.25rem 0' }}>All Clear</p>
               <p style={{ color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>All product margins are healthy and within targeted thresholds.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {marginAlerts.map(alert => (
                <div key={alert.id} className="glass-card-premium" style={{ background: 'var(--surface-raised)', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', transition: 'border-color 0.3s' }}>
                  <div style={{ flex: '1 1 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: '800', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Margin Risk</span>
                      <h4 style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.125rem', margin: 0 }}>{alert.product_name}</h4>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{alert.reason}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', fontWeight: '800' }}>
                      <span style={{ background: 'var(--surface)', padding: '0.375rem 0.75rem', borderRadius: '8px', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Old COGS: <span style={{ color: 'var(--primary)' }}>${alert.old_cogs}</span></span>
                      <span style={{ background: 'var(--surface)', padding: '0.375rem 0.75rem', borderRadius: '8px', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>New COGS: <span style={{ color: 'var(--primary)' }}>${alert.new_cogs}</span></span>
                      <span style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '0.375rem 0.75rem', borderRadius: '8px', color: 'var(--text-muted)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>Current Margin: <span style={{ color: 'var(--error)' }}>{alert.current_margin_percent}%</span></span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Suggested Price</div>
                      <div style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--success)' }}>${alert.recommended_price}</div>
                    </div>
                    <button 
                      onClick={() => handleApprovePriceIncrease(alert.id)}
                      className="gcp-btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)', color: 'white' }}
                    >
                      Approve Sync
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}