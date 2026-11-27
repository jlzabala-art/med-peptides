'use client';

import React from 'react';
import DataTable from '@/components/ui/DataTable';

/**
 * GuideReferenceTable — Lightweight Client Wrapper around DataTable for RSC Guides
 * ─────────────────────────────────────────────────────────────────────────────
 * Preserves Server Component (Rule #21) SEO on /guides/* pages while enforcing
 * Rule #3 (DataTable only — automatic mobile card layout via .gcp-table-container).
 */
export default function GuideReferenceTable({ columns = [], data = [], accentKeys = {} }) {
  const mappedColumns = columns.map((col) => ({
    key: col.key,
    header: col.header,
    render: (row) => {
      const val = row[col.key];
      const accent = accentKeys[col.key];
      if (accent) {
        return <strong style={{ color: accent }}>{val}</strong>;
      }
      return val;
    },
  }));

  return (
    <DataTable
      columns={mappedColumns}
      data={data}
      readOnly={true}
      globalSearch={false}
      searchable={false}
      pagination={false}
    />
  );
}
