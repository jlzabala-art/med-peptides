import React, { useState, useEffect } from 'react';
import PayoutManagerWidget from '../gadgets/PayoutManagerWidget';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, FileWarning, CheckCircle, CreditCard, Download } from 'lucide-react';
import { usePreferences } from '../../../context/PreferencesContext';
import { exportToCSV } from '../../../utils/exportUtils';
import SkeletonLoader from '../../ui/SkeletonLoader';
import AnimatedNumber from '../../ui/AnimatedNumber';

export default function FinancePayables({ dashboardData }) {
  const { formatCurrency, density } = usePreferences();
  const bills = dashboardData?.nplabData?.bills || [];
  const totalPaid = dashboardData?.nplabData?.totalPaid || 0;
  const [billNotes, setBillNotes] = useState({});

  const handleNoteChange = (billId, val) => {
    setBillNotes(prev => ({...prev, [billId]: val}));
  };

  const [complianceAlerts, setComplianceAlerts] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'financial_approvals'),
      where('type', '==', 'compliance_audit'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((docSnap) => {
        alerts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setComplianceAlerts(alerts);
    });

    return () => unsubscribe();
  }, []);

  const handleOverrideBlock = async (alertId, payoutId) => {
    try {
      const alertRef = doc(db, 'financial_approvals', alertId);
      await updateDoc(alertRef, {
        status: 'approved',
        resolved_at: new Date().toISOString()
      });

      const payoutRef = doc(db, 'payouts', payoutId);
      await updateDoc(payoutRef, {
        status: 'pending', 
        compliance_override_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error overriding compliance block:", err);
    }
  };

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Compliance Audit Section */}
      <div className="glass-card-premium" style={{ borderTop: '4px solid var(--error)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <ShieldAlert style={{ width: '24px', height: '24px', color: 'var(--error)' }} />
            Automated Tax & Compliance Auditing
          </h3>
          
          {complianceAlerts.length === 0 ? (
            <div className="finance-alert-box">
              <div style={{ background: 'rgba(30, 142, 62, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                <CheckCircle style={{ width: '24px', height: '24px' }} />
              </div>
              <p style={{ margin: 0, fontWeight: '600' }}>All payouts have matched invoices. Full compliance verified.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complianceAlerts.map(alert => (
                <div key={alert.id} className="finance-alert-danger" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: '1 1 auto' }}>
                    <div style={{ background: 'rgba(217, 48, 37, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                      <FileWarning style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '800', fontSize: '1.125rem', margin: '0 0 0.25rem 0' }}>Missing Invoice: {alert.payee_name}</h4>
                      <p style={{ fontSize: '0.875rem', margin: '0 0 0.75rem 0', opacity: 0.9 }}>{alert.reason}</p>
                      <div style={{ display: 'inline-block', background: 'rgba(217, 48, 37, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
                        Payout Blocked
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(217, 48, 37, 0.2)', paddingTop: '1rem', width: '100%' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                      {formatCurrency(alert.amount)}
                    </div>
                    <button 
                      onClick={() => handleOverrideBlock(alert.id, alert.payout_id)}
                      className="gcp-btn-secondary" style={{ marginLeft: 'auto', background: 'white' }}
                    >
                      CFO Override
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="finance-grid" style={{ gap: '2rem' }}>
        <div style={{ minWidth: 0 }}>
          <PayoutManagerWidget />
        </div>
        
        <div className="admin-table-container" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                Supplier Bills (NPLAB)
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Billed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {!dashboardData ? <SkeletonLoader width="120px" height="32px" /> : <AnimatedNumber value={totalPaid} isCurrency={true} />}
                </div>
              </div>
              <button 
                onClick={() => exportToCSV(bills, 'supplier_bills', [
                  { header: 'Bill #', accessor: 'bill_number' },
                  { header: 'Date', accessor: 'date' },
                  { header: 'Total USD', accessor: 'total' },
                  { header: 'Status', accessor: 'status' }
                ])}
                className="gcp-btn-secondary"
                title="Export to CSV"
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Export
              </button>
            </div>
          </div>
          
          <div style={{ padding: '0', flex: 1 }}>
            {!dashboardData ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <SkeletonLoader height="60px" />
                <SkeletonLoader height="60px" />
                <SkeletonLoader height="60px" />
              </div>
            ) : bills.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                <CreditCard style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>No recent bills found for NPLAB.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Bill #</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ width: '33%' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{bill.bill_number}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{bill.date}</td>
                        <td style={{ fontWeight: '800', textAlign: 'right', color: 'var(--primary)' }}>{formatCurrency(bill.total)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`admin-badge ${bill.status === 'paid' ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                            {bill.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={billNotes[bill.bill_number] || ''}
                            onChange={(e) => handleNoteChange(bill.bill_number, e.target.value)}
                            placeholder="Add note..."
                            className="admin-premium-input"
                            style={{ width: '100%' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}