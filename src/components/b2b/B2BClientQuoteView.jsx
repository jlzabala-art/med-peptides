import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import ZohoPaperPreview from '../admin/ZohoPaperPreview'; // We can reuse the A4 rendering

export default function B2BClientQuoteView() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const docRef = doc(db, 'b2b_quotations', quoteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuote({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Presupuesto no encontrado o enlace inválido.');
        }
      } catch (err) {
        setError('Error al cargar el presupuesto.');
      }
      setLoading(false);
    };
    fetchQuote();
  }, [quoteId]);

  const handleAction = async (action) => {
    if (!window.confirm(`¿Estás seguro de que quieres ${action === 'Accepted' ? 'Aceptar' : 'Rechazar'} este presupuesto?`)) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'b2b_quotations', quoteId), { status: action });
      setQuote(prev => ({ ...prev, status: action }));
    } catch (err) {
      alert('Error al actualizar el estado.');
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <Loader2 className="spin" size={32} color="#94a3b8" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem' }}>{error}</h2>
          <p style={{ color: '#64748b' }}>Por favor, contacta con tu asesor comercial.</p>
        </div>
      </div>
    );
  }

  const isPending = quote.status === 'Draft' || quote.status === 'Sent';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Client Header */}
      <header className="portal-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Revisión de Presupuesto</h1>
          <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>{quote.documentNumber}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {quote.status === 'Accepted' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700, padding: '0.5rem 1rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <CheckCircle size={20} /> PRESUPUESTO ACEPTADO
            </span>
          )}
          {quote.status === 'Declined' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700, padding: '0.5rem 1rem', background: '#fef2f2', borderRadius: '8px' }}>
              <XCircle size={20} /> PRESUPUESTO RECHAZADO
            </span>
          )}

          {isPending && (
            <>
              <button 
                onClick={() => handleAction('Declined')}
                disabled={processing}
                style={{ padding: '0.6rem 1.2rem', background: '#fff', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Rechazar
              </button>
              <button 
                onClick={() => handleAction('Accepted')}
                disabled={processing}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                {processing ? <Loader2 className="spin" size={16} /> : <CheckCircle size={18} />}
                Aceptar Presupuesto
              </button>
            </>
          )}
        </div>
      </header>

      {/* Document View */}
      <main className="portal-main-grid">
        <div className="portal-card" style={{ width: '100%' }}>
          <ZohoPaperPreview 
            docType="QUOTATION" 
            documentData={{
              ...quote,
              date: quote.createdAt?.toDate ? quote.createdAt.toDate().toLocaleDateString() : 'Borrador'
            }} 
          />
        </div>
      </main>
    </div>
  );
}
