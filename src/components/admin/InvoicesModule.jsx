import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import B2BDocumentsLayout from './B2BDocumentsLayout';
import ZohoPaperPreview from './ZohoPaperPreview';
import { Send, DollarSign, Download } from 'lucide-react';

export default function InvoicesModule() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Subscribe to Invoices
  useEffect(() => {
    const q = query(collection(db, 'b2b_invoices'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(docs);
      if (!selectedDoc && docs.length > 0) {
        setSelectedDoc(docs[0]);
      }
      setLoading(false);
    });
    return unsub;
  }, [selectedDoc]);

  const markAsPaid = async () => {
    if (!selectedDoc) return;
    try {
      await updateDoc(doc(db, 'b2b_invoices', selectedDoc.id), { status: 'Paid' });
      alert("Factura marcada como Pagada");
    } catch (e) {
      console.error(e);
    }
  };

  const renderSidebarItem = (doc) => {
    const statusColors = {
      'Draft': '#94a3b8',
      'Sent': '#3b82f6',
      'Paid': '#10b981',
      'Overdue': '#ef4444'
    };
    
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{doc.customerName}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>€{(doc.grandTotal || 0).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.documentNumber}</span>
          <span style={{ 
            fontSize: '0.65rem', 
            background: statusColors[doc.status] || '#ccc', 
            color: '#fff', 
            padding: '0.1rem 0.4rem', 
            borderRadius: '4px',
            fontWeight: 600
          }}>
            {doc.status}
          </span>
        </div>
      </div>
    );
  };

  const renderContent = (docData) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Topbar Actions */}
        <div style={{ background: '#fff', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{docData.documentNumber}</span>
            {docData.linkedDocumentId && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                Ref: {docData.linkedDocumentNumber}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <Download size={14} /> PDF
            </button>
            <button style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <Send size={14} /> Enviar Factura
            </button>
            {docData.status !== 'Paid' && (
              <button onClick={markAsPaid} style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <DollarSign size={14} /> Registrar Pago
              </button>
            )}
          </div>
        </div>
        
        {/* A4 Document Wrapper */}
        <ZohoPaperPreview 
          docType="INVOICE" 
          documentData={{
            ...docData,
            date: docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleDateString() : 'Emitida'
          }} 
        />
      </div>
    );
  };

  return (
    <B2BDocumentsLayout
      title="Invoices"
      documents={documents}
      selectedDoc={selectedDoc}
      onSelectDoc={setSelectedDoc}
      onCreateNew={() => alert("Las Facturas se generan automáticamente convirtiendo un Sales Order o Presupuesto.")}
      renderContent={renderContent}
      renderSidebarItem={renderSidebarItem}
      loading={loading}
    />
  );
}
