"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import { useAuth } from '../../context/AuthContext';
import FileText from "lucide-react/dist/esm/icons/file-text";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import format from 'date-fns/format';
import SupplierRFQModal from './SupplierRFQModal';

export default function SupplierRFQsTab() {
  const { userProfile } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState(null);

  const fetchRfqs = async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    try {
      // Find RFQs directed to this supplier
      const q = query(
        collection(db, 'purchase_rfqs'),
        where('supplierId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRfqs(data);
    } catch (err) {
      console.error('Error fetching supplier RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [userProfile?.uid]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending_supplier':
        return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Needs Action</span>;
      case 'supplier_quoted':
        return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Quoted, Waiting Admin</span>;
      case 'accepted':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Accepted (PO Created)</span>;
      case 'rejected':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12}/> Rejected</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Quotation Requests</h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Review and respond to Admin purchase requests.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>
        ) : rfqs.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>No quotation requests found</h3>
            <p>You have no pending requests from Admin.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>Request ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>Items</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>Value (Admin Proposed)</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map(rfq => (
                  <tr key={rfq.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{rfq.prfqId}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{rfq.createdAt?.seconds ? format(new Date(rfq.createdAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{rfq.items?.reduce((sum, item) => sum + item.qty, 0)} items</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>${rfq.totals?.subtotal?.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(rfq.status)}</td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedRfq(rfq)}
                      >
                        {rfq.status === 'pending_supplier' ? 'Review & Respond' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRfq && (
        <SupplierRFQModal 
          rfq={selectedRfq}
          onClose={() => setSelectedRfq(null)}
          onSuccess={() => {
            setSelectedRfq(null);
            fetchRfqs();
          }}
        />
      )}
    </div>
  );
}
