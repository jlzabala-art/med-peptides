import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import DataTable from '../ui/DataTable';
import AppFilterBar from '../ui/AppFilterBar';
import { useToast } from '../../hooks/useToast';
import PayoutManagerWidget from './gadgets/PayoutManagerWidget';

export default function AdminCostsTab({ readOnly = false }) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ exchangeRates: { euro: 0.92 } });
  const [costCurrency, setCostCurrency] = useState('usd');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [productsSnap, settingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'))),
        getDocs(query(collection(db, 'settings'))),
      ]);

      const productsList = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(productsList);

      const globalSettings = settingsSnap.docs.find((d) => d.id === 'global');
      if (globalSettings) {
        setSettings(globalSettings.data());
      }
    } catch (err) {
      console.error('Error fetching data for costs tab:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleUpdateProduct(id, updates) {
    try {
      const product = products.find(p => p.id === id);
      const oldCost = product ? product.costPrice : 0;
      const productName = product ? product.name : id;
      
      // PHASE 1: CFO Architecture - Send to Approval Queue instead of direct update
      await addDoc(collection(db, 'financial_approvals'), {
        type: 'cost_update',
        status: 'pending',
        data: {
          productId: id,
          productName,
          oldCost,
          updates
        },
        requestedBy: currentUser?.email || 'Admin',
        createdAt: new Date().toISOString()
      });
      
      toast.success('Cost update sent to CFO for approval.');
    } catch (err) {
      console.error('Error queueing product cost update:', err);
      toast.error('Failed to queue cost update.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) || (p.dosage || '').toLowerCase().includes(term)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const columns = [
    {
      key: 'product',
      header: 'Product / Dosage',
      sortValue: (p) => p.name || '',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700 }}>{p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.dosage || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'base_cost',
      header: 'Base Cost (USD)',
      align: 'center',
      sortValue: (p) => p.costPrice || 0,
      render: (p) => (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$</span>
          {readOnly ? (
            <span style={{ fontWeight: 700 }}>{p.costPrice}</span>
          ) : (
            <input
              type="number"
              step="0.01"
              defaultValue={p.costPrice}
              onBlur={(e) =>
                handleUpdateProduct(p.id, { costPrice: parseFloat(e.target.value) || 0 })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  handleUpdateProduct(p.id, { costPrice: parseFloat(e.target.value) || 0 });
              }}
              style={{
                width: '100px',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'retail_price',
      header: 'Retail Price',
      align: 'right',
      sortValue: (p) => p.price || 0,
      render: (p) => (
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          ${p.price || 0}
        </span>
      )
    },
    {
      key: 'gross_margin',
      header: 'Gross Margin (%)',
      align: 'center',
      sortValue: (p) => {
        const cost = p.costPrice || 0;
        const price = p.price || 0;
        if (price === 0) return 0;
        return ((price - cost) / price) * 100;
      },
      render: (p) => {
        const cost = p.costPrice || 0;
        const price = p.price || 0;
        if (price === 0) return <span style={{color: 'gray'}}>N/A</span>;
        const margin = ((price - cost) / price) * 100;
        const isLow = margin < 40;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 800,
              color: isLow ? '#ef4444' : '#10b981',
              backgroundColor: isLow ? '#fee2e2' : '#d1fae5',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              {margin.toFixed(1)}%
            </span>
            {isLow && <span title="Low Margin Alert (Below 40%)" style={{cursor: 'help'}}>⚠️</span>}
          </div>
        );
      }
    },
    {
      key: 'calculated_cost',
      header: `Calculated Cost (${costCurrency.toUpperCase()})`,
      align: 'right',
      sortValue: (p) => {
        const eurRate = settings.exchangeRates?.euro || 0.92;
        return costCurrency === 'usd' ? p.costPrice : p.costPrice * eurRate;
      },
      render: (p) => {
        const eurRate = settings.exchangeRates?.euro || 0.92;
        const displayCost =
          costCurrency === 'usd' ? p.costPrice : (p.costPrice * eurRate).toFixed(2);
        return (
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
            {costCurrency === 'usd' ? '$' : '€'} {displayCost}
          </span>
        );
      },
    },
  ];

  if (loading)
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading cost data...
      </div>
    );

  return (
    <div className="view-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Cost Hub (Financials)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review and edit product costs in USD or calculate in EUR.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <button
            onClick={() => setCostCurrency('usd')}
            style={{
              padding: '0.6rem 1.5rem',
              border: 'none',
              backgroundColor: costCurrency === 'usd' ? 'var(--primary)' : 'white',
              color: costCurrency === 'usd' ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCostCurrency('eur')}
            style={{
              padding: '0.6rem 1.5rem',
              border: 'none',
              backgroundColor: costCurrency === 'eur' ? 'var(--primary)' : 'white',
              color: costCurrency === 'eur' ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            EUR (€)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <PayoutManagerWidget />
      </div>

      <div
        className="card"
        style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}
      >
        <DataTable
          columns={columns}
          data={paginatedProducts}
          keyField="id"
          emptyTitle="No costs found"
          emptyDescription="No products match your search criteria."
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
          searchPlaceholder="Search product by name or dosage..."
        />
      </div>

      <div
        style={{
          textAlign: 'right',
          fontSize: '10px',
          color: 'var(--text-muted)',
          opacity: 0.5,
          marginTop: '0.5rem',
        }}
      >
        Widget: AdminCostsWidget
      </div>
    </div>
  );
}
