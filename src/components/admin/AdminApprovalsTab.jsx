import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminPageHeader from './AdminPageHeader';
import { Loader2, ShieldCheck, CheckCircle, XCircle, Bot } from 'lucide-react';
import DataTable from '../ui/DataTable';
import { Card } from '../ui/Card';
import toast from 'react-hot-toast';

export default function AdminApprovalsTab() {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAiId, setRunningAiId] = useState(null);

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
    if (!window.confirm('¿Aprobar este documento?')) return;
    try {
      const collectionName = type === 'Purchase Order' ? 'purchaseOrders' : 'purchaseBills';
      const approvedStatus = type === 'Purchase Order' ? 'open' : 'unpaid';
      await updateDoc(doc(db, collectionName, id), { status: approvedStatus });
      toast.success('Documento aprobado.');
    } catch (e) {
      console.error(e);
      toast.error('Error al aprobar');
    }
  };

  const handleReject = async (id, type) => {
    const reason = window.prompt('Motivo del rechazo:');
    if (!reason) return;
    try {
      const collectionName = type === 'Purchase Order' ? 'purchaseOrders' : 'purchaseBills';
      const rejectedStatus = type === 'Purchase Order' ? 'closed' : 'void';
      await updateDoc(doc(db, collectionName, id), { 
        rejectReason: reason,
        status: rejectedStatus
      });
      toast.success('Documento rechazado.');
    } catch (e) {
      console.error(e);
      toast.error('Error al rechazar');
    }
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

  const columns = [
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (r) => r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '—'
    },
    {
      key: 'poNumber',
      header: 'ID Documento',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.displayNumber}</span>
    },
    {
      key: 'docType',
      header: 'Tipo',
      render: (r) => (
        <span style={{ padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          {r.docType}
        </span>
      )
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
      header: 'Acciones',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {r.docType === 'Bill' && r.linkedPoId && (
            <button 
              onClick={() => handleRunAiAudit(r.id, r.linkedPoId)} 
              disabled={runningAiId === r.id}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.6rem', border: '1px solid #6366f1', background: '#e0e7ff', color: '#4f46e5', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {runningAiId === r.id ? <Loader2 size={14} className="spin" /> : <Bot size={14} />} 
              Auditar
            </button>
          )}
          <button onClick={() => handleApprove(r.id, r.docType)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.6rem', border: 'none', background: '#16a34a', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
            <CheckCircle size={14} /> Aprobar
          </button>
          <button onClick={() => handleReject(r.id, r.docType)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.6rem', border: '1px solid #ef4444', background: '#fff', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
            <XCircle size={14} /> Rechazar
          </button>
        </div>
      )
    }
  ];

  return (
    <>
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Centro de Aprobaciones"
        subtitle="Aprueba transacciones de alto valor antes de que sean procesadas."
        icon={ShieldCheck}
      />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando documentos pendientes...</div>
        ) : (
          <DataTable
            columns={columns}
            data={pendingDocs}
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
