import React from 'react';
import { Truck, BookOpen, MessageCircle, Check, Activity, FileDown } from '@/lib/icons';

export default function CheckoutSuccess({
  enrichedCartItems,
  cartMetadata,
  protocolGroups,
  finalOrderData,
  downloadPDF
}) {
    const suppliesItems = enrichedCartItems.filter(i => !cartMetadata[i.itemKey]?.protocolRequest);
    const planGroups = Object.entries(protocolGroups);

    const NEXT_STEPS = [
      { icon: Truck,         label: 'Order Preparation in Progress', sub: 'Your materials are being prepared.' },
      { icon: BookOpen,      label: 'Laboratory Preparation Guide',   sub: 'Review the instructions included in your documentation.' },
      { icon: MessageCircle, label: 'Clinical Support Follow-up',     sub: 'A specialist may contact you if required.' },
    ];

    return (
      <>
        {/* Keyframe injection */}
        <style>{`
          @keyframes pa-pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(0,113,189,0.18); }
            50%      { box-shadow: 0 0 0 12px rgba(0,113,189,0.0); }
          }
          @keyframes pa-ring {
            0%   { transform: scale(0.75); opacity:0; }
            60%  { transform: scale(1.06); opacity:1; }
            100% { transform: scale(1);   opacity:1; }
          }
          @keyframes pa-fade-up {
            from { opacity:0; transform: translateY(14px); }
            to   { opacity:1; transform: translateY(0); }
          }
          .pa-section { animation: pa-fade-up 0.5s ease both; }
          .pa-section:nth-child(2) { animation-delay: 0.07s; }
          .pa-section:nth-child(3) { animation-delay: 0.14s; }
          .pa-section:nth-child(4) { animation-delay: 0.21s; }
          .pa-section:nth-child(5) { animation-delay: 0.28s; }
          /* Next-steps icons: no color change on hover */

          /* ── Responsive layout ── */
          .pa-content-grid {
            display: flex;
            flex-direction: column;
            gap: 1.75rem;
            width: 100%;
          }
          .pa-col-left, .pa-col-right {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .pa-card {
            background: #ffffff;
            border: 0.5px solid rgba(0,0,0,0.09);
            border-radius: 16px;
            overflow: hidden;
          }
          .pa-card-blue {
            background: #ffffff;
            border: 0.5px solid rgba(0,113,189,0.18);
            border-radius: 16px;
            overflow: hidden;
          }
          .pa-card-green {
            background: #ffffff;
            border: 0.5px solid rgba(37,211,102,0.28);
            border-radius: 16px;
            overflow: hidden;
          }
          /* Desktop: 2-column grid */
          @media (min-width: 960px) {
            .pa-content-grid {
              display: grid;
              grid-template-columns: 1fr 340px;
              grid-template-rows: auto;
              align-items: start;
              gap: 1.75rem;
              max-width: 980px;
            }
            .pa-col-right {
              position: sticky;
              top: 2rem;
            }
          }
          /* Mobile: single card feel */
          @media (max-width: 640px) {
            .pa-content-grid { padding: 0; }
            .pa-card, .pa-card-blue, .pa-card-green {
              border-radius: 12px;
            }
          }
        `}</style>

        <div id="co-overlay" style={{
          position: 'fixed', inset: 0, background: 'var(--color-bg-surface)',
          zIndex: 3000, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 'clamp(3rem,8vh,6rem) clamp(1rem,4vw,2.5rem) 4rem',
        }}>
          {/* Hero header — always full width */}
          <div className="pa-section" style={{ textAlign: 'center', width: '100%', maxWidth: 980, marginBottom: '0.5rem' }}>
              {/* Animated check ring */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 84, height: 84, borderRadius: '50%',
                border: '0.5px solid rgba(0,113,189,0.2)',
                animation: 'pa-ring 0.5s cubic-bezier(0.34,1.56,0.64,1) both, pa-pulse 2.6s ease-in-out 0.8s infinite',
                marginBottom: '1.25rem',
              }}>
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={30} color="var(--color-bg-surface)" strokeWidth={2.5} />
                </div>
              </div>

              <div style={{
                display: 'inline-block',
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em',
                color: hasProtocols ? 'var(--primary)' : 'var(--color-success)',
                textTransform: 'uppercase',
                border: hasProtocols ? '1px solid rgba(0,113,189,0.25)' : '1px solid rgba(16,185,129,0.3)',
                borderRadius: '20px', padding: '0.25rem 0.85rem',
                marginBottom: '1rem',
                background: hasProtocols ? 'rgba(0,113,189,0.04)' : 'rgba(16,185,129,0.05)',
              }}>
                {hasProtocols ? 'Protocol Status: ACTIVATED' : (isProfessional ? 'Quotation Status: REQUESTED' : 'Order Status: CONFIRMED')}
              </div>

              {/* ── Protocol banner ── */}
              {hasProtocols && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.06) 100%)',
                  border: '0.5px solid rgba(245,158,11,0.4)',
                  borderRadius: '10px', padding: '0.45rem 1rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: '#92400e', letterSpacing: '0.03em',
                }}>
                  <Activity size={13} strokeWidth={2} color="var(--color-warning)" />
                  Research Protocol Activated
                </div>
              )}

              <h1 style={{
                fontSize: 'clamp(1.7rem,4.5vw,2.6rem)', fontWeight: 800,
                color: '#0f172a', lineHeight: 1.15, marginBottom: '0.6rem',
              }}>
                {hasProtocols ? 'Protocol Activated' : (isProfessional ? 'Quotation Requested' : 'Order Confirmed')}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                Thank you, <strong style={{ color: '#0f172a' }}>{(finalOrderData?.formData || formData).firstName}</strong>. Your research inquiry has been registered.
                <br />
                <span style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Check your email <strong style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{formData.email}</strong> to complete the transaction.
                </span>
              </p>
            </div>

          {/* ── 2-column responsive grid ── */}
          <div className="pa-content-grid">

            {/* ── LEFT COLUMN: Payment Instructions (priority) → Steps → CTAs → WhatsApp → Footer ── */}
            <div className="pa-col-left">

            {/* ── PAYMENT INSTRUCTIONS (shown first — highest urgency) ── */}
            <div className="pa-section" style={{
              border: formData.paymentMethod === 'bank_transfer'
                ? '0.5px solid rgba(0,113,189,0.2)'
                : '0.5px solid rgba(99,102,241,0.22)',
              borderRadius: 16,
              background: formData.paymentMethod === 'bank_transfer'
                ? 'rgba(0,113,189,0.03)'
                : 'rgba(99,102,241,0.03)',
              padding: '1.25rem 1.5rem',
            }}>
              <h3 style={{ 
                fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', 
                marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                letterSpacing: '-0.01em'
              }}>
                {formData.paymentMethod === 'bank_transfer'
                  ? <><CreditCard size={17} color="var(--primary)" /> Bank Transfer Instructions</>
                  : <><CreditCard size={17} color="#6366f1" /> Card Payment — Next Step</>
                }
              </h3>

              {formData.paymentMethod === 'bank_transfer' ? (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                    background: 'rgba(0,113,189,0.06)', border: '0.5px solid rgba(0,113,189,0.18)',
                    borderRadius: 10, padding: '0.65rem 0.9rem',
                    marginBottom: '1rem', fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.55,
                  }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>✉️</span>
                    <span>
                      The <strong>complete bank account details</strong> have been sent to{' '}
                      <strong style={{ color: 'var(--primary)' }}>{formData.email}</strong>.
                      Use <strong>Order {orderId}</strong> as the payment reference.
                    </span>
                  </div>
                  <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Beneficiary</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>Atlas Health International</strong>
                    </div>
                    <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>IBAN</span>
                      <strong style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.82rem', letterSpacing: '0.04em' }}>ES12 3456 7890 1234 5678 9012</strong>
                    </div>
                    <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SWIFT / BIC</span>
                      <strong style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.82rem' }}>MEDPINTLXXX</strong>
                    </div>
                    <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reference (required)</span>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.88rem', letterSpacing: '0.05em' }}>Order {orderId}</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.71rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                    ⏱ Processing begins once funds clear — typically within 24–48 business hours.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                    background: 'rgba(99,102,241,0.06)', border: '0.5px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, padding: '0.65rem 0.9rem',
                    marginBottom: '0.85rem', fontSize: '0.8rem', color: '#4338ca', lineHeight: 1.55,
                  }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔗</span>
                    <span>
                      A <strong>secure payment link</strong> will be sent to{' '}
                      <strong style={{ color: '#6366f1' }}>{formData.email}</strong>{' '}
                      within the next <strong>48 hours</strong>. Open it to pay safely via credit or debit card.
                    </span>
                  </div>
                  <p style={{ fontSize: '0.71rem', color: 'var(--color-text-tertiary)', marginTop: '0.1rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                    ⏱ Check your spam folder if you don't see it within 48 hours.
                  </p>
                </div>
              )}
            </div>

            {/* ── ORDER REFERENCE ── */}
            <div className="pa-section" style={{
              border: '0.5px solid rgba(0,113,189,0.18)',
              borderRadius: 16,
              background: 'rgba(248,252,255,0.9)',
              padding: '1rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Order Reference</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>{orderId}</div>
            </div>

            {/* ── NEXT STEPS ── */}
            <div className="pa-section" style={{
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.65rem 1.25rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-secondary)',
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>Next Steps for Researchers</div>
              <div style={{ padding: '0.5rem 1.25rem 0.85rem' }}>
                {NEXT_STEPS.map(({ icon: Icon, label, sub }, idx) => (
                  <div key={idx} className="pa-step-item" style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '0.85rem 0',
                    borderBottom: idx < NEXT_STEPS.length - 1 ? '0.5px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', paddingTop: '2px' }}>
                      <div className="pa-step-icon" style={{
                        width: 34, height: 34, borderRadius: '50%',
                        border: '1px solid rgba(0,113,189,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', flexShrink: 0,
                        transition: 'background 0.25s, color 0.25s',
                      }}>
                        <Icon size={15} strokeWidth={1.8} />
                      </div>
                      {idx < NEXT_STEPS.length - 1 && (
                        <div style={{ width: 1, height: 18, background: 'rgba(0,113,189,0.12)' }} />
                      )}
                    </div>
                    <div style={{ paddingTop: '0.35rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--primary)', marginRight: '0.4rem', fontSize: '0.72rem' }}>0{idx + 1}</span>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5. CTAs ── */}
            <div className="pa-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Protocol manual download — only shown when a protocol was ordered */}
              {hasProtocols && (
                <button
                  onClick={downloadPDF}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    padding: '1.2rem 1.5rem',
                    background: 'linear-gradient(135deg, #1e40af 0%, var(--primary) 50%, #0ea5e9 100%)',
                    color: 'var(--color-bg-surface)', border: 'none', borderRadius: 12,
                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    letterSpacing: '0.01em',
                    boxShadow: '0 4px 20px rgba(0,113,189,0.35)',
                    transition: 'opacity 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}
                >
                  <FileDown size={20} strokeWidth={1.8} />
                  Download Protocol Manual (PDF)
                </button>
              )}

              {/* Primary: Preview & Print Receipt */}
              <button
                onClick={previewReceipt}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  padding: '1.1rem 1.5rem',
                  background: hasProtocols
                    ? 'rgba(0,54,102,0.06)'
                    : 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                  border: hasProtocols ? '1px solid rgba(0,54,102,0.18)' : 'none',
                  borderRadius: 12, fontWeight: 700,
                  fontSize: '0.95rem',
                  color: hasProtocols ? 'var(--primary)' : 'var(--color-bg-surface)',
                  cursor: 'pointer',
                  boxShadow: hasProtocols ? 'none' : '0 4px 16px rgba(0,113,189,0.28)',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                🖨️ Preview &amp; Print Receipt
              </button>

              {/* Optional: Download Receipt PDF */}
              <button
                onClick={downloadReceiptPDF}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  padding: '0.85rem 1.5rem',
                  background: 'transparent',
                  border: '1px dashed rgba(0,113,189,0.3)',
                  borderRadius: 12, fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--primary)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,113,189,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,113,189,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,113,189,0.3)'; }}
              >
                <FileDown size={16} strokeWidth={1.8} />
                Download Receipt (PDF)
              </button>

              {/* Secondary: View My Orders */}
              <button
                onClick={() => { window.location.href = '/patient/orders'; }}
                style={{
                  padding: '1.1rem 1.5rem',
                  background: 'rgba(0,0,0,0.03)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 12, fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)', cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View My Orders
                <ArrowLeft size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>

            {/* ── 6. WhatsApp Contact Section ── */}
            <div className="pa-section" style={{
              border: '0.5px solid rgba(37,211,102,0.25)',
              borderRadius: 16,
              background: 'rgba(37,211,102,0.03)',
              padding: '1.25rem 1.5rem',
            }}>
              <p style={{
                fontSize: '0.82rem', color: 'var(--color-text-primary)', lineHeight: 1.7,
                margin: '0 0 1rem',
              }}>
                Our technical team is available to guide you. You can also contact us via
                {' '}<strong style={{ color: '#0f172a' }}>WhatsApp</strong> for any questions regarding your protocol administration.
              </p>
              <button
                onClick={() => {
                  const WA_NUMBER = '971564179256';
                  const msg = encodeURIComponent(`Hello, I just placed order ${orderId} and I need guidance on my protocol.`);
                  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  width: '100%', padding: '0.9rem 1.5rem',
                  background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                  color: 'var(--color-bg-surface)', border: 'none', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <MessageCircle size={18} strokeWidth={1.8} />
                Contact Clinical Support via WhatsApp
              </button>
            </div>

            {/* ── 7. Footer disclaimer ── */}
            <div className="pa-section" style={{
              textAlign: 'center',
              fontSize: '0.68rem', color: 'var(--color-border)',
              letterSpacing: '0.08em', paddingTop: '0.5rem',
            }}>
              FOR RESEARCH USE ONLY — Not for human therapeutic use &nbsp;·&nbsp; Atlas Health.com
            </div>

            </div>{/* end pa-col-left */}

            {/* ── RIGHT COLUMN: Order Card + Supplies ── */}
            <div className="pa-col-right">

              {/* Order ID card */}
              <div className="pa-section" style={{
                border: '0.5px solid rgba(0,113,189,0.14)',
                borderRadius: 16,
                background: 'rgba(248,252,255,0.85)',
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Tracking Reference</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>{orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Status</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', letterSpacing: '0.08em' }}>● Processing</div>
                </div>
              </div>

              {/* Research Supplies Inventory */}
              {(suppliesItems.length > 0 || planGroups.length > 0) && (
                <div className="pa-section" style={{
                  border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 16, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '0.65rem 1.25rem',
                    borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                    fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-secondary)',
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <Activity size={12} /> Research Supplies Inventory
                  </div>
                  <div style={{ padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {suppliesItems.map(i => (
                      <div key={i.itemKey} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.4rem 0', borderBottom: '0.5px solid #f1f5f9',
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f172a' }}>{i.namePart}{i.dosagePart ? ` — ${i.dosagePart}` : ''}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{i.qty} unit{i.qty > 1 ? 's' : ''}</span>
                      </div>
                    ))}
                    {planGroups.map(([pName, items]) => {
                      const totalUnits = items.reduce((a, i) => a + i.qty, 0);
                      const weeks = Math.max(1, Math.round(totalUnits / Math.max(1, items.length)));
                      return (
                        <div key={pName} style={{ paddingTop: suppliesItems.length > 0 ? '0.5rem' : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <Activity size={11} color="var(--primary)" />
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{pName}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>~{weeks}w · {totalUnits} vials</span>
                          </div>
                          {items.map(({ itemKey, qty }) => (
                            <div key={itemKey} style={{
                              display: 'flex', justifyContent: 'space-between',
                              fontSize: '0.78rem', padding: '0.25rem 0 0.25rem 1rem',
                              borderBottom: '0.5px solid #f8fafc',
                            }}>
                              <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{itemKey}</span>
                              <span style={{ fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{(qty / weeks).toFixed(1)} vial/w</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>{/* end pa-col-right */}

          </div>{/* end pa-content-grid */}
        </div>
      </>
    );
}
