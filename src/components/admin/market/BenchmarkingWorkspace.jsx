import React from 'react';
import { BarChart2 } from '@/lib/icons';
import DataTable from '../../ui/DataTable';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import EmptyState from '../../ui/EmptyState';

export default function BenchmarkingWorkspace({ onProductClick, matches = [], loading = false }) {
  if (loading) return <DataTableSkeleton rows={6} columns={7} />;

  const tableData = matches.map((match, idx) => {
    const retail = match.myPPMs ? match.myPPMs.retail * match.myMg : (match.retailPrice || 0);
    const wholesale = match.myPPMs ? match.myPPMs.wholesaler * match.myMg : (match.wholesalePrice || 0);
    const distributor = match.myPPMs ? match.myPPMs.distributor * match.myMg : (match.masterCost || 0);
    const compAvg = match.competitors?.length > 0
      ? (match.competitors.reduce((acc, curr) => acc + (curr.ppm || (curr.price_usd / (curr.dosage_mg || match.myMg || 1))), 0) / match.competitors.length) * (match.myMg || 1)
      : 0;

    // Real gross margin %: (wholesale - distributor) / wholesale, or fallback to (retail - wholesale) / retail
    const baseRev = wholesale > 0 ? wholesale : retail;
    const baseCost = wholesale > 0 ? distributor : wholesale;
    const marginPct = baseRev > 0 && baseCost > 0 ? (((baseRev - baseCost) / baseRev) * 100) : null;

    // Real competitiveness score (0-100): 100 when wholesale/retail <= compAvg, scaled down by premium %
    let score = 50;
    if (compAvg > 0 && retail > 0) {
      const ratio = retail / compAvg;
      score = Math.max(10, Math.min(100, Math.round(115 - ratio * 30)));
    } else if (marginPct != null) {
      score = Math.max(20, Math.min(100, Math.round(marginPct * 1.5)));
    }

    return {
      _idx: idx,
      name: match.productName,
      canonicalKey: match.canonicalKey || null,
      retail,
      wholesale,
      distributor,
      margin: marginPct != null ? `${marginPct.toFixed(1)}%` : '—',
      marginNum: marginPct ?? 0,
      compAvg,
      score,
      _match: match,
    };
  });

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
