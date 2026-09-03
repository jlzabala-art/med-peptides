import React, { useState, useEffect } from 'react';
import { getGlobalMarkets } from '../../../repositories/configRepository';
import { getCatalog } from '../../../repositories/productRepository';
import { getWholesalers } from '../../../repositories/wholesalerRepository';
import { getAllOrders, getB2BSalesOrders } from '../../../repositories/orderRepository';
import GlobalFootprintDashboard from './GlobalFootprintDashboard';
import InteractiveWorldMap from './InteractiveWorldMap';
import CountryDetailDrawer from './CountryDetailDrawer';
import ProductAvailabilityMatrix from './ProductAvailabilityMatrix';
import DistributorTerritoryManager from './DistributorTerritoryManager';
import { Loader2, Globe, ServerCrash } from '@/lib/icons';

// Default standard markets if 'global_markets' collection is empty
const DEFAULT_MARKETS = [
  { id: '1', name: 'UAE', status: 'Operational', flag: '🇦🇪' },
  { id: '2', name: 'KSA', status: 'Operational', flag: '🇸🇦' },
  { id: '3', name: 'Qatar', status: 'Pending', flag: '🇶🇦' },
  { id: '4', name: 'Kuwait', status: 'Opportunity', flag: '🇰🇼' },
  { id: '5', name: 'Bahrain', status: 'Distributor Needed', flag: '🇧🇭' },
  { id: '6', name: 'Oman', status: 'Opportunity', flag: '🇴🇲' },
  { id: '7', name: 'USA', status: 'Restricted', flag: '🇺🇸', restrictions: ['FDA Approval Required'] },
  { id: '8', name: 'EU', status: 'Operational', flag: '🇪🇺' }
];

export default function AtlasCommandCenter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live Data
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [orders, setOrders] = useState([]);

  // UI State
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'matrix', 'distributors'

  useEffect(() => {
    async function fetchAtlasData() {
      try {
        setLoading(true);
        // 1. Fetch Global Markets
        let fetchedMarkets = await getGlobalMarkets();
        if (!fetchedMarkets || fetchedMarkets.length === 0) {
          fetchedMarkets = DEFAULT_MARKETS;
        }

        // 2. Fetch Products
        const prodList = await getCatalog();

        // 3. Fetch Distributors
        const wholeList = await getWholesalers(50);

        // 4. Fetch Orders for Revenue
        const { orders: ordList } = await getAllOrders({ limitCount: 100 });
        const b2bList = await getB2BSalesOrders(100);

        setMarkets(fetchedMarkets);
        setProducts(prodList || []);
        setWholesalers(wholeList || []);
        setOrders([...(ordList || []), ...(b2bList || [])]);

      } catch (err) {
        console.error('Failed to load Atlas data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAtlasData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
        <span>Booting Atlas Command Center...</span>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-danger)' }}>
        <ServerCrash size={48} style={{ margin: '0 auto 1rem auto' }} />
        <h2>Data Integrity Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={24} color="var(--primary)" /> Atlas Global Deployment Center
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Market access, regulatory control, and geographic intelligence.</div>
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          {['map', 'matrix', 'distributors'].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: activeTab === t ? 'var(--primary)' : 'transparent',
                color: activeTab === t ? 'white' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Dashboard */}
      <GlobalFootprintDashboard 
        markets={markets} 
        products={products} 
        wholesalers={wholesalers} 
        orders={orders} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeTab === 'map' && (
          <InteractiveWorldMap 
            markets={markets} 
            onSelectMarket={setSelectedMarket} 
          />
        )}
        {activeTab === 'matrix' && (
          <ProductAvailabilityMatrix 
            markets={markets} 
            products={products} 
          />
        )}

        {activeTab === 'distributors' && (
          <DistributorTerritoryManager 
            wholesalers={wholesalers} 
            orders={orders} 
          />
        )}
      </div>

      {/* Detail Drawer */}
      {selectedMarket && (
        <CountryDetailDrawer 
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
          products={products}
          wholesalers={wholesalers}
          orders={orders}
        />
      )}

    </div>
  );
}