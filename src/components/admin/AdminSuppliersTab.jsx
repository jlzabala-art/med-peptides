import React from 'react';
import { fetchSupplierInitialDataAction } from '../../app/actions/supplierActions';
import AdminSuppliersTabClient from './AdminSuppliersTabClient';
import PageHeader from '../ui/PageHeader';

/**
 * AdminSuppliersTab — RSC
 * Reads from `suppliers` collection (laboratorios/fabricantes).
 * DISTINTO de AdminWholesellersTab que lee de `wholesellers`.
 */
export default async function AdminSuppliersTab(props) {
  let initialData = null;
  let error = null;

  try {
    initialData = await fetchSupplierInitialDataAction(20);
  } catch (e) {
    console.error('[AdminSuppliersTab] Failed to fetch initial supplier data:', e);
    error = e.message;
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <PageHeader
          title="Suppliers"
          subtitle="Laboratories & manufacturers — sourcing relationships, GMP docs, and product variants."
        />
        <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-danger)' }}>
          <p style={{ color: 'var(--text-danger)' }}>Failed to load suppliers: {error}</p>
        </div>
      </div>
    );
  }

  return <AdminSuppliersTabClient initialData={initialData} />;
}
