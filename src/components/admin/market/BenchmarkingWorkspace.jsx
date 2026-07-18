import React from 'react';
import { BarChart2 } from '@/lib/icons';
import DataTable from '../../ui/DataTable';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import EmptyState from '../../ui/EmptyState';

export default function BenchmarkingWorkspace({ onProductClick, matches = [], loading = false }) {
  if (loading) return <DataTableSkeleton rows={6} columns={7} />;

  const tableData = matches.map((match, idx) => ({
    _idx: idx,
    name: match.productName,
    retail: match.myPPMs ? match.myPPMs.retail * match.myMg : 0,
    wholesale: match.myPPMs ? match.myPPMs.wholesaler * match.myMg : 0,
    distributor: match.myPPMs ? match.myPPMs.distributor * match.myMg : 0,
    margin: 'TBD',
    compAvg: match.competitors.length > 0
      ? (match.competitors.reduce((acc, curr) => acc + (curr.ppm || (curr.price_usd / (curr.dosage_mg || match.myMg))), 0) / match.competitors.length) * match.myMg
      : 0,
    score: 85,
    _match: match
  }));

  const columns = [
    {
      key: 'name',
      header: 'Product',
      sortKey: 'name',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span>
    },
    {
      key: 'retail',
      header: 'Retail',
      align: 'right',
      sortValue: (r) => r.retail,
      render: (r) => `$${r.retail?.toFixed(2)}`
    },
    {
      key: 'wholesale',
      header: 'Wholesale',
      align: 'right',
      sortValue: (r) => r.wholesale,
      render: (r) => `$${r.wholesale?.toFixed(2)}`
    },
    {
      key: 'distributor',
      header: 'Distributor',
      align: 'right',
      sortValue: (r) => r.distributor,
      render: (r) => `$${r.distributor?.toFixed(2)}`
    },
    {
      key: 'margin',
      header: 'Margin %',
      render: (r) => <span style={{ color: '#16a34a', fontWeight: 600 }}>{r.margin}</span>
    },
    {
      key: 'compAvg',
      header: 'Comp Avg',
      align: 'right',
      sortValue: (r) => r.compAvg,
      render: (r) => `$${r.compAvg?.toFixed(2)}`
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      sortValue: (r) => r.score,
      render: (r) => (
        <span style={{
          backgroundColor: r.score > 80 ? '#dcfce7' : '#fef3c7',
          color: r.score > 80 ? '#166534' : '#854d0e',
          padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700
        }}>
          {r.score}/100
        </span>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Product Benchmarking Matrix</h3>
      </div>
      {tableData.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No benchmarking data"
          subtitle="Run a competitor scan to populate the benchmarking matrix."
        />
      ) : (
        <DataTable
          data={tableData}
          columns={columns}
          keyField="_idx"
          onRowClick={onProductClick}
          globalSearch
          searchPlaceholder="Search products..."
          emptyTitle="No products found"
        />
      )}
    </div>
  );
}
