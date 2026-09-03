import Package from "lucide-react/dist/esm/icons/package";
import Clock from "lucide-react/dist/esm/icons/clock";
import Truck from "lucide-react/dist/esm/icons/truck";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPatientOrders } from '../../services/patientTabsService';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import { StatusChip, CopyableId } from '../ui';
import Spinner from '../ui/Spinner';
import AppActionGroup from '../ui/AppActionGroup';

// Icons mapping removed to respect GCP simplicity.

export default function PatientOrdersTab({ userId }) {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['patientOrders', userId],
    queryFn: () => fetchPatientOrders(userId),
    enabled: !!userId,
  });

  if (isLoading) return <Spinner text="Loading your orders..." />;
  if (isError) return <div style={{ color: 'red', padding: '1rem' }}>Failed to load orders.</div>;

  const columns = [
    {
      header: 'Order ID',
      key: 'orderId',
      width: '20%',
      render: (row) => <CopyableId value={row.orderId || row.id} displayValue={row.orderId || row.id.slice(0, 8)} />
    },
    {
      header: 'Date',
      key: 'createdAt',
      width: '16%',
      render: (row) => row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'N/A'
    },
    {
      header: 'Items',
      key: 'items',
      width: '30%',
      render: (row) => (
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
          {row.items?.slice(0, 2).map((item, i) => (
            <span key={i} style={{ fontSize: '0.85rem' }}>
              {item.quantity}x {item.name}
            </span>
          ))}
          {row.items?.length > 2 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              +{row.items.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Total',
      key: 'total',
      width: '14%',
      render: (row) => <span style={{ fontWeight: 600 }}>${(row.total || 0).toFixed(2)}</span>
    },
    {
      header: 'Status',
      key: 'status',
      width: '10%',
      render: (row) => {
        return <StatusChip status={row.status || 'Pending'} />;
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '10%',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
          <AppActionGroup actions={[
            {
              type: 'atlas',
              onClick: () => {
                window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                  detail: {
                    message: `Can you check the status of my order #${row.orderId || row.id.slice(0, 8)}? It is currently marked as ${row.status || 'Pending'}.`,
                    patientContext: true,
                    autoSend: true
                  }
                }));
              }
            }
          ]} />
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>My Orders</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>View and track your recent orders.</p>
      </div>
      <Card noPadding>
        <DataTable columns={columns} data={orders} emptyMessage="You haven't placed any orders yet." />
      </Card>
    </div>
  );
}