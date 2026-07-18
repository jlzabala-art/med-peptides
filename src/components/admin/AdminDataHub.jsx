'use client';
import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import AdminImportHubTab from './AdminImportHubTab';
import AdminCatalogEnrichmentTab from './AdminCatalogEnrichmentTab';
import Database from "lucide-react/dist/esm/icons/database";

export default function AdminDataHub() {
  const [activeTab, setActiveTab] = useState('import');

  const tabs = [
    { id: 'import', label: 'Data Import & Sync' },
    { id: 'enrichment', label: 'Catalog Enrichment (AI)' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data & AI Hub"
        subtitle="Centralized management for external data imports, Zoho sync, and AI enrichment."
        icon={Database}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 mt-4">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Render Active Tab */}
      <div className="mt-6">
        {activeTab === 'import' && <AdminImportHubTab isSubTab={true} />}
        {activeTab === 'enrichment' && <AdminCatalogEnrichmentTab isSubTab={true} />}
      </div>
    </div>
  );
}
