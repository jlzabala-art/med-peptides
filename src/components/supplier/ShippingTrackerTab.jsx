import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import ShipmentStepper from '../ui/ShipmentStepper';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AppActionGroup from '../ui/AppActionGroup';
import { useCalendarSync } from '../../hooks/useCalendarSync';

/**
 * ShippingTrackerTab
 * Displays real‑time shipments for a supplier.
 * Each shipment shows a stepper with tooltips that reveal timestamps and notes.
 * Account managers (role includes "account_manager") can advance the status or contact the wholeseller.
 */
export default function ShippingTrackerTab({ supplierId }) {
  const { user, userRole } = useAuth();
  const isAccountManager = userRole?.includes('account_manager');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [confidence, setConfidence] = useState(0);
  const { syncEvent } = useCalendarSync();

  // React Query mutation to fetch AI insight
  const fetchInsight = async () => {
    const response = await axios.post(
      `${process.env.REACT_APP_SUPPLIER_AI_URL}/insights`,
      { supplierId }
    );
    return response.data;
  };
  const { mutate: mutateInsight, isLoading: insightLoading } = useMutation(fetchInsight, {
    onSuccess: (data) => {
      setSuggestion(data.suggestion);
      setConfidence(data.confidence);
      if (currentShipment) {
        syncEvent({
          title: `Shipping Insight: ${currentShipment.trackingNumber || currentShipment.id.slice(0, 8)}`,
          start: new Date().toISOString(),
          allDay: true,
          type: 'shipping',
          description: data.suggestion,
        });
      }
    },
    onError: (error) => {
      console.error('AI insight error', error);
      setSuggestion('Error fetching insight');
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageCursors, setPageCursors] = useState({});
  const PAGE_SIZE = 20;

  const fetchShipments = async (page = 1) => {
    if (!supplierId) return;
    setLoading(true);
    try {
      const baseQ = query(
        collection(db, 'supplier_shipments'),
        where('supplierId', '==', supplierId)
      );

      const countSnap = await getCountFromServer(baseQ);
      const total = countSnap.data().count;
      setTotalPages(Math.ceil(total / PAGE_SIZE));

      let qConstraints = [orderBy('createdAt', 'desc'), limit(PAGE_SIZE)];
      if (page > 1 && pageCursors[page]) {
        qConstraints.push(startAfter(pageCursors[page]));
      }

      const q = query(baseQ, ...qConstraints);
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setShipments(data);

      if (snap.docs.length > 0) {
        setPageCursors((prev) => ({
          ...prev,
          [page + 1]: snap.docs[snap.docs.length - 1],
        }));
      }
    } catch (err) {
      console.error('Error loading shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [supplierId]);

  const statusFlow = ['ordered', 'packed', 'shipped', 'in_transit', 'delivered'];

  // Simple status updater – moves to the next step in the flow
  const advanceStatus = async (shipmentId, currentStatus) => {
    const currentIdx = statusFlow.indexOf(currentStatus);
    if (currentIdx < 0 || currentIdx === statusFlow.length - 1) return; // already final
    const nextStatus = statusFlow[currentIdx + 1];
    const shipmentRef = doc(db, 'supplier_shipments', shipmentId);
    await updateDoc(shipmentRef, {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      [`${nextStatus}At`]: new Date().toISOString(),
    });
  };

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Cargando envíos…</p>;
  }

  if (shipments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <h3>No hay envíos activos</h3>
        <p>Cuando se creen envíos, aparecerán aquí en tiempo real.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Seguimiento de Envíos</h2>
      {shipments.map((s) => {
        const stages = statusFlow.map((stage) => ({
          label: stage.replace('_', ' '),
          status:
            s.status === stage
              ? 'current'
              : statusFlow.indexOf(s.status) > statusFlow.indexOf(stage)
              ? 'completed'
              : 'pending',
          timestamp: s[`${stage}At`] ? new Date(s[`${stage}At`]).toLocaleString() : null,
          notes: s.notes?.[stage] || null,
        }));

        const actions = [];
        if (isAccountManager) {
          actions.push({
            type: 'edit', // uses pencil icon via AppActionGroup config
            onClick: () => advanceStatus(s.id, s.status),
          });
          actions.push({
            type: 'contact',
            onClick: () => alert(`Contactar al mayorista del envío ${s.trackingNumber || s.id}`),
          });
          actions.push({
            type: 'ai',
            label: 'Insight AI',
            onClick: () => {
                setCurrentShipment(s);
                setInsightModalOpen(true);
                // Trigger React Query mutation to fetch AI insight
                mutateInsight();
            },
          });
        }

        return (
          <div
              key={s.id}
              style={{
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ color: '#0f172a' }}>{s.trackingNumber || `Envio ${s.id.slice(0, 8)}`}</strong>
              {actions.length > 0 && <AppActionGroup actions={actions} maxVisible={2} />}
            </div>
            <ShipmentStepper stages={stages} />
                <Card variant="glass" style={{ marginTop: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>🤖</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>AI Insight</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: 9999 }}>{confidence}% confidence</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{suggestion}</p>
                </Card>
          </div>
        );
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => {
              setCurrentPage((p) => p - 1);
              fetchShipments(currentPage - 1);
            }}
            disabled={currentPage === 1 || loading}
            className="btn btn-outline"
          >
            Anterior
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => {
              setCurrentPage((p) => p + 1);
              fetchShipments(currentPage + 1);
            }}
            disabled={currentPage >= totalPages || loading}
            className="btn btn-outline"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
