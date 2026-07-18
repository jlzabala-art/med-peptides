"use client";
import React from 'react';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';

export default function AdminPatientsTab({ isSubTab = false }) {
  return <UniversalPatientsTable viewMode="admin" hideHeader={isSubTab} />;
}
