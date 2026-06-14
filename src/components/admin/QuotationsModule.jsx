import Plus from "lucide-react/dist/esm/icons/plus";
import Search from "lucide-react/dist/esm/icons/search";
import FileText from "lucide-react/dist/esm/icons/file-text";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Edit from "lucide-react/dist/esm/icons/edit";
import Send from "lucide-react/dist/esm/icons/send";
import X from "lucide-react/dist/esm/icons/x";
import Link from "lucide-react/dist/esm/icons/link";
import Save from "lucide-react/dist/esm/icons/save";
import Trash from "lucide-react/dist/esm/icons/trash";
import Bot from "lucide-react/dist/esm/icons/bot";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase';
import { collection, addDoc, query, orderBy, limit, doc, updateDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import B2BDocumentsLayout from './B2BDocumentsLayout';
import ZohoPaperPreview from './ZohoPaperPreview';
import B2BOrderBuilderTable from './B2BOrderBuilderTable';
import { useAuth } from '../../context/AuthContext';












import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function QuotationsModule() {
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form State for new Quotation
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [isDropship, setIsDropship] = useState(false);

  const queryClient = useQueryClient();

  // 1. Fetch Quotations with React Query
  const { data: documents = [], isLoading: loading } = useQuery({
    queryKey: ['b2b_quotations'],
    queryFn: async () => {
      const q = query(collection(db, 'b2b_quotations'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: 60000,
    refetchInterval: 60000, // Poll every minute
  });

  // Auto-select first document when loaded if none is selected
  useEffect(() => {
    if (!selectedDoc && documents.length > 0 && !isCreatingNew) {
      setSelectedDoc(documents[0]);
    }
  }, [documents, selectedDoc, isCreatingNew]);

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedDoc(null);
    setCustomerName('');
    setCustomerEmail('');
    setItems([]);
    setNotes('');
    setIsDropship(false);
  };

  const handleSaveDraft = async () => {
    if (!customerName || items.length === 0) return toast.error("Falta cliente o artículos");
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
      isDropship,
      status: 'Draft',
      createdAt: serverTimestamp(),
      createdBy: user?.uid
    };

    try {
      await addDoc(collection(db, 'b2b_quotations'), payload);
      toast.success("Presupuesto guardado exitosamente");
      setIsCreatingNew(false);
      queryClient.invalidateQueries({ queryKey: ['b2b_quotations'] });
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar presupuesto");
    }
  };

  const handleAnalyzeRFQ = async () => {
    const text = window.prompt("Pega aquí el contenido del email o texto del RFQ:");
    if (!text) return;
    setAiLoading(true);
    try {
      const url = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:5001/med-peptides-app/us-central1/analyzeRFQEndpoint'
        : 'https://us-central1-med-peptides-app.cloudfunctions.net/analyzeRFQEndpoint';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqText: text })
      });
      const data = await res.js();
      if (!res.ok) throw new Error(data.error || 'AI Failed');
      const r = data.result;
      setCustomerName(r.customerName || '');
      setCustomerEmail(r.customerEmail || '');
      if (r.items && Array.isArray(r.items)) {
        setItems(r.items.map(i => ({ name: i.name, quantity: i.quantity, rate: 0 })));
      }
      setNotes(r.notes || '');
      setIsCreatingNew(true);
      setSelectedDoc(null);
      toast.success("RFQ Analizado con éxito. Por favor revisa y ajusta los precios.");
    } catch (e) {
      console.error(e);
      toast.error("Error analizando RFQ: " + e.message);
    }
    setAiLoading(false);
  };

  const handleCopyLink = () => {
    if (!selectedDoc) return;
    const url = `${window.location.origin}/b2b-quote/${selectedDoc.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Enlace copiado al portapapeles');
  };

  const markAsAccepted = async () => {
    if (!selectedDoc) return;
    try {
      await updateDoc(doc(db, 'b2b_quotations', selectedDoc.id), { status: 'Accepted' });
      toast.success("Presupuesto marcado como Aceptado");
      queryClient.invalidateQueries({ queryKey: ['b2b_quotations'] });
    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar estado");
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
        isDropship: selectedDoc.isDropship || false,
        status: 'Confirmed',
        linkedDocumentId: selectedDoc.id,
        linkedDocumentNumber: selectedDoc.documentNumber,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      };
      await addDoc(collection(db, 'b2b_sales_orders'), payload);
      toast.success("Sales Order generado con éxito.");
      queryClient.invalidateQueries({ queryKey: ['b2b_quotations'] });
    } catch (e) {
      console.error(e);
      toast.error("Error al generar Sales Order");
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
    if (isCreatingNew) {
      return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Nuevo Presupuesto</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsCreatingNew(false)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleAnalyzeRFQ} disabled={aiLoading} style={{ padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4f46e5', border: '1px solid #6366f1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {aiLoading ? <Loader2 size={16} className="spin" /> : <Bot size={16} />} Analizar RFQ (IA)
              </button>
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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                <input 
                  type="checkbox" 
                  checked={isDropship} 
                  onChange={e => setIsDropship(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                Pedido Dropshipping (Envío directo de Proveedor a Cliente)
              </label>
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
            <button onClick={handleCopyLink} style={{ padding: '0.4rem 0.8rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
              <Link size={14} /> Magic Link
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
    <>
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
    <style>{`
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
    </>
  );
}