import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SupplierPagination({ 
  totalItems, 
  totalPages, 
  currentPage, 
  setCurrentPage, 
  pageSize, 
  setPageSize 
}) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Showing <strong>{start}</strong> to <strong>{end}</strong> of <strong>{totalItems}</strong> suppliers
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per page:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-raised)',
              fontSize: '0.75rem',
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: currentPage === 1 ? 'var(--surface)' : 'var(--surface-raised)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={14} />
          </button>
          
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '80px', textAlign: 'center' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: currentPage === totalPages ? 'var(--surface)' : 'var(--surface-raised)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
