import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import B2BDocumentsLayout from './B2BDocumentsLayout';
import ZohoPaperPreview from './ZohoPaperPreview';
import B2BOrderBuilderTable from './B2BOrderBuilderTable';
import { useAuth } from '../../context/AuthContext';
import { Save, Send, Trash, Edit, CheckCircle } from 'lucide-react';

export default function QuotationsModule() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State for new Quotation
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');

  // 1. Subscribe to Quotations
  useEffect(() => {
    const q = query(collection(db, 'b2b_quotations'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(docs);
      if (!selectedDoc && docs.length > 0 && !isCreatingNew) {
        setSelectedDoc(docs[0]);
      }
      setLoading(false);
    });
    return unsub;
  }, [isCreatingNew, selectedDoc]);

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedDoc(null);
    setCustomerName('');
    setCustomerEmail('');
    setItems([]);
    setNotes('');
  };

  const handleSaveDraft = async () => {
    if (!customerName || items.length === 0) return alert("Falta cliente o artículos");
    
    const subTotal = items.reduce((acc, item) => acc + ((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)), 0);
    const taxTotal = subTotal * 0.21; // 21% IVA por defecto (ajustable)
    const grandTotal = subTotal + taxTotal;

    const payload = {
      documentNumber: `EST-${Math.floor(1000 + Math.random() * 9000)}`, // Provisional
      customerName,
      customerEmail,
      items,
      subTotal,
      taxTotal,
      grandTotal,
      notes,
      status: 'Draft',
      createdAt: serverTimestamp(),
      createdBy: user?.uid
    };

    try {
      await addDoc(collection(db, 'b2b_quotations'), payload);
      setIsCreatingNew(false);
    } catch (e) {
      console.error(e);
      alert("Error al guardar presupuesto");
    }
  };

  const markAsAccepted = async () => {
    if (!selectedDoc) return;
    try {
      await updateDoc(doc(db, 'b2b_quotations', selectedDoc.id), { status: 'Accepted' });
      alert("Presupuesto marcado como Aceptado");
    } catch (e) {
      console.error(e);
    }
  };

  const convertToSalesOrder = async () => {
    if (!selectedDoc) return;
    try {
      const payload = {
        documentNumber: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: selectedDoc.customerName,
        customerEmail: selectedDoc.customerEmail,
        items: selectedDoc.items,
        subTotal: selectedDoc.subTotal,
        taxTotal: selectedDoc.taxTotal,
        grandTotal: selectedDoc.grandTotal,
        notes: selectedDoc.notes,
        status: 'Confirmed',
        linkedDocumentId: selectedDoc.id,
        linkedDocumentNumber: selectedDoc.documentNumber,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      };
      await addDoc(collection(db, 'b2b_sales_orders'), payload);
      alert("Sales Order generado con éxito.");
    } catch (e) {
      console.error(e);
      alert("Error al generar Sales Order");
    }
  };

  const renderSidebarItem = (doc) => {
    const statusColors = {
      'Draft': '#94a3b8',
      'Sent': '#3b82f6',
      'Accepted': '#10b981',
      'Declined': '#ef4444'
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
    if (isCreatingNew) {
      return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Nuevo Presupuesto</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsCreatingNew(false)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveDraft} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={16} /> Guardar Borrador
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Nombre del Cliente</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} placeholder="Ej. Dr. Martínez" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Email (Opcional)</label>
              <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} placeholder="Email para enviar" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Detalle de Artículos</label>
            <B2BOrderBuilderTable items={items} onChange={setItems} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Notas del Presupuesto (Términos)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} placeholder="Condiciones de formulación magistral..."></textarea>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Topbar Actions */}
        <div style={{ background: '#fff', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{docData.documentNumber}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <Edit size={14} /> Editar
            </button>
            <button style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <Send size={14} /> Enviar por Email
            </button>
            {docData.status !== 'Accepted' && (
              <button onClick={markAsAccepted} style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <CheckCircle size={14} /> Marcar como Aceptado
              </button>
            )}
            {docData.status === 'Accepted' && (
              <button onClick={convertToSalesOrder} style={{ padding: '0.4rem 0.8rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                Convertir a Sales Order
              </button>
            )}
          </div>
        </div>
        
        {/* A4 Document Wrapper */}
        <ZohoPaperPreview 
          docType="QUOTATION" 
          documentData={{
            ...docData,
            date: docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleDateString() : 'Borrador'
          }} 
        />
      </div>
    );
  };

  return (
    <B2BDocumentsLayout
      title="Quotations"
      documents={documents}
      selectedDoc={isCreatingNew ? null : selectedDoc}
      onSelectDoc={(doc) => { setIsCreatingNew(false); setSelectedDoc(doc); }}
      onCreateNew={handleCreateNew}
      renderContent={renderContent}
      renderSidebarItem={renderSidebarItem}
      loading={loading}
    />
  );
}
