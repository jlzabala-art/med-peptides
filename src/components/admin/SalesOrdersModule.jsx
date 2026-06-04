import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import B2BDocumentsLayout from './B2BDocumentsLayout';
import ZohoPaperPreview from './ZohoPaperPreview';
import { Edit, Send, CheckCircle, Package } from 'lucide-react';

export default function SalesOrdersModule() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Subscribe to Sales Orders
  useEffect(() => {
    const q = query(collection(db, 'b2b_sales_orders'), orderBy('createdAt', 'desc'), limit(50));
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

  const markAsClosed = async () => {
    if (!selectedDoc) return;
    try {
      await updateDoc(doc(db, 'b2b_sales_orders', selectedDoc.id), { status: 'Closed' });
      alert("Pedido marcado como Cerrado");
    } catch (e) {
      console.error(e);
    }
  };

  const convertToInvoice = async () => {
    if (!selectedDoc) return;
    try {
      const payload = {
        documentNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: selectedDoc.customerName,
        customerEmail: selectedDoc.customerEmail,
        items: selectedDoc.items,
        subTotal: selectedDoc.subTotal,
        taxTotal: selectedDoc.taxTotal,
        grandTotal: selectedDoc.grandTotal,
        notes: selectedDoc.notes,
        status: 'Draft',
        linkedDocumentId: selectedDoc.id,
        linkedDocumentNumber: selectedDoc.documentNumber,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'b2b_invoices'), payload);
      await updateDoc(doc(db, 'b2b_sales_orders', selectedDoc.id), { status: 'Invoiced' });
      alert("Factura generada con éxito.");
    } catch (e) {
      console.error(e);
      alert("Error al generar Factura");
    }
  };

  const renderSidebarItem = (doc) => {
    const statusColors = {
      'Confirmed': '#3b82f6',
      'Invoiced': '#10b981',
      'Closed': '#64748b'
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
              <Send size={14} /> Enviar Confirmación
            </button>
            <button style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <Package size={14} /> Marcar Enviado
            </button>
            {docData.status !== 'Closed' && docData.status !== 'Invoiced' && (
              <button onClick={convertToInvoice} style={{ padding: '0.4rem 0.8rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                Generar Factura
              </button>
            )}
            {docData.status !== 'Closed' && (
              <button onClick={markAsClosed} style={{ padding: '0.4rem 0.8rem', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <CheckCircle size={14} /> Cerrar SO
              </button>
            )}
          </div>
        </div>
        
        {/* A4 Document Wrapper */}
        <ZohoPaperPreview 
          docType="SALES ORDER" 
          documentData={{
            ...docData,
            date: docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleDateString() : 'Confirmado'
          }} 
        />
      </div>
    );
  };

  return (
    <B2BDocumentsLayout
      title="Sales Orders"
      documents={documents}
      selectedDoc={selectedDoc}
      onSelectDoc={setSelectedDoc}
      onCreateNew={() => alert("Los Sales Orders se generan automáticamente convirtiendo un Presupuesto (Quotation) aceptado.")}
      renderContent={renderContent}
      renderSidebarItem={renderSidebarItem}
      loading={loading}
    />
  );
}
