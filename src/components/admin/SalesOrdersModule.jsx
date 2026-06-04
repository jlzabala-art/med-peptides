import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
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

      // 3. Decrement Inventory ONLY if it's not a dropship order
      if (!selectedDoc.isDropship && selectedDoc.items && selectedDoc.items.length > 0) {
        for (const item of selectedDoc.items) {
          const itemName = item.name || item.itemName;
          if (!itemName) continue;
          
          const q = query(collection(db, 'products'), where('name', '==', itemName));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const productDoc = snap.docs[0];
            await updateDoc(doc(db, 'products', productDoc.id), {
              stock: increment(-parseInt(item.quantity || 1))
            });
          }
        }
      }

      alert(selectedDoc.isDropship ? "Factura generada con éxito (Stock no modificado por ser Dropship)." : "Factura generada con éxito y stock actualizado.");
    } catch (e) {
      console.error(e);
      alert("Error al generar Factura");
    }
  };

  const generateDropshipPO = async () => {
    if (!selectedDoc) return;
    const supplier = window.prompt("Introduce el nombre del proveedor para este pedido Dropship:");
    if (!supplier) return;
    
    try {
      const items = selectedDoc.items.map(i => ({
        itemName: i.name || i.itemName,
        quantity: i.quantity || 1,
        unit: i.unit || 'vial',
        unitPrice: 0 // Supplier price unknown at this step, admin must edit
      }));

      const payload = {
        supplierName: supplier,
        poNumber: `PO-DROP-${Date.now().toString().slice(-6)}`,
        status: 'open',
        items,
        totalAmount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        linkedSalesOrderId: selectedDoc.id,
        notes: `Envío Directo a Cliente: ${selectedDoc.customerName}`
      };
      
      await addDoc(collection(db, 'purchaseOrders'), payload);
      await updateDoc(doc(db, 'b2b_sales_orders', selectedDoc.id), { poGenerated: true });
      alert("Purchase Order (Dropship) generado con éxito.");
    } catch (e) {
      console.error(e);
      alert("Error al generar PO.");
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
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            {doc.customerName}
            {doc.isDropship && <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '0.1rem 0.3rem', background: '#fef08a', color: '#854d0e', borderRadius: '4px' }}>DROPSHIP</span>}
          </span>
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
            {docData.isDropship && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                DROPSHIP
              </span>
            )}
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
            {docData.isDropship && !docData.poGenerated && docData.status !== 'Closed' && (
              <button onClick={generateDropshipPO} style={{ padding: '0.4rem 0.8rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                Generar PO (Dropship)
              </button>
            )}
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
