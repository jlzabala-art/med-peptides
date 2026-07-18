import React from 'react';
import { fetchKPIsAction } from '../../actions/kpiActions';
import KpiStripClient from './KpiStripClient';

/**
 * KpiStrip — Server Component
 *
 * Computes KPIs server-side via Firebase Admin SDK and passes them
 * as plain props to the Client Component for rendering.
 *
 * Supports all four roles: admin | doctor | patient | wholesaler
 * Each role gets its own set of relevant metrics.
 *
 * Usage:
 *   <KpiStrip role="admin" />
 *   <KpiStrip role="doctor" userId={currentUser.uid} />
 *   <KpiStrip role="patient" userId={currentUser.uid} />
 *   <KpiStrip role="wholesaler" userId={currentUser.uid} />
 */
export default async function KpiStrip({ role = 'admin', userId = null }) {
  const kpis = await fetchKPIsAction(role, userId);
  return <KpiStripClient role={role} kpis={kpis} />;
}
