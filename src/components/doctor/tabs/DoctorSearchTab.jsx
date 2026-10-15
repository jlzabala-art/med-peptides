"use client";

import React from 'react';
import { Search, Layers, Clock } from 'lucide-react';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import DataTable from '../../ui/DataTable';

/**
 * DoctorSearchTab
 * 
 * Clinical Search & Universal Multi-Table Query (Golden Rule #7)
 * Provides an instant cross-table query workspace with chips,
 * active search breakdown, matching prescriptions, and matching care tasks.
 */
export default function DoctorSearchTab({
  searchQuery,
  setSearchQuery,
  filteredPrescriptions,
  filteredTasks,
  statusFilter,
  setStatusFilter,
  taskFilter,
  setTaskFilter,
  apiFilter,
  setApiFilter,
  slug,
  prescriptionColumns,
  taskColumns,
  loading,
  setSelectedPrescription
}) {
  return (
    <section
      id="search-workspace"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
      }}
    >
      {/* Header Title */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.10rem', fontWeight: 600, color: '#202124', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} style={{ color: '#1a73e8' }} />
          <span>Universal Clinical Registry Search</span>
        </h2>
        <p style={{ margin: 0, fontSize: '0.80rem', color: '#5f6368' }}>
          Instant cross-table query across patients, prescription numbers, compound pharmacopeia, and clinical tasks.
        </p>
      </div>

      {/* Prominent Global Search Bar */}
      <GlobalSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search patient, prescription code (e.g. RX-2024-001), active compound, or status..."
        resultCount={filteredPrescriptions.length + filteredTasks.length}
        namespace={`doctor-${slug}`}
        size="lg"
        filters={[
          statusFilter !== 'all' && {
            key: 'status',
            label: 'Status',
            value: statusFilter.toUpperCase(),
            onRemove: () => setStatusFilter('all')
          },
          taskFilter !== 'all' && {
            key: 'task',
            label: 'Task Type',
            value: taskFilter.toUpperCase(),
            onRemove: () => setTaskFilter('all')
          },
          apiFilter && {
            key: 'api',
            label: 'Active API',
            value: apiFilter,
            onRemove: () => setApiFilter(null)
          }
        ].filter(Boolean)}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Approved', value: 'approved' },
              { label: 'Active', value: 'active' },
              { label: 'Pending', value: 'pending' },
              { label: 'Draft', value: 'draft' }
            ],
            value: statusFilter,
            onChange: setStatusFilter
          },
          {
            key: 'task',
            label: 'Tasks',
            options: [
              { label: 'All Tasks', value: 'all' },
              { label: 'Titrations', value: 'titration' },
              { label: 'Refills', value: 'refill' },
              { label: 'Sign-offs', value: 'approval' }
            ],
            value: taskFilter,
            onChange: setTaskFilter
          }
        ]}
      />

      {/* Quick Query Shortcuts (Chips) */}
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#5f6368' }}>Quick Queries:</span>
        {[
          { label: 'Tirzepatide Regimens', q: 'Tirzepatide' },
          { label: 'GHK-Cu Formulations', q: 'GHK-Cu' },
          { label: 'NAD+ Cycles', q: 'NAD' },
          { label: 'BPC-157 Formulations', q: 'BPC-157' },
          { label: 'Pending Actions', q: 'pending' }
        ].map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setSearchQuery(chip.q)}
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#1a73e8',
              background: '#f8fafd',
              border: '1px solid #dadce0',
              borderRadius: '16px',
              padding: '3px 10px',
              cursor: 'pointer',
              transition: 'all 0.12s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafd'; }}
          >
            {chip.label}
          </button>
        ))}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#d93025',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '3px 6px'
            }}
          >
            Clear ×
          </button>
        )}
      </div>

      {/* Breakdown Pill */}
      {searchQuery.trim() && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.80rem',
            color: '#1e40af'
          }}
        >
          <span style={{ fontWeight: 600 }}>Active Search: &ldquo;{searchQuery}&rdquo;</span>
          <span style={{ color: '#93c5fd' }}>•</span>
          <span><strong>{filteredPrescriptions.length}</strong> matching prescriptions</span>
          <span style={{ color: '#93c5fd' }}>•</span>
          <span><strong>{filteredTasks.length}</strong> care tasks</span>
        </div>
      )}

      {/* Live Search Results: Prescriptions Table */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} style={{ color: '#1a73e8' }} />
            <span>Matching Prescriptions ({filteredPrescriptions.length})</span>
          </h3>
        </div>
        <DataTable
          data={filteredPrescriptions}
          columns={prescriptionColumns}
          keyField="id"
          loading={loading}
          emptyMessage={searchQuery ? `No prescriptions match "${searchQuery}"` : "No prescriptions found in clinical registry"}
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(row) => setSelectedPrescription && setSelectedPrescription(row)}
        />
      </div>

      {/* Live Search Results: Care Tasks (if any match) */}
      {filteredTasks.length > 0 && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e8eaed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} style={{ color: '#d97706' }} />
              <span>Matching Care Tasks ({filteredTasks.length})</span>
            </h3>
          </div>
          <DataTable
            data={filteredTasks}
            columns={taskColumns}
            keyField="id"
            loading={loading}
            emptyMessage="No clinical action tasks match query"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
      )}
    </section>
  );
}
