import Layers from "lucide-react/dist/esm/icons/layers";
import LayoutList from "lucide-react/dist/esm/icons/layout-list";
import Filter from "lucide-react/dist/esm/icons/filter";
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import FinancialKPIHeader from './FinancialKPIHeader';
import InvoiceDataGrid from './InvoiceDataGrid';
import InvoiceEmptyState from './InvoiceEmptyState';
import InvoiceDetailWorkspace from './InvoiceDetailWorkspace';
import CollectionCenter from './CollectionCenter';
import InvoiceSmartFilters from './InvoiceSmartFilters';




export default function InvoiceIntelligenceHub() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'collections'
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = inv.customerName?.toLowerCase().includes(q);
      const matchInv = inv.documentNumber?.toLowerCase().includes(q) || inv.id?.toLowerCase().includes(q);
      if (!matchName && !matchInv) return false;
    }
    if (selectedStatuses.length > 0) {
      const status = inv.status || 'Draft';
      if (!selectedStatuses.includes(status)) return false;
    }
    return true;
  });

  useEffect(() => {
    const q = query(collection(db, 'b2b_invoices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '3rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando inteligencia financiera...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}><FinancialKPIHeader invoices={invoices} /></div>
        </div>

        {invoices.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '8px', width: 'fit-content' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', background: viewMode === 'grid' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                <LayoutList size={14} /> Data Grid
              </button>
              <button 
                onClick={() => setViewMode('collections')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', background: viewMode === 'collections' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: viewMode === 'collections' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                <Layers size={14} /> Collection Center
              </button>
            </div>
            <button 
              onClick={() => setShowFilters(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              <Filter size={14} /> Filters
            </button>
          </div>
        )}
        {filteredInvoices.length === 0 ? (
          <InvoiceEmptyState />
        ) : viewMode === 'grid' ? (
          <InvoiceDataGrid 
            invoices={filteredInvoices} 
            selectedInvoice={selectedInvoice}
            onSelect={(invoice) => setSelectedInvoice(invoice)} 
          />
        ) : (
          <CollectionCenter 
            invoices={filteredInvoices} 
            onSelect={(invoice) => setSelectedInvoice(invoice)} 
          />
        )}
      </div>

      {selectedInvoice && (
        <InvoiceDetailWorkspace 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

      {showFilters && !selectedInvoice && (
        <InvoiceSmartFilters 
          onClose={() => setShowFilters(false)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
        />
      )}
    </div>
  );
}