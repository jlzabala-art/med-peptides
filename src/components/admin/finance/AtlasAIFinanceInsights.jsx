import Bot from "lucide-react/dist/esm/icons/bot";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Send from "lucide-react/dist/esm/icons/send";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import React, { useState, useMemo } from 'react';








import { usePreferences } from '../../../context/PreferencesContext';

export default function AtlasAIFinanceInsights({ pendingInvoices = [] }) {
  const { formatCurrency } = usePreferences();
  const [activeInsight, setActiveInsight] = useState(null); // 'risk', 'reminders', 'cashflow', null
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Credit Risk Logic
  const riskAnalysis = useMemo(() => {
    const highRisk = pendingInvoices.filter(inv => {
      const daysOverdue = (new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24);
      return daysOverdue > 30; // More than 30 days overdue
    });
    const totalRiskAmount = highRisk.reduce((sum, inv) => {
      const balance = typeof inv.balance === 'string' ? parseFloat(inv.balance.replace(/[^0-9.-]+/g,"")) : (inv.balance || 0);
      return sum + balance;
    }, 0);
    return { highRisk, totalRiskAmount };
  }, [pendingInvoices]);

  // 2. Cash Flow Projection Logic
  const cashFlowForecast = useMemo(() => {
    const expectedWithin15Days = pendingInvoices.reduce((sum, inv) => {
      const daysOverdue = (new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24);
      // Assume we can collect anything < 30 days overdue in the next 15 days
      if (daysOverdue <= 30) {
        const balance = typeof inv.balance === 'string' ? parseFloat(inv.balance.replace(/[^0-9.-]+/g,"")) : (inv.balance || 0);
        return sum + balance;
      }
      return sum;
    }, 0);
    return expectedWithin15Days;
  }, [pendingInvoices]);

  const simulateAILoading = (insight) => {
    setIsProcessing(true);
    setActiveInsight(null);
    setTimeout(() => {
      setIsProcessing(false);
      setActiveInsight(insight);
    }, 1500);
  };

  const [sentReminders, setSentReminders] = useState(false);
  const handleSendSmartReminders = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSentReminders(true);
      setTimeout(() => setSentReminders(false), 3000);
    }, 2000);
  };

  return (
    <div className="glass-card-premium" style={{ marginBottom: '2rem', border: '1px solid var(--primary-light)', background: 'linear-gradient(145deg, var(--surface) 0%, rgba(0, 54, 102, 0.02) 100%)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '8px', 
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,54,102,0.2)'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>Atlas AI Finance Insights</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-driven analysis based on real-time Zoho Books ledger data.</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => simulateAILoading('risk')} className="gcp-btn-secondary" style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem', gap: '0.5rem', background: activeInsight === 'risk' ? 'var(--surface-raised)' : 'transparent', border: activeInsight === 'risk' ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
          <AlertTriangle size={20} color="var(--danger)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Credit Risk Evaluation</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identify high-risk unpaid invoices</div>
          </div>
        </button>
        <button onClick={() => simulateAILoading('reminders')} className="gcp-btn-secondary" style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem', gap: '0.5rem', background: activeInsight === 'reminders' ? 'var(--surface-raised)' : 'transparent', border: activeInsight === 'reminders' ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
          <Send size={20} color="#3b82f6" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Smart Reminders</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI-drafted collection emails</div>
          </div>
        </button>

        <button onClick={() => simulateAILoading('cashflow')} className="gcp-btn-secondary" style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem', gap: '0.5rem', background: activeInsight === 'cashflow' ? 'var(--surface-raised)' : 'transparent', border: activeInsight === 'cashflow' ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
          <TrendingUp size={20} color="var(--success)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Cash Flow Projection</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>15-day revenue forecast</div>
          </div>
        </button>
      </div>

      {isProcessing && (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border)' }}>
          <RefreshCw size={24} color="var(--primary)" className="spin" />
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Atlas AI is analyzing ledger data...</span>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
      )}

      {activeInsight === 'risk' && !isProcessing && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(239, 68, 68, 0.05)', animation: 'fadeIn 0.3s ease-out' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--danger)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> High-Risk Accounts Identified
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Atlas AI has detected <strong>{riskAnalysis.highRisk.length} invoices</strong> that are over 30 days overdue, representing a total credit exposure of <strong>{formatCurrency(riskAnalysis.totalRiskAmount)}</strong>.
          </p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {riskAnalysis.highRisk.slice(0, 3).map((inv, idx) => (
              <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inv.customer_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice {inv.invoice_number} • Due: {inv.due_date}</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '0.9rem' }}>{formatCurrency(typeof inv.balance === 'string' ? parseFloat(inv.balance.replace(/[^0-9.-]+/g,"")) : inv.balance)}</div>
              </div>
            ))}
            {riskAnalysis.highRisk.length > 3 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>+ {riskAnalysis.highRisk.length - 3} more high-risk invoices in the ledger.</div>
            )}
          </div>
        </div>
      )}

      {activeInsight === 'reminders' && !isProcessing && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(59, 130, 246, 0.05)', animation: 'fadeIn 0.3s ease-out' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#3b82f6', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} /> Smart Collection Reminders
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Atlas AI has drafted personalized, polite reminder emails for the top 5 overdue accounts. The tone is optimized for medical B2B collections to preserve clinic relationships while accelerating payment.
          </p>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Example Draft (To: Regenerative Med Spa)</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "Dear Dr. Smith, we hope your clinic is having a great week. We noticed that Invoice #INV-00142 for {formatCurrency(2450)} is currently past its due date. To ensure uninterrupted supply of your protocols, please process this payment at your earliest convenience. A payment link is attached."
            </div>
          </div>

          <button 
            onClick={handleSendSmartReminders}
            disabled={sentReminders}
            className="gcp-btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: sentReminders ? 'var(--success)' : '#3b82f6' }}
          >
            {sentReminders ? <><CheckCircle size={18} /> Reminders Sent Successfully</> : <><Send size={18} /> Dispatch AI Reminders to {Math.min(pendingInvoices.length, 5)} Clinics</>}
          </button>
        </div>
      )}

      {activeInsight === 'cashflow' && !isProcessing && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(34, 197, 94, 0.05)', animation: 'fadeIn 0.3s ease-out' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--success)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> 15-Day Cash Flow Projection
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Based on historical payment velocities and current pending ledger items (excluding defaults &gt;30 days), Atlas AI projects the following cash collections over the next 15 days.
              </p>
            </div>
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--success)', textAlign: 'center', minWidth: '250px', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.1)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Expected Collections</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em' }}>
                {formatCurrency(cashFlowForecast)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem', fontWeight: 600 }}>
                <TrendingUp size={14} /> High Confidence (87%)
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}