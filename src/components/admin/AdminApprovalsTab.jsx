"use client";

import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Bot from "lucide-react/dist/esm/icons/bot";
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';
import DataTable from '../ui/DataTable';
import AppActionGroup from '../ui/AppActionGroup';
import { Card } from '../ui/Card';
import toast from 'react-hot-toast';
import notifier from '../../services/NotificationService';

export default function AdminApprovalsTab({ isSubTab }) {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAiId, setRunningAiId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Escuchar POs y Bills pendientes de aprobación
    const q1 = query(
      collection(db, 'purchaseOrders'),
      where('status', '==', 'pending_approval')
    );
    const q2 = query(
      collection(db, 'purchaseBills'),
      where('status', '==', 'pending_approval')
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      setPendingDocs(prev => {
        const others = prev.filter(p => p.docType !== 'Purchase Order');
        const docs = snap.docs.map(d => ({
          id: d.id,
          docType: 'Purchase Order',
          displayNumber: d.data().poNumber,
          ...d.data()
        }));
        return [...others, ...docs];
      });
      setLoading(false);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      setPendingDocs(prev => {
        const others = prev.filter(p => p.docType !== 'Bill');
        const docs = snap.docs.map(d => ({
          id: d.id,
          docType: 'Bill',
          displayNumber: d.data().billNumber,
          ...d.data()
        }));
        return [...others, ...docs];
      });
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleApprove = async (id, type) => {
    notifier.confirmCritical('¿Aprobar este documento?', async () => {
      try {
        const collectionName = type === 'Purchase Order' ? 'purchaseOrders' : 'purchaseBills';
        const approvedStatus = type === 'Purchase Order' ? 'open' : 'unpaid';
        await updateDoc(doc(db, collectionName, id), { status: approvedStatus });
        toast.success('Documento aprobado.');
      } catch (e) {
        console.error(e);
        toast.error('Error al aprobar');
      }
    });
  };

  const handleReject = (id, type) => {
    let reason = '';
    notifier.confirmCritical(
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Rejection reason:</p>
        <textarea
          autoFocus
          rows={3}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', resize: 'vertical' }}
          placeholder="Enter rejection reason…"
          onChange={(e) => { reason = e.target.value; }}
        />
      </div>,
      async () => {
        if (!reason.trim()) { toast.error('Please enter a rejection reason.'); return; }
        try {
          const collectionName = type === 'Purchase Order' ? 'purchaseOrders' : 'purchaseBills';
          const rejectedStatus = type === 'Purchase Order' ? 'closed' : 'void';
          await updateDoc(doc(db, collectionName, id), {
            rejectReason: reason.trim(),
            status: rejectedStatus
          });
          toast.success('Documento rechazado.');
        } catch (e) {
          console.error(e);
          toast.error('Error al rechazar');
        }
      }
    );
  };

  const handleRunAiAudit = async (billId, poId) => {
    if (!poId) {
      toast.error("Este Bill no tiene una PO asociada (linkedPoId).");
      return;
    }
    setRunningAiId(billId);
    try {
      const url = window.location.hostname === 'localhost' 
        ? 'http://127.0.0.1:5001/med-peptides-app/us-central1/threeWayMatching'
        : 'https://us-central1-med-peptides-app.cloudfunctions.net/threeWayMatching';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId, billId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run AI Audit');
      toast.success(`AI Audit completado con Score: ${data.result.confidenceScore}%`);
    } catch (e) {
      console.error(e);
      toast.error('Error al ejecutar AI Audit: ' + e.message);
    }
    setRunningAiId(null);
  };

  const filteredDocs = useMemo(() => {
    if (!searchTerm) return pendingDocs;
    const term = searchTerm.toLowerCase();
    return pendingDocs.filter(r =>
      (r.displayNumber || '').toLowerCase().includes(term) ||
      (r.supplierName || '').toLowerCase().includes(term) ||
      (r.docType || '').toLowerCase().includes(term)
    );
  }, [pendingDocs, searchTerm]);

  const columns = [
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (r) => r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '—'
    },
    {
      key: 'poNumber',
      header: 'ID Documento',
      render: (r) => <CopyableId value={r.displayNumber || r.id} />
    },
    {
      key: 'docType',
      header: 'Tipo',
      render: (r) => <StatusChip status={r.docType === 'Purchase Order' ? 'po_created' : 'pending'} label={r.docType} />
    },
    {
      key: 'supplierName',
      header: 'Proveedor / Cliente',
      render: (r) => r.supplierName
    },
    {
      key: 'totalAmount',
      header: 'Importe Total',
      render: (r) => <span style={{ fontWeight: 700, color: '#ef4444' }}>€{Number(r.totalAmount || 0).toFixed(2)}</span>
    },
    {
      key: 'aiMatch',
      header: 'AI Audit',
      render: (r) => {
        if (r.docType !== 'Bill') return '—';
        if (r.aiMatchScore !== undefined) {
          return (
            <span style={{ color: r.aiMatchScore >= 90 ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.8rem' }}>
              {r.aiMatchScore}% 
              {r.aiMatchRecommendation && ` (${r.aiMatchRecommendation})`}
            </span>
          );
        }
        return <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No run</span>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => {
        const actions = [];
        if (r.docType === 'Bill' && r.linkedPoId) {
          actions.push({
            type: 'audit_ai',
            onClick: () => handleRunAiAudit(r.id, r.linkedPoId)
          });
        }
        actions.push({
          type: 'approve',
          onClick: () => handleApprove(r.id, r.docType)
        });
        actions.push({
          type: 'reject',
          onClick: () => handleReject(r.id, r.docType)
        });
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            {runningAiId === r.id ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Auditing...</span>
            ) : (
              <AppActionGroup actions={actions} />
            )}
          </div>
        );
      }
    }
  ];

  return (
    <>
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {!isSubTab && (
        <PageHeader
          title="Centro de Aprobaciones"
          subtitle="Aprueba transacciones de alto valor antes de que sean procesadas."
          icon={ShieldCheck}
        />
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by supplier, document number..."
          resultCount={loading ? undefined : filteredDocs.length}
          namespace="admin-approvals"
          size="lg"
        />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando documentos pendientes...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredDocs}
            keyField="id"
            emptyMessage="No hay documentos pendientes de aprobación."
          />
        )}
      </Card>
    </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}