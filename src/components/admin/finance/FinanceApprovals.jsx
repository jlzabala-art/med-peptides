import React, { useState, useMemo } from 'react';
import AdminApprovalsWidget from '../gadgets/AdminApprovalsWidget';
import { FileText, ClipboardList, Clock, BellRing, Receipt, Download, ExternalLink, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';
import { usePreferences } from '../../../context/PreferencesContext';

export default function FinanceApprovals({ dashboardData }) {
  const pendingInvoices = dashboardData?.pendingInvoices || [];
  const { formatCurrency } = usePreferences();
  
  // State for filtering and pagination
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter and paginate data
  const filteredInvoices = useMemo(() => {
    let result = pendingInvoices;
    if (dateFilter) {
      result = result.filter(inv => inv.due_date && inv.due_date.includes(dateFilter));
    }
    return result;
  }, [pendingInvoices, dateFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top: Approvals Widget */}
      <div>
        <AdminApprovalsWidget />
      </div>

      {/* Full Width Table for Unpaid Invoices */}
      <div className="glass-card-premium" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--warning)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt style={{ width: '22px', height: '22px', color: 'var(--warning)' }} />
              Unpaid Customer Invoices
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage outstanding invoices dynamically synced from Zoho Books</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: '0.35rem 0.5rem 0.35rem 2rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }}
                title="Filter by Due Date"
              />
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {filteredInvoices.length} Pending
            </div>
            <button 
              onClick={() => exportToCSV(filteredInvoices, 'unpaid_invoices', [
                { header: 'Customer', accessor: 'customer_name' },
                { header: 'Invoice #', accessor: 'invoice_number' },
                { header: 'Balance', accessor: 'balance' },
                { header: 'Due Date', accessor: 'due_date' }
              ])}
              className="gcp-btn-secondary"
              title="Export Invoices to CSV"
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Export
            </button>
          </div>
        </div>
        
        <div style={{ padding: '0', background: 'var(--surface)', overflowX: 'auto' }}>
          {filteredInvoices.length === 0 ? (
            <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', textAlign: 'center', opacity: 0.5 }}>
              <FileText style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>No pending invoices match your criteria.</p>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer / Clinic</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Number</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoices.map((inv, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {inv.customer_name}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-muted)' }}>
                        {inv.invoice_number}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', background: 'rgba(245, 158, 11, 0.1)', padding: '0.35rem 0.6rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          {inv.due_date}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800', fontSize: '0.95rem', color: 'var(--warning)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                        {formatCurrency(inv.balance)}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                          <button className="gcp-btn-secondary" style={{ padding: '0.5rem 0.6rem' }} title="Send Reminder">
                            <BellRing style={{ width: '16px', height: '16px', color: 'var(--warning)' }} />
                          </button>
                          <a 
                            href={`https://books.zoho.com/app#/invoices/${inv.invoice_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="gcp-btn-primary"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: '700', background: 'var(--warning)', color: '#fff', border: 'none', borderRadius: '6px' }}
                          >
                            Manage <ExternalLink style={{ width: '14px', height: '14px' }} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="gcp-btn-secondary"
                      style={{ padding: '0.4rem 0.6rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: '600', margin: '0 0.5rem' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="gcp-btn-secondary"
                      style={{ padding: '0.4rem 0.6rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Bottom: Compliance Audit Log */}
      <div className="glass-card-premium" style={{ padding: '1.5rem', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <ClipboardList style={{ width: '28px', height: '28px', color: 'var(--success)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: 'var(--primary)' }}>Compliance Audit Log</h3>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)', margin: 0 }}>All historical approvals and margin overrides are securely tracked.</p>
          </div>
        </div>
        <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          View History <ArrowRight style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
      
    </div>
  );
}