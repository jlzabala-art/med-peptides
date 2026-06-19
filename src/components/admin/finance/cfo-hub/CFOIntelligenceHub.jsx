import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../../firebase.js";


import ExecutiveSummaryBar from './ExecutiveSummaryBar';
import AIInsightsAndScore from './AIInsightsAndScore';
import ProfitabilityCommandCenter from './ProfitabilityCommandCenter';
import OperationsGrid from './OperationsGrid';
import StrategicIntelligencePanel from './StrategicIntelligencePanel';
import ProtocolDrillDownDrawer from './ProtocolDrillDownDrawer';

export default function CFOIntelligenceHub({ data, totalBalance }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const dbProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(dbProducts);
      } catch (err) {
        console.error("Failed to fetch products for CFO Hub:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
        <span>Initializing CFO Intelligence Core...</span>
        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
      {/* 1. Executive Summary Bar (Horizontal scroll) */}
      <ExecutiveSummaryBar data={data} totalBalance={totalBalance} />

      {/* 2. AI Score and Insights */}
      <AIInsightsAndScore data={data} />

      {/* 3. Main Grid Layout */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Left Column (Profitability & Operations) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <ProfitabilityCommandCenter products={products} onSelectProtocol={setSelectedProtocol} />
          <OperationsGrid data={data} products={products} />
        </div>

        {/* Right Column (Strategic Panel) */}
        <StrategicIntelligencePanel />

      </div>

      {/* Protocol Drill Down Drawer */}
      <ProtocolDrillDownDrawer selectedProtocol={selectedProtocol} onClose={() => setSelectedProtocol(null)} />

    </div>
  );
}