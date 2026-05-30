import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ShipmentStepper from '../ui/ShipmentStepper';
import InsightCard from '../ui/InsightCard';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AppActionGroup from '../ui/AppActionGroup';


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
    },
    onError: (error) => {
      console.error('AI insight error', error);
      setSuggestion('Error fetching insight');
    },
  });
  // Listen to Firestore in real time
  useEffect(() => {
    if (!supplierId) return;
    const q = query(
      collection(db, 'supplier_shipments'),
      where('supplierId', '==', supplierId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setShipments(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading shipments:', err);
        setLoading(false);
      }
    );
    return () => unsub();
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
              {suggestion && currentShipment?.id === s.id && (
                <InsightCard suggestion={suggestion} confidence={confidence} />
              )}
          </div>
        );
      })}
    </div>
  );
}
