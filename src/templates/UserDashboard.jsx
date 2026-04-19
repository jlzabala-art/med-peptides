import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
  Package, Clock, CheckCircle2, Truck, ExternalLink,
  ShieldCheck, ArrowLeft, ClipboardList, Info,
  FileText, MessageSquare, Download, Loader2
} from 'lucide-react';
import { generateClinicalProtocol } from '../services/pdfService';

// ─── Status Configuration ────────────────────────────────────────────────────
// Extracted outside the component to prevent object recreation on every render.
const STATUS_CONFIG = {
  completed:   { color: 'var(--success)',      icon: <CheckCircle2 size={16} strokeWidth={1.2} /> },
  delivered:   { color: 'var(--success)',      icon: <CheckCircle2 size={16} strokeWidth={1.2} /> },
  shipped:     { color: 'var(--primary)',      icon: <Truck        size={16} strokeWidth={1.2} /> },
  'in transit':{ color: 'var(--primary)',      icon: <Truck        size={16} strokeWidth={1.2} /> },
  pending:     { color: '#f59e0b',             icon: <Clock        size={16} strokeWidth={1.2} /> },
  processing:  { color: '#f59e0b',             icon: <Clock        size={16} strokeWidth={1.2} /> },
  cancelled:   { color: 'var(--error)',        icon: <Package      size={16} strokeWidth={1.2} /> },
};

const DEFAULT_STATUS = { color: 'var(--text-muted)', icon: <Package size={16} strokeWidth={1.2} /> };

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] ?? DEFAULT_STATUS;

// ─── Skeleton Card ────────────────────────────────────────────────────────────
// Mirrors the exact layout of a real order card to eliminate layout shift.
function SkeletonCard() {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header row: order id + status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className="sk-block" style={{ width: '160px', height: '13px' }} />
          <div className="sk-block" style={{ width: '120px', height: '12px' }} />
        </div>
        <div className="sk-block" style={{ width: '100px', height: '32px', borderRadius: '99px' }} />
      </div>

      {/* Detail grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px dashed var(--border)',
      }}>
        {/* Items column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk-block" style={{ width: '50px',  height: '11px' }} />
          <div className="sk-block" style={{ width: '140px', height: '13px' }} />
          <div className="sk-block" style={{ width: '110px', height: '13px' }} />
        </div>
        {/* Shipment column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk-block" style={{ width: '65px',  height: '11px' }} />
          <div className="sk-block" style={{ width: '130px', height: '13px' }} />
          <div className="sk-block" style={{ width: '90px',  height: '13px' }} />
        </div>
        {/* Total value column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="sk-block" style={{ width: '75px',  height: '11px' }} />
          <div className="sk-block" style={{ width: '80px',  height: '28px', borderRadius: '8px' }} />
          <div className="sk-block" style={{ width: '55px',  height: '11px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Logistics Timeline ───────────────────────────────────────────────────────
// Maps an order's free-text status to one of the 4 canonical milestone indices.
// Index 0 = Inquiry, 1 = Confirmed, 2 = Shipped, 3 = Delivered
const MILESTONES = [
  { label: 'Inquiry',   icon: <ClipboardList size={14} strokeWidth={1.4} /> },
  { label: 'Confirmed', icon: <CheckCircle2  size={14} strokeWidth={1.4} /> },
  { label: 'Shipped',   icon: <Truck         size={14} strokeWidth={1.4} /> },
  { label: 'Delivered', icon: <Package       size={14} strokeWidth={1.4} /> },
];

const STATUS_TO_STEP = {
  pending:     0,
  processing:  1,
  confirmed:   1,
  shipped:     2,
  'in transit':2,
  completed:   3,
  delivered:   3,
};

function OrderTimeline({ status }) {
  const step = STATUS_TO_STEP[status?.toLowerCase()] ?? 0;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      margin: '1.1rem 0',
    }}>
      {MILESTONES.map((m, idx) => {
        const done   = idx <= step;
        const active = idx === step;
        return (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', flex: idx < MILESTONES.length - 1 ? 1 : 'none' }}>
            {/* Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? (active ? 'var(--primary)' : 'rgba(0,75,135,0.12)') : '#f1f5f9',
                color: done ? (active ? 'white' : 'var(--primary)') : '#94a3b8',
                border: active ? '2px solid var(--primary)' : '2px solid transparent',
                boxShadow: active ? '0 0 0 3px rgba(0,75,135,0.12)' : 'none',
                transition: 'all 0.25s ease',
                flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: active ? 800 : 600,
                color: done ? (active ? 'var(--primary)' : 'var(--text-muted)') : '#cbd5e1',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {m.label}
              </span>
            </div>
            {/* Connector line */}
            {idx < MILESTONES.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                backgroundColor: idx < step ? 'rgba(0,75,135,0.2)' : '#e2e8f0',
                marginBottom: '18px', /* align with node centre */
                transition: 'background-color 0.25s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserDashboard({ onBack }) {
  const { user, isProfessional } = useAuth();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pdfLoading, setPdfLoading] = useState({}); // { [orderId]: boolean }

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(async (order) => {
    setPdfLoading((prev) => ({ ...prev, [order.id]: true }));
    try {
      // Build a minimal rawProtocol structure from the order's Firestore data.
      // generateClinicalProtocol is flexible and falls back gracefully for missing fields.
      const rawProtocol = order.protocol ?? {
        phases: order.items?.map((item, idx) => ({
          phase_number: idx + 1,
          phase_name: item.name,
          duration_weeks: item.durationWeeks ?? null,
          drugs_used: [{
            product_title: item.name,
            strength: item.strength ?? '',
            weekly_dose: item.dose ?? '',
            dosing_frequency: item.frequency ?? 'As directed',
            route: item.route ?? 'Subcutaneous',
          }],
        })) ?? [],
      };

      const formData = order.formData ?? {
        patientName: user?.displayName ?? 'Research Patient',
        practitionerName: order.customer?.name ?? '',
        clinic: order.customer?.clinic ?? '',
        orderId: order.orderId,
      };

      await generateClinicalProtocol(rawProtocol, formData);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate the PDF. Please try again.');
    } finally {
      setPdfLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  }, [user]);

  // ── Firestore real-time listener ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
        setLoading(false);
      },
      (error) => {
        console.error('Dashboard error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ── Memoised order list ───────────────────────────────────────────────────
  // Sorting and any future filtering logic lives here; recalculates only when
  // the `orders` array reference changes (i.e. on every Firestore snapshot).
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() ?? 0;
      const tB = b.createdAt?.toMillis?.() ?? 0;
      return tB - tA; // newest first (Firestore already orders this way, belt-and-suspenders)
    });
  }, [orders]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="template-root" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h2>Authentication Required</h2>
        <p>Please log in to view your order history.</p>
        <button className="btn btn-primary" onClick={onBack}>Return Home</button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="template-root"
      style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        minHeight: '100vh',
        backgroundColor: 'var(--surface)',
        backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)',
      }}
    >
      <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '3rem' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              padding: '0.5rem 1rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
            onMouseOut={(e)  => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
          >
            <ArrowLeft size={16} strokeWidth={1.2} /> RETURN TO SHOP
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Account Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                Manage your research inquiries and order tracking.
              </p>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1.25rem',
              background: isProfessional ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,54,102,0.05)',
              borderRadius: '16px',
              border: `1px solid ${isProfessional ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
            }}>
              <ShieldCheck size={20} strokeWidth={1.2} color={isProfessional ? 'var(--success)' : 'var(--primary)'} />
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isProfessional ? 'var(--success)' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isProfessional ? 'Professional Access' : 'Guest Researcher'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ display: 'grid', gap: '2rem' }}>

          {/* Orders Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'rgba(0, 75, 135, 0.05)', padding: '0.5rem', borderRadius: '12px', color: 'var(--primary)' }}>
                <ClipboardList size={24} strokeWidth={1.2} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Recent Orders</h2>
            </div>

            {/* ── Skeleton / Empty / List ── */}
            {loading ? (
              // SKELETON STATE — 3 placeholder cards matching real card anatomy
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : sortedOrders.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>📦</div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No orders found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  You haven't placed any research inquiries yet.
                </p>
                <button className="btn btn-primary" onClick={onBack}>Explore Catalog</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {sortedOrders.map((order) => {
                  const { color, icon } = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '16px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      {/* Order header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                            ORDER ID: {order.orderId}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Placed on:{' '}
                            {order.createdAt?.toDate
                              ? order.createdAt.toDate().toLocaleDateString()
                              : 'Recent'}
                          </div>
                        </div>

                        {/* Status badge */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.5rem 1rem', borderRadius: '99px',
                          backgroundColor: 'white', fontSize: '0.85rem', fontWeight: 700,
                          color, border: `1.5px solid ${color}`,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {icon}
                          {order.status || 'Pending'}
                        </div>
                      </div>

                      {/* Logistics Timeline */}
                      <OrderTimeline status={order.status} />

                      {/* Detail grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1.5rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px dashed var(--border)',
                      }}>
                        {/* Items */}
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
                            {order.items?.map((item, idx) => (
                              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.name}</span>
                                <span style={{ fontWeight: 700 }}>x{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Shipment */}
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipment</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                            {order.customer?.clinic && <div style={{ fontWeight: 700 }}>{order.customer.clinic}</div>}
                            <div>{order.customer?.address}</div>
                            <div>{order.customer?.country}</div>
                          </div>
                        </div>

                        {/* Total Value */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
                            {order.totalDisplay || '---'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Currency: {order.currency || 'USD'}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '1.25rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px dashed var(--border)',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}>

                        {/* ── Download Protocol PDF ── */}
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          disabled={!!pdfLoading[order.id]}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                            padding: '0.5rem 1.1rem', borderRadius: '10px',
                            backgroundColor: pdfLoading[order.id] ? 'rgba(0,75,135,0.04)' : 'rgba(0,75,135,0.07)',
                            color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem',
                            border: '1px solid rgba(0,75,135,0.15)',
                            letterSpacing: '0.04em', cursor: pdfLoading[order.id] ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s', opacity: pdfLoading[order.id] ? 0.7 : 1,
                          }}
                          onMouseOver={(e) => { if (!pdfLoading[order.id]) e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.14)'; }}
                          onMouseOut={(e)  => { if (!pdfLoading[order.id]) e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.07)'; }}
                        >
                          {pdfLoading[order.id]
                            ? <Loader2 size={14} strokeWidth={1.8} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Download size={14} strokeWidth={1.4} />}
                          {pdfLoading[order.id] ? 'Generating…' : 'Download PDF'}
                        </button>

                        <a
                          href={`mailto:logistics@regenpept.com?subject=COA Request — Order ${order.orderId}&body=Hello,%0A%0APlease send the Certificate of Analysis for order ${order.orderId}.%0A%0AThank you.`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                            padding: '0.5rem 1rem', borderRadius: '10px',
                            backgroundColor: 'rgba(0,75,135,0.07)',
                            color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem',
                            textDecoration: 'none', letterSpacing: '0.04em',
                            border: '1px solid rgba(0,75,135,0.15)',
                            transition: 'background 0.2s',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.14)')}
                          onMouseOut={(e)  => (e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.07)')}
                        >
                          <FileText size={14} strokeWidth={1.4} />
                          Request COA
                        </a>

                        <a
                          href={`mailto:logistics@regenpept.com?subject=Logistics Inquiry — Order ${order.orderId}&body=Hello,%0A%0AI have a question regarding order ${order.orderId}.%0A%0AThank you.`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                            padding: '0.5rem 1rem', borderRadius: '10px',
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem',
                            textDecoration: 'none', letterSpacing: '0.04em',
                            border: '1px solid var(--border)',
                            transition: 'background 0.2s',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.07)')}
                          onMouseOut={(e)  => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)')}
                        >
                          <MessageSquare size={14} strokeWidth={1.4} />
                          Contact Logistics
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Help / Information ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', gap: '1.25rem' }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                <Info size={24} strokeWidth={1.2} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Need Assistance?</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Our logistics specialists are available to update you on shipping status or documentation requirements.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', gap: '1.25rem' }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                <ExternalLink size={24} strokeWidth={1.2} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Quality Documentation</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Signed COAs and batch reports are typically sent via email once an order reaches "Confirmed" status.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
