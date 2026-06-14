import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from "../../../firebase";
import MarketKPIHeader from './MarketKPIHeader';
import MarketAlertCenter from './MarketAlertCenter';
import CompetitorThreatMatrix from './CompetitorThreatMatrix';
import MarketOpportunitiesScanner from './MarketOpportunitiesScanner';
import BenchmarkingWorkspace from './BenchmarkingWorkspace';
import AtlasMarketAI from './AtlasMarketAI';
import ProductAnalysisDrawer from './ProductAnalysisDrawer';

export default function MarketIntelligenceHub() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cacheData, setCacheData] = useState({ matches: [], lastUpdated: null });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cacheDoc = await getDoc(doc(db, 'settings', 'competitor_cache'));
      if (cacheDoc.exists()) {
        setCacheData(cacheDoc.data());
      }
    } catch (err) {
      console.error('Error fetching competitor data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpiStats = useMemo(() => {
    let cheaperCount = 0;
    let expensiveCount = 0;
    let totalMatches = cacheData.matches ? cacheData.matches.length : 0;
    let totalCompetitors = 0;

    const compSet = new Set();
    (cacheData.matches || []).forEach(match => {
      const myPPM = match.myPPMs ? match.myPPMs['retail'] : null;
      let isOverallCheaper = true;
      let isOverallExpensive = true;
      
      match.competitors.forEach(comp => {
        compSet.add(comp.competitor_name);
        const compPPM = comp.ppm;
        if (!myPPM || !compPPM) return;
        const diff = myPPM - compPPM;
        if (diff > 0.05) isOverallCheaper = false; // We are more expensive
        if (diff < -0.05) isOverallExpensive = false; // We are cheaper
      });

      if (isOverallCheaper && !isOverallExpensive && myPPM) cheaperCount++;
      if (isOverallExpensive && !isOverallCheaper && myPPM) expensiveCount++;
    });

    totalCompetitors = compSet.size;

    return { cheaperCount, expensiveCount, totalMatches, totalCompetitors };
  }, [cacheData]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Competitive Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Market benchmarking, competitor tracking, and AI pricing recommendations.
        </p>
      </div>

      {/* Layer 1 */}
      <MarketKPIHeader stats={kpiStats} />

      {/* Layer 5 (AI Prominent) & Layer 2/3 Flex */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0rem' }}>
        <AtlasMarketAI />
        <MarketAlertCenter />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <CompetitorThreatMatrix matches={cacheData.matches} />
          <MarketOpportunitiesScanner matches={cacheData.matches} />
        </div>
      </div>

      {/* Layer 4 */}
      <BenchmarkingWorkspace onProductClick={handleProductClick} matches={cacheData.matches} loading={loading} />

      {/* Drawers */}
      <ProductAnalysisDrawer 
        isOpen={!!selectedProduct} 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
