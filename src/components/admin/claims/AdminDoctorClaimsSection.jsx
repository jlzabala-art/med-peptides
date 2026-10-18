"use client";

import React, { useState, useEffect } from 'react';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import DataTable from '@/components/ui/DataTable';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function AdminDoctorClaimsSection({ highlightClaimId = null }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    // Listen to pending doctor claims in Firestore
    const q = query(
      collection(db, 'doctor_claims'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        // Sort newest first
        items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setClaims(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not listen to doctor claims:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAuthorizeClaim = async (claim, action = 'approve') => {
    setProcessingId(claim.id);
    try {
      const res = await fetch('/api/admin/authorize-doctor-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: claim.id,
          action
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update physician authorization.');
      }

      if (action === 'approve') {
        toast.success(`Physician ${claim.doctorName || ''} authorized! Confirmation dispatched via WhatsApp.`);
      } else {
        toast.info(`Claim for ${claim.doctorName || ''} has been rejected.`);
      }
    } catch (err) {
      console.error('Error in claim action:', err);
      toast.error(err.message || 'Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      key: 'createdAt',
      header: 'Received',
      width: '12%',
      render: (r) => (
        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      )
    },
    {
      key: 'doctorName',
      header: 'Physician & Practice',
      width: '28%',
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
              {r.doctorName || 'Prescribing Physician'}
            </span>
            {highlightClaimId && r.id === highlightClaimId && (
              <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', fontSize: '0.62rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                Target Request ★
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            {r.clinic || 'Specialized Clinic'} ·{' '}
            <a
              href={`https://www.atlashealth-services.com/dr/${r.doctorSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              /dr/{r.doctorSlug} <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )
    },
    {
      key: 'licenseProvided',
      header: 'Medical License / DHA',
      width: '20%',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 650, color: '#003666', fontSize: '0.80rem' }}>
            {r.licenseProvided || '—'}
          </span>
          {r.email && (
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {r.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'WhatsApp / Mobile',
      width: '16%',
      render: (r) => {
        if (!r.phone) return <span style={{ color: '#94a3b8' }}>—</span>;
        const cleanDigits = r.phone.replace(/[^0-9]/g, '');
        return (
          <a
            href={`https://wa.me/${cleanDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#16a34a',
              fontWeight: 600,
              fontSize: '0.78rem',
              textDecoration: 'none'
            }}
            title="Open WhatsApp chat with physician"
          >
            <MessageCircle size={13} />
            <span>{r.phone}</span>
          </a>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '24%',
      align: 'right',
      render: (r) => {
        const isBusy = processingId === r.id;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleAuthorizeClaim(r, 'approve')}
              style={{
                height: '30px',
                padding: '0 10px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: isBusy ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              title="Authorize physician and send access WhatsApp"
            >
              {isBusy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              <span>Authorize</span>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleAuthorizeClaim(r, 'reject')}
              style={{
                height: '30px',
                padding: '0 8px',
                background: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: isBusy ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Reject request"
            >
              <XCircle size={13} />
              <span>Reject</span>
            </button>
          </div>
        );
      }
    }
  ];

  if (!loading && claims.length === 0) {
    return null; // Keep clean when no physician claims are pending
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          padding: '4px 2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Stethoscope size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Pending Physician Verifications
          </h3>
          <span
            style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              padding: '1px 8px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            {claims.length} pending
          </span>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid #bae6fd', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.06)' }}>
        <DataTable
          columns={columns}
          data={claims}
          keyField="id"
          emptyMessage="No pending physician verification requests."
        />
      </Card>
    </div>
  );
}
