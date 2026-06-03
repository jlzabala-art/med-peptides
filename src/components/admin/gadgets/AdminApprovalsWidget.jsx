import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Check, X, ShieldAlert, Clock, AlertOctagon } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../context/AuthContext';

export default function AdminApprovalsWidget() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'financial_approvals'),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApprovals(list);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId, type, data, action) => {
    try {
      const approvalRef = doc(db, 'financial_approvals', approvalId);
      await updateDoc(approvalRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        resolvedBy: currentUser?.email || 'cfo@atlas.com',
        resolvedAt: new Date().toISOString()
      });

      if (action === 'approve') {
        if (type === 'cost_update') {
          const productRef = doc(db, 'products', data.productId);
          await updateDoc(productRef, data.updates);
        } else if (type === 'payout_auth') {
          if (data.payoutId) {
             const payoutRef = doc(db, 'payouts', data.payoutId);
             await updateDoc(payoutRef, { status: 'paid', paidAt: new Date().toISOString() });
          }
        }
      }

      toast.success(`Transaction ${action}d successfully.`);
      setApprovals(prev => prev.filter(a => a.id !== approvalId));
    } catch (err) {
      console.error('Error handling approval action:', err);
      toast.error('Failed to process approval.');
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--color-border)', borderRadius: '9999px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ height: '1rem', backgroundColor: 'var(--color-border)', borderRadius: '0.25rem', width: '12rem' }} />
          <div style={{ height: '0.75rem', backgroundColor: 'var(--color-border)', borderRadius: '0.25rem', width: '8rem' }} />
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.05)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--color-error, #ef4444)' }} />
      
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
          <AlertOctagon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-error, #dc2626)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-error-dark, #7f1d1d)', margin: 0 }}>Action Required: CFO Approvals</h3>
          <p style={{ color: 'var(--color-error, #b91c1c)', fontSize: '0.875rem', fontWeight: '500', margin: '0.25rem 0 0' }}>
            There are <strong style={{ color: 'var(--color-error-dark, #7f1d1d)' }}>{approvals.length}</strong> transaction(s) pending your financial authorization.
          </p>
        </div>
      </div>
      
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
        {approvals.map(app => (
          <div key={app.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
                  {app.type === 'cost_update' ? 'Margin Change' : 'High-Value Payout'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock style={{ width: '0.875rem', height: '0.875rem' }} /> 
                  {new Date(app.createdAt).toLocaleString()}
                </span>
              </div>
              
              {app.type === 'cost_update' && (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{app.requestedBy}</strong> requested to change costs for <strong style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{app.data.productName}</strong>. 
                  <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-bg-secondary)', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}>
                    <span style={{ color: 'var(--color-error, #ef4444)', textDecoration: 'line-through' }}>${app.data.oldCost}</span> 
                    <span style={{ color: 'var(--color-text-tertiary)' }}>→</span> 
                    <span style={{ color: 'var(--color-success, #059669)', fontWeight: 'bold', fontSize: '1rem' }}>${app.data.updates.costPrice}</span>
                  </div>
                </div>
              )}

              {app.type === 'payout_auth' && (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{app.requestedBy}</strong> requested a mass payout of 
                  <span style={{ display: 'inline-flex', margin: '0 0.5rem', alignItems: 'center', backgroundColor: 'var(--color-success-bg, #ecfdf5)', color: 'var(--color-success-text, #047857)', fontWeight: '900', fontSize: '1.125rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    ${app.data.amount}
                  </span> 
                  to <strong style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{app.data.recipientName}</strong>.
                </div>
              )}
              
              {app.reason && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-tertiary)', backgroundColor: 'var(--color-bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', borderLeft: '2px solid var(--color-border)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>Reason:</span>
                  <span style={{ fontStyle: 'italic' }}>"{app.reason}"</span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <button 
                onClick={() => handleAction(app.id, app.type, app.data, 'reject')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-error, #dc2626)', backgroundColor: 'var(--color-error-bg, #fef2f2)', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
              >
                <X style={{ width: '1rem', height: '1rem' }} /> 
                Reject
              </button>
              <button 
                onClick={() => handleAction(app.id, app.type, app.data, 'approve')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold', color: 'white', backgroundColor: 'var(--color-success, #059669)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
              >
                <Check style={{ width: '1rem', height: '1rem' }} /> 
                Authorize
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
