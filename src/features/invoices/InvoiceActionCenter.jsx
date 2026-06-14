import React from 'react';
import Zap from "lucide-react/dist/esm/icons/zap";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Target from "lucide-react/dist/esm/icons/target";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Bell from "lucide-react/dist/esm/icons/bell";
import PhoneCall from "lucide-react/dist/esm/icons/phone-call";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";

export default function InvoiceActionCenter({ invoice }) {
  // If invoice is null, show Global Collections Center
  if (!invoice) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collections Priority</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Global Pharma</span>
                <span>€45,000</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>12 days overdue</div>
            </div>
            <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Longevity Hub</span>
                <span>€12,000</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#b45309' }}>5 days overdue</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Zap size={14} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atlas Finance AI</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Target size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Cash Flow Forecast</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Expect €85,000 to clear by Friday based on historical payment patterns.</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Invoice Specific Action Center
  const isOverdue = invoice.status === 'Overdue';
  const isPaid = invoice.status === 'Paid';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '2rem' }}>
      
      {/* 1. Recommended Actions */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Actions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!isPaid ? (
            <>
              <button style={btnStyle('#059669', '#fff', true)}>
                <DollarSign size={16} /> Record Payment
              </button>
              <button style={secBtnStyle}>
                <Bell size={16} /> Send Reminder
              </button>
              <button style={secBtnStyle}>
                <PhoneCall size={16} /> Log Collection Call
              </button>
              {isOverdue && (
                <button style={{ ...secBtnStyle, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}>
                  <AlertTriangle size={16} /> Escalate Collection
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '8px', border: '1px solid #6ee7b7', color: '#065f46', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} /> Payment Received in Full
              </div>
              <button style={secBtnStyle}>
                <ArrowRight size={16} /> Send Receipt
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Atlas AI Intelligence Hub */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={14} color="#8b5cf6" />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atlas Intelligence</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           
           {!isPaid && (
             <div style={{ background: isOverdue ? '#fef2f2' : '#f8fafc', border: `1px solid ${isOverdue ? '#fecaca' : '#e2e8f0'}`, borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CalendarDays size={16} color={isOverdue ? "#dc2626" : "#64748b"} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isOverdue ? '#991b1b' : '#475569', marginBottom: '0.2rem' }}>Payment Prediction</div>
                  <div style={{ fontSize: '0.75rem', color: isOverdue ? '#b91c1c' : '#64748b' }}>Customer typically pays 5 days after due date. Expect payment on Tuesday.</div>
                </div>
             </div>
           )}

           {/* Customer Risk */}
           <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>Credit Exposure High</div>
                <div style={{ fontSize: '0.75rem', color: '#b45309' }}>This invoice pushes customer to 95% of their €100k credit limit.</div>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
}

const btnStyle = (bg, color, primary = false) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  background: bg,
  color: color,
  border: 'none',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: primary ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none'
});

const secBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  background: '#fff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer'
};
