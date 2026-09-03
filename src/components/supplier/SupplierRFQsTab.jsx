"use client";
/**
 * SupplierRFQsTab.jsx
 *
 * Vista de RFQs para el panel Supplier.
 * Sin imports directos de firebase/firestore — usa supplierRepository vía React Query.
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRFQsBySupplier } from '@/repositories/supplierRepository';
import { queryKeys } from '@/hooks/data/queryKeys';
import { useAuth } from '../../context/AuthContext';
import FileText from "lucide-react/dist/esm/icons/file-text";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import format from 'date-fns/format';
import SupplierRFQModal from './SupplierRFQModal';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

// ── Mapa de estados → StatusBadge ─────────────────────────────────────────────
const RFQ_STATUS_MAP = {
  pending_supplier: 'pending',
  supplier_quoted:  'po_created',
  accepted:         'active',
  rejected:         'rejected',
};

const RFQ_STATUS_LABEL = {
  pending_supplier: 'Necesita Acción',
  supplier_quoted:  'Cotizado · Esperando Admin',
  accepted:         'Aceptado (PO Creada)',
  rejected:         'Rechazado',
};

// ── Columnas ──────────────────────────────────────────────────────────────────
const columns = [
  {
    key: 'prfqId',
    header: 'ID Solicitud',
    width: '18%',
    render: (row) => (
      <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
        {row.prfqId || row.id?.slice(0, 10)}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    width: '16%',
    render: (row) =>
      row.createdAt?.seconds
        ? format(new Date(row.createdAt.seconds * 1000), 'dd MMM yyyy')
        : '—',
  },
  {
    key: 'items',
    header: 'Ítems',
    width: '12%',
    render: (row) => `${row.items?.reduce((s, i) => s + (i.qty ?? 0), 0) ?? 0} uds`,
  },
  {
    key: 'totals',
    header: 'Valor Propuesto',
    width: '18%',
    render: (row) => (
      <span style={{ fontWeight: 700 }}>
        {row.totals?.subtotal != null ? `$${row.totals.subtotal.toFixed(2)}` : '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    width: '20%',
    render: (row) => (
      <StatusBadge
        status={RFQ_STATUS_MAP[row.status] ?? 'inactive'}
        label={RFQ_STATUS_LABEL[row.status] ?? row.status}
      />
    ),
  },
  {
    key: '_actions',
    header: 'Acción',
    width: '16%',
    align: 'right',
    render: (row, _, { onOpen }) => (
      <button
        onClick={(e) => { e.stopPropagation(); onOpen(row); }}
        style={{
          minHeight: '40px',
          padding: '0 14px',
          background: row.status === 'pending_supplier' ? 'var(--color-primary)' : 'var(--color-bg-app)',
          color: row.status === 'pending_supplier' ? 'white' : 'var(--color-text-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.8rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {row.status === 'pending_supplier' ? 'Revisar y Responder' : 'Ver Detalles'}
      </button>
    ),
  },
];

// ── Componente ────────────────────────────────────────────────────────────────
export default function SupplierRFQsTab() {
  const { userProfile } = useAuth();
  const supplierId = userProfile?.uid;
  const queryClient = useQueryClient();
  const [selectedRfq, setSelectedRfq] = useState(null);

  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: queryKeys.rfqs.bySupplier(supplierId, {}),
    queryFn: () => getRFQsBySupplier(supplierId),
    staleTime: 1000 * 60 * 5,
    enabled: !!supplierId,
  });

  const handleSuccess = () => {
    setSelectedRfq(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.bySupplier(supplierId, {}) });
  };

  // Columnas con contexto de onOpen inyectado
  const columnsWithCtx = columns.map((col) =>
    col.key === '_actions'
      ? { ...col, render: (row) => col.render(row, null, { onOpen: setSelectedRfq }) }
      : col
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Solicitudes de Cotización
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
          Revisa y responde las solicitudes de compra enviadas por el administrador.
        </p>
      </div>

      <DataTable
        columns={columnsWithCtx}
        data={rfqs}
        keyField="id"
        loading={isLoading}
        onRowClick={(row) => setSelectedRfq(row)}
        globalSearch={true}
        searchPlaceholder="Buscar por ID o estado…"
        emptyState={
          <EmptyState
            icon={FileText}
            title="Sin solicitudes de cotización"
            subtitle="No tienes solicitudes pendientes del administrador."
          />
        }
      />

      {selectedRfq && (
        <SupplierRFQModal
          rfq={selectedRfq}
          onClose={() => setSelectedRfq(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
