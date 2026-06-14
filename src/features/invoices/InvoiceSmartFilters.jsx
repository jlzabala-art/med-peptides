import X from "lucide-react/dist/esm/icons/x";
import Filter from "lucide-react/dist/esm/icons/filter";
import Search from "lucide-react/dist/esm/icons/search";
import React from 'react';




export default function InvoiceSmartFilters({ 
  onClose,
  searchQuery,
  setSearchQuery,
  selectedStatuses,
  setSelectedStatuses
}) {
  const handleStatusChange = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };
  return (
    <div style={{ 
      width: '320px', background: 'white', borderLeft: '1px solid var(--border)', 
      display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Smart Filters</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={18} color="var(--color-text-tertiary)" />
        </button>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Search Customers / Invoices</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <Search size={16} color="var(--color-text-tertiary)" />
            <input 
              type="text" 
              placeholder="Customer name or INV-..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Status</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Paid', 'Partially Paid', 'Overdue', 'Draft', 'Sent'].map(status => (
              <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusChange(status)}
                /> {status}
              </label>
            ))}
          </div>
        </div>

        {/* Risk Score */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Atlas AI Risk Profile</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['High Risk', 'Medium Risk', 'Low Risk'].map(risk => (
              <label key={risk} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" /> {risk}
              </label>
            ))}
          </div>
        </div>

      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <button onClick={onClose} style={{ 
          width: '100%', padding: '0.75rem', background: 'var(--color-primary)', color: 'white', 
          border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' 
        }}>
          Apply & Close
        </button>
      </div>
    </div>
  );
}