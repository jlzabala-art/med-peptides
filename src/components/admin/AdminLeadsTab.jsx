import React, { useState, useEffect } from 'react';
import { catalogRepository } from '../../repositories/catalogRepository';
import { Users, Mail, Phone, Calendar, ArrowUpRight, Search, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppActionGroup from '../ui/AppActionGroup';
import { useToast } from '../../hooks/useToast';

export default function AdminLeadsTab() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  
  useEffect(() => {
    fetchLeads();
  }, []);
  
  async function fetchLeads() {
    setLoading(true);
    try {
      const leadsData = isAdmin 
        ? await catalogRepository.getAllLeads() 
        : await catalogRepository.getLeadsByOwner(user?.uid);
      setLeads(leadsData || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const leadToUpdate = leads.find(l => l.id === leadId);
      if (!leadToUpdate) return;
      
      const updatedLead = { ...leadToUpdate, status: newStatus };
      await catalogRepository.saveLeadRequest(updatedLead);
      
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update status.');
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Date', 'Catalog ID', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...leads.map((l) => [
        l.id,
        `"${l.name || ''}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        l.status || 'new',
        new Date(l.createdAt).toLocaleDateString(),
        l.catalogId || '',
        `"${(l.message || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = filterStatus === 'All' || l?.status === filterStatus.toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (l?.name || '').toLowerCase().includes(searchLower) ||
      (l?.email || '').toLowerCase().includes(searchLower) ||
      (l?.phone || '').toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const activeFilters = [];
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  
  const handleFilterRemove = (filter) => {
    if (filter.type === 'status') setFilterStatus('All');
  };

  const columns = [
    {
      key: 'contact',
      header: 'Contact Info',
      sortKey: 'contact',
      sortValue: (l) => (l.name || '').toLowerCase(),
      render: (l) => (
        <AppEntityCell
          title={l.name || 'Unknown Contact'}
          subtitle={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Mail size={10} /> {l.email}</span>
              {l.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>| <Phone size={10} /> {l.phone}</span>}
            </div>
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      sortKey: 'status',
      sortValue: (l) => l.status,
      render: (l) => {
        const isNew = l.status === 'new';
        const isContacted = l.status === 'contacted';
        return (
          <select 
            value={l.status || 'new'} 
            onChange={(e) => handleStatusChange(l.id, e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isNew ? '#e8f0fe' : isContacted ? '#fef7e0' : '#e6f4ea',
              color: isNew ? '#1a73e8' : isContacted ? '#b06000' : '#137333',
              outline: 'none'
            }}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
      sortKey: 'date',
      sortValue: (l) => new Date(l.createdAt).getTime(),
      render: (l) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date(l.createdAt).toLocaleDateString()}
        </span>
      ),
    }
  ];

  const renderExpandedRow = (l) => {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
          borderRadius: 'var(--radius-lg, 8px)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          margin: '0.5rem 0',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Message / Request Notes</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
              {l.message || 'No additional notes provided.'}
            </p>
          </div>
          <div>
             <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Source Catalog</h4>
             {l.catalogId ? (
                <a href={`/catalog/${l.catalogId}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}>
                  Open Catalog <ArrowUpRight size={14} />
                </a>
             ) : (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Unknown source</span>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomFilters = () => (
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      style={{
        height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
        border: '1px solid var(--border)', backgroundColor: filterStatus === 'All' ? 'white' : 'var(--primary-light)',
        color: filterStatus === 'All' ? 'var(--text-main)' : 'var(--primary)',
        fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
      }}
    >
      <option value="All">Status: All</option>
      <option value="New">New</option>
      <option value="Contacted">Contacted</option>
      <option value="Completed">Completed</option>
    </select>
  );

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 600 }}>
          Lead Management
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Global B2B/B2C lead routing and ownership rules. Manage incoming requests from clinic catalogs.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading leads...
          </div>
        ) : (
          <DataTable
            data={paginatedLeads}
            columns={columns}
            keyField="id"
            expandableRender={renderExpandedRow}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => {
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search leads by name, email, or phone..."
            filters={activeFilters}
            onFilterRemove={handleFilterRemove}
            renderCustomFilters={renderCustomFilters}
            emptyTitle="No leads found"
            emptyDescription="There are no incoming leads at this time. When clinics request information via catalogs, they will appear here."
            renderBatchActions={(selected) => (
              <button
                onClick={handleExportCSV}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem',
                }}
              >
                <Download size={14} /> Export All
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
}
