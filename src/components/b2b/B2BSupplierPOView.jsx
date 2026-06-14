import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import FileText from "lucide-react/dist/esm/icons/file-text";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card } from '../ui';





import ZohoPaperPreview from '../admin/ZohoPaperPreview';

export default function B2BSupplierPOView() {
  const { poId } = useParams();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const docRef = doc(db, 'purchaseOrders', poId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPo({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Purchase Order no encontrada.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar la PO.');
      }
      setLoading(false);
    };
    fetchPO();
  }, [poId]);

  const handleSubmitBill = async () => {
    if (!billNumber || !billAmount) {
      alert("Por favor indica el número de factura y el monto total.");
      return;
    }
    setActionLoading(true);
    try {
      // Simplification: We update the PO status and save the bill info inside it for now.
      // In a real flow, we might create a new doc in 'b2b_bills' or 'purchaseBills'
      await updateDoc(doc(db, 'purchaseOrders', poId), {
        status: 'billed',
        supplierBillNumber: billNumber,
        supplierBillAmount: parseFloat(billAmount),
        billedAt: new Date()
      });
      setPo(prev => ({ ...prev, status: 'billed', supplierBillNumber: billNumber }));
    } catch (err) {
      console.error(err);
      alert("Error al subir la factura.");
    }
    setActionLoading(false);
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spin" /></div>;
  if (error || !po) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <h2 style={{ color: '#b91c1c' }}>Acceso Denegado</h2>
        <p>{error}</p>
      </Card>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      <header className="portal-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Portal de Proveedor</h1>
          <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>Orden de Compra: {po.poNumber}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {po.status === 'billed' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700, padding: '0.5rem 1rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <CheckCircle size={20} /> FACTURA RECIBIDA
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, padding: '0.5rem 1rem', background: '#fef3c7', borderRadius: '8px' }}>
              <ShieldCheck size={20} /> ESPERANDO FACTURA
            </span>
          )}
        </div>
      </header>

      <main className="portal-main-grid">
        <div className="portal-card" style={{ flex: 2 }}>
          <ZohoPaperPreview 
            docType="PO" 
            documentData={{
              ...po,
              documentNumber: po.poNumber,
              customerName: po.supplierName,
              date: po.createdAt?.toDate ? po.createdAt.toDate().toLocaleDateString() : 'Borrador'
            }} 
          />
        </div>

        <div style={{ flex: 1 }}>
          <Card style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#3b82f6" /> Subir Factura (Bill)
            </h3>
            {po.status === 'billed' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ color: '#10b981', margin: '0 0 0.5rem' }}>¡Factura Procesada!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nº Ref: {po.supplierBillNumber}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Por favor, introduce los detalles de tu factura para proceder al pago.</p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Número de Factura</label>
                  <input type="text" value={billNumber} onChange={e => setBillNumber(e.target.value)} placeholder="Ej. INV-2023-001" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Importe Total</label>
                  <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <button 
                  onClick={handleSubmitBill}
                  disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, marginTop: '1rem', cursor: 'pointer' }}
                >
                  {actionLoading ? <Loader2 size={18} className="spin" /> : <UploadCloud size={18} />}
                  Enviar Factura
                </button>
              </div>
            )}
          </Card>
        </div>
      </main>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}