"use client";

import React from 'react';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';

/**
 * AdminPatientsTab
 * Rendered inside AdminCustomersTab ("use client").
 * Renders UniversalPatientsTable with administrative capabilities, 4 top KPIs, and drawer integration.
 */
export default function AdminPatientsTab({ isSubTab = false }) {
  return (
    <AdminTabErrorBoundary tabName="Patients">
      <UniversalPatientsTable
        viewMode="admin"
        hideHeader={isSubTab}
      />
    </AdminTabErrorBoundary>
  );
}

