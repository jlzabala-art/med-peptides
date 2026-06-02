import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import StatusChip from '../ui/StatusChip';
import Spinner from '../ui/Spinner';
import { Check, X, FileText, Sparkles } from 'lucide-react';

export default function PatientRecommendationsTab({ userId, acceptRecommendation }) {
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading, isError } = useQuery({
    queryKey: ['patientRecommendations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, 'recommendations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: async ({ recId, status }) => {
      const recRef = doc(db, 'recommendations', recId);
      await updateDoc(recRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return { recId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['patientRecommendations', userId]);
      if (data.status === 'accepted' && acceptRecommendation) {
        // find the full object to pass back
        const rec = recommendations.find(r => r.id === data.recId);
        if (rec) acceptRecommendation(rec);
      }
    }
  });

  if (isLoading) return <Spinner text="Loading recommendations..." />;
  if (isError) return <div style={{ color: 'red', padding: '1rem' }}>Failed to load recommendations.</div>;

  const handleAccept = (rec) => {
    mutation.mutate({ recId: rec.id, status: 'accepted' });
  };

  const handleDecline = (rec) => {
    if (window.confirm('Are you sure you want to decline this recommendation?')) {
      mutation.mutate({ recId: rec.id, status: 'rejected' });
    }
  };

  const columns = [
    {
      header: 'Protocol / Items',
      key: 'title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.title || row.protocolName || 'Custom Recommendation'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {Array.isArray(row.peptides) ? row.peptides.join(', ') : row.peptides}
          </div>
        </div>
      )
    },
    {
      header: 'Prescribed By',
      key: 'doctorName',
      render: (row) => row.doctorName || 'Physician'
    },
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        let color = 'warning';
        if (row.status === 'accepted') color = 'success';
        if (row.status === 'rejected') color = 'error';
        return <StatusChip status={row.status || 'pending'} variant={color} />;
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => {
        if (row.status !== 'pending' && row.status) return null;
        return (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                const itemNames = Array.isArray(row.peptides) ? row.peptides.join(', ') : row.peptides;
                window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                  detail: {
                    message: `Can you explain the recommendation "${row.title || row.protocolName || 'Custom Recommendation'}" from ${row.doctorName || 'my doctor'}? It includes: ${itemNames}. How will this help me?`,
                    patientContext: true,
                    autoSend: true
                  }
                }));
              }}
              title="Ask Atlas about this recommendation"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.4rem 0.75rem', borderRadius: '6px',
                border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Sparkles size={14} /> Ask Atlas
            </button>
            <button
              onClick={() => handleAccept(row)}
              disabled={mutation.isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.4rem 0.75rem', borderRadius: '6px',
                border: 'none', background: 'var(--color-success)', color: 'white',
                fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'
              }}
            >
              <Check size={14} /> Accept
            </button>
            <button
              onClick={() => handleDecline(row)}
              disabled={mutation.isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.4rem 0.75rem', borderRadius: '6px',
                border: '1px solid #e2e8f0', background: 'white', color: 'var(--color-text-secondary)',
                fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'
              }}
            >
              <X size={14} /> Decline
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Doctor Recommendations</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Review and accept custom protocols recommended by your physician.</p>
      </div>
      <Card noPadding>
        <DataTable columns={columns} data={recommendations} emptyMessage="You don't have any pending recommendations." />
      </Card>
    </div>
  );
}
