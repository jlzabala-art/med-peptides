import React from 'react';
import { fetchWholesellerInitialDataAction } from '../../app/actions/supplierActions';
import AdminWholesellersTabClient from './AdminWholesellersTabClient';
import PageHeader from '../ui/PageHeader';

/**
 * AdminWholesellersTab — RSC
 * Reads from `wholesellers` collection (distribuidores/revendedores).
 * DISTINTO de AdminSuppliersTab que lee de `suppliers` (laboratorios).
 */
export default async function AdminWholesellersTab(props) {
  let initialData = null;

  try {
    initialData = await fetchWholesellerInitialDataAction(25);
  } catch (e) {
    console.error('[AdminWholesellersTab] Failed to fetch initial wholeseller data:', e);
    // Non-fatal: client will fetch from Firestore
    initialData = { kpis: null, wholesellers: [], lastDocId: null };
  }

  return <AdminWholesellersTabClient initialData={initialData} />;
}
