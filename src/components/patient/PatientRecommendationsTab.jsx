import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPatientRecommendations, updateRecommendationStatus } from '../../services/patientTabsService';
import { useToast } from '../../hooks/useToast';
import notifier from '../../services/NotificationService';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import { StatusChip } from '../ui';
import Spinner from '../ui/Spinner';
import AppActionGroup from '../ui/AppActionGroup';

export default function PatientRecommendationsTab({ userId, acceptRecommendation }) {
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading, isError } = useQuery({
    queryKey: ['patientRecommendations', userId],
    queryFn: () => fetchPatientRecommendations(userId),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: ({ recId, status }) => updateRecommendationStatus(recId, status),
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
    notifier.confirmCritical('Are you sure you want to decline this recommendation?', () => {
      mutation.mutate({ recId: rec.id, status: 'rejected' });
    });
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
        return <StatusChip status={row.status || 'pending'} />;
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => {
        if (row.status !== 'pending' && row.status) return null;
        return (
          <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
            <AppActionGroup actions={[
              {
                type: 'atlas',
                onClick: () => {
                  const itemNames = Array.isArray(row.peptides) ? row.peptides.join(', ') : row.peptides;
                  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                    detail: {
                      message: `Can you explain the recommendation "${row.title || row.protocolName || 'Custom Recommendation'}" from ${row.doctorName || 'my doctor'}? It includes: ${itemNames}. How will this help me?`,
                      patientContext: true,
                      autoSend: true
                    }
                  }));
                }
              },
              { type: 'approve', label: 'Accept', onClick: () => handleAccept(row) },
              { type: 'reject', label: 'Decline', onClick: () => handleDecline(row) }
            ]} maxVisible={3} />
          </div>
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