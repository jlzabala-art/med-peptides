import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Clock from "lucide-react/dist/esm/icons/clock";
import User from "lucide-react/dist/esm/icons/user";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
/**
 * PatientPrescriptionPanel.jsx
 *
 * Section that appears in PatientHome when the patient has pending prescriptions.
 * Shows each prescription from their doctor with:
 *   - Product/protocol list + dosage info
 *   - Clinical notes from the doctor
 *   - CTA: "Pagar esta prescripción" → adds all items to cart + marks source
 *
 * The panel only renders if the patient has prescriptions in status:
 *   'sent' | 'viewed_by_patient'
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';












import { RX_STATUS, RX_STATUS_META } from '../../config/prescriptionConfig';

// ── Mini status badge ─────────────────────────────────────────────────────────
function RxBadge({ status }) {
  const m = RX_STATUS_META[status] || RX_STATUS_META.sent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      background: m.bg, color: m.color, fontSize: '0.65rem', fontWeight: 800,
    }}>
      {m.emoji} {m.label}
    </span>
  );
}

// ── Individual prescription card ──────────────────────────────────────────────
function PrescriptionCard({ rx, onPay }) {
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const createdDate = rx.createdAt?.toDate
    ? rx.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const handlePay = async () => {
    setPaying(true);
    await onPay(rx);
    setPaying(false);
  };

  const isPending = [RX_STATUS.SENT, RX_STATUS.VIEWED_BY_PATIENT].includes(rx.status);
  const isOrdered = rx.status === RX_STATUS.ORDERED || rx.orderId;

  return (
    <div style={{
      background: 'var(--color-bg-surface)', borderRadius: '18px',
      border: '1.5px solid rgba(0,54,102,0.12)',
      boxShadow: '0 4px 20px rgba(0,54,102,0.07)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        padding: '1.1rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(0,54,102,0.03), rgba(0,54,102,0.01))',
        borderBottom: open ? '1px solid #f1f5f9' : 'none',
        display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
      }} onClick={() => setOpen(v => !v)}>

        <div style={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
          background: 'rgba(0,54,102,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={18} color="var(--color-primary)" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
          Prescription from {rx.doctorName || 'your doctor'}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: '0.1rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={9} /> {createdDate}
            {rx.diagnosis && <span>· {rx.diagnosis}</span>}
            <span>· {rx.items?.length || 0} ítem{(rx.items?.length || 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <RxBadge status={rx.status} />
          {open ? <ChevronUp size={14} color="var(--color-border)" /> : <ChevronDown size={14} color="var(--color-border)" />}
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '1rem 1.25rem' }}>
          {/* Items */}
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={sLabel}>💊 Prescribed Products</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {(rx.items || []).map((item, i) => {
                const lineTotal = item.pricePatient ? (item.pricePatient * (item.quantity || 1)) : null;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.65rem 0.9rem', borderRadius: '10px', background: 'var(--color-bg-app)',
                    border: '1px solid #f1f5f9',
                  }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                      {item.type === 'protocol' ? '🧬' : '💊'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '0.1rem' }}>
                        {[
                          item.quantity && `${item.quantity} ${item.unit || 'vials'}`,
                          item.dosage,
                          item.frequency,
                          item.duration,
                        ].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    {lineTotal && (
                      <span style={{
                        fontWeight: 800, fontSize: '0.82rem', color: 'var(--color-primary)',
                        background: 'rgba(0,54,102,0.06)', padding: '0.2rem 0.55rem',
                        borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {item.currency || 'USD'} {lineTotal.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Total line */}
              {(() => {
                const total = (rx.items || []).reduce((s, it) =>
                  s + (it.pricePatient ? it.pricePatient * (it.quantity || 1) : 0), 0);
                const hasPrices = (rx.items || []).some(it => it.pricePatient);
                return hasPrices ? (
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                    gap: '0.5rem', paddingTop: '0.35rem',
                    borderTop: '1px solid #e2e8f0', marginTop: '0.25rem',
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>Estimated total:</span>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      {(rx.items[0]?.currency || 'USD')} {total.toFixed(2)}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Clinical notes */}
          {(rx.diagnosis || rx.clinicalNotes) && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(0,54,102,0.04)', border: '1px solid rgba(0,54,102,0.1)',
              marginBottom: '0.85rem' }}>
              <div style={sLabel}><Stethoscope size={10} style={{ display: 'inline', marginRight: 3 }} />Clinical Note</div>
              {rx.diagnosis && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: 700, marginTop: '0.3rem' }}>
                  {rx.diagnosis}
                </div>
              )}
              {rx.clinicalNotes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.55 }}>
                  {rx.clinicalNotes}
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          {isPending && !isOrdered && (() => {
            const total = (rx.items || []).reduce((s, it) =>
              s + (it.pricePatient ? it.pricePatient * (it.quantity || 1) : 0), 0);
            const hasPrices = (rx.items || []).some(it => it.pricePatient);
            return (
              <button onClick={handlePay} disabled={paying} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '0.9rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #003666, #005599)',
                color: 'var(--color-bg-surface)', fontWeight: 800, fontSize: '0.88rem',
                border: 'none', cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(0,54,102,0.3)',
                transition: 'all 0.15s', opacity: paying ? 0.7 : 1,
              }}
              onMouseEnter={e => !paying && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <ShoppingCart size={16} />
                <span>
                  {paying ? 'Adding to cart…' : 'Add to cart'}
                  {hasPrices && !paying && (
                    <span style={{ marginLeft: '0.4rem', opacity: 0.85, fontWeight: 700 }}>
                      · {(rx.items[0]?.currency || 'USD')} {total.toFixed(2)}
                    </span>
                  )}
                </span>
                {!paying && <ArrowRight size={14} />}
              </button>
            );
          })()}

          {/* AI Clinical Assist button for the patient */}
          <div style={{ marginTop: '0.85rem' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const itemNames = (rx.items || []).map(i => i.name).join(', ');
                window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                  detail: {
                    message: `Can you explain my prescription from ${rx.doctorName || 'my doctor'}? It includes: ${itemNames}. How should I take this and what should I expect?`,
                    patientContext: true,
                    autoSend: true
                  }
                }));
              }}
              className="btn"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.8rem', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                color: '#8b5cf6', fontWeight: 700, fontSize: '0.85rem',
                border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))'}
            >
              <Sparkles size={16} />
              <span>Ask Atlas about this prescription</span>
            </button>
          </div>

          {isOrdered && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
              padding: '0.75rem', borderRadius: '10px',
              background: 'rgba(16,185,129,0.06)', color: 'var(--color-success)',
              fontSize: '0.82rem', fontWeight: 700 }}>
              <CheckCircle2 size={15} /> Order placed · Your doctor has been notified
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const sLabel = {
  fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function PatientPrescriptionPanel({ patientUid, onAddToCart }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const navigate                          = useNavigate();

  // Real-time listener — only prescriptions addressed to this patient
  useEffect(() => {
    if (!patientUid) { setLoading(false); return; }

    const q = query(
      collection(db, 'prescriptions'),
      where('patient.uid', '==', patientUid),
    );
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort: pending first, then by date desc
      all.sort((a, b) => {
        const aActive = ['sent', 'viewed_by_patient'].includes(a.status);
        const bActive = ['sent', 'viewed_by_patient'].includes(b.status);
        if (aActive !== bActive) return aActive ? -1 : 1;
        const aDate = a.createdAt?.toDate?.() ?? new Date(0);
        const bDate = b.createdAt?.toDate?.() ?? new Date(0);
        return bDate - aDate;
      });
      setPrescriptions(all);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [patientUid]);

  // Mark as viewed when patient opens the panel
  useEffect(() => {
    if (prescriptions.length === 0) return;
    prescriptions
      .filter(rx => rx.status === RX_STATUS.SENT)
      .forEach(rx => {
        updateDoc(doc(db, 'prescriptions', rx.id), {
          status:    RX_STATUS.VIEWED_BY_PATIENT,
          updatedAt: serverTimestamp(),
          timeline:  [...(rx.timeline || []), {
            event: 'viewed_by_patient', actorId: patientUid, actorRole: 'patient',
            note: '', timestamp: new Date().toISOString(),
          }],
        }).catch(() => {});
      });
  }, [prescriptions, patientUid]);

  // Handle "pay" — adds all Rx items to cart via global event + opens cart
  const handlePay = async (rx) => {
    // Fire global add-to-cart-direct events with full price metadata
    for (const item of rx.items || []) {
      window.dispatchEvent(new CustomEvent('add-to-cart-direct', {
        detail: {
          product: {
            id:             item.id || item.name,
            name:           item.name,
            sku:            item.sku || '',
            // Use pricePatient from Rx snapshot — what the patient pays
            price:          item.pricePatient || null,
            priceUSD:       item.pricePatient || null,
            currency:       item.currency || 'USD',
            prescriptionId: rx.id,
            rxSource:       true,
            doctorId:       rx.doctorId,
            supervisingPhysicianId: rx.doctorId,
          },
          delta: item.quantity || 1,
          metadata: {
            prescriptionId: rx.id,
            source: 'doctor_prescribed',
            supervisingPhysicianId: rx.doctorId,
            recommendationId: rx.id,
          },
        },
      }));
    }

    // Also open cart modal so patient sees items added
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-cart'));
    }, 200);

    // Update prescription status → ordered (notifies doctor in real-time)
    await updateDoc(doc(db, 'prescriptions', rx.id), {
      status:    RX_STATUS.ORDERED,
      updatedAt: serverTimestamp(),
      timeline:  [...(rx.timeline || []), {
        event: 'ordered', actorId: patientUid, actorRole: 'patient',
        note: 'Patient added to cart from prescription',
        timestamp: new Date().toISOString(),
      }],
    }).catch(() => {});
  };

  // Don't render if no prescriptions at all
  if (loading) return null;
  if (prescriptions.length === 0) return null;

  const pending = prescriptions.filter(rx => ['sent', 'viewed_by_patient'].includes(rx.status));

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ fontSize: '1.15rem' }}>💊</span>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              Your Medical Prescriptions
              {pending.length > 0 && (
                <span style={{ display: 'inline-flex', marginLeft: '0.5rem',
                  width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger)',
                  color: 'var(--color-bg-surface)', fontSize: '0.65rem', fontWeight: 900,
                  alignItems: 'center', justifyContent: 'center' }}>
                  {pending.length}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.05rem' }}>
              {pending.length > 0
                ? `${pending.length} prescription${pending.length > 1 ? 's' : ''} pending payment`
                : 'All up to date'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {prescriptions.map(rx => (
          <PrescriptionCard key={rx.id} rx={rx} onPay={handlePay} />
        ))}
      </div>
    </div>
  );
}