import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

import TopKPIBar from './TopKPIBar';
import MatchingTable from './MatchingTable';
import ProductPreviewDrawer from './ProductPreviewDrawer';
import AIAssistantPanel from './AIAssistantPanel';

const TARGET_ITEMS = [
  "AOD-9604 (5 mg)", "Kisspeptin 10-acetate (5 mg)", "hCG (5000 IU)",
  "Retatrutide (40 mg)", "Tirzepatide (60 mg)", "MOTS-C (40 mg)",
  "MOTS-C (60 mg)", "NAD+ (750 mg)", "BPC-157 (15 mg)", "TB-500 (45 mg)"
];

const TABS = [
  { id: 'all', label: 'All Items' },
  { id: 'missing', label: 'Missing Products' },
  { id: 'review', label: 'Review Required' },
  { id: 'supplier', label: 'Supplier Gaps' },
  { id: 'zoho', label: 'Zoho Preparation' }
];

export default function CatalogIntelligenceHub() {
  const [loading, setLoading] = useState(true);
  const [auditResults, setAuditResults] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      const dbProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const results = TARGET_ITEMS.map((item, index) => {
        const baseName = item.split('(')[0].trim().toLowerCase();
        const dosageMatch = item.match(/\((.*?)\)/);
        const dosage = dosageMatch ? dosageMatch[1] : null;

        const found = dbProducts.find(p => 
          (p.name && p.name.toLowerCase().includes(baseName)) || 
          (p.displayName && p.displayName.toLowerCase().includes(baseName)) ||
          (p.slug && p.slug.includes(baseName.replace(/\s+/g, '-')))
        );

        let confidence = 0;
        let reason = null;
        let supplier = found?.supplier || null;
        let zohoStatus = 'Missing in DB';
        let price = found?.pricing?.retail || 0;

        if (found) {
          // Mock Confidence Engine Logic
          if (found.name?.toLowerCase().includes(dosage?.toLowerCase() || '')) {
            confidence = 100;
            zohoStatus = 'Ready';
          } else {
            confidence = 70 + Math.floor(Math.random() * 20); // 70-89
            reason = 'Dosage mismatch';
            zohoStatus = 'Needs Review';
          }

          if (!supplier && confidence > 0) {
            supplier = index % 2 === 0 ? 'Lotusland' : 'NP Labs'; // Mock supplier injection for demo
            if (index % 3 === 0) {
              supplier = null;
              reason = 'Missing Supplier';
              confidence = Math.min(confidence, 85);
            }
          }
          
          if (confidence === 100 && index % 4 === 0) zohoStatus = 'Synced';
        }

        return { 
          item, 
          found: !!found, 
          productInfo: found, 
          confidence, 
          reason, 
          supplier, 
          price, 
          zohoStatus 
        };
      });
      
      setAuditResults(results);
    } catch (err) {
      console.error('Audit failed:', err);
    }
    setLoading(false);
  };

  const filteredResults = auditResults.filter(res => {
    if (activeTab === 'all') return true;
    if (activeTab === 'missing') return res.confidence === 0;
    if (activeTab === 'review') return res.confidence > 0 && res.confidence < 90;
    if (activeTab === 'supplier') return res.confidence > 0 && !res.supplier;
    if (activeTab === 'zoho') return res.zohoStatus === 'Ready';
    return true;
  });

  return (
    <div style={{ paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Catalog Intelligence & Enrichment</h2>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Import → Match → Review → Enrich → Validate → Sync to Zoho
        </p>
      </div>

      {/* KPIs */}
      <TopKPIBar auditResults={auditResults} />

      {/* Main Content Layout (Tabs/Table + AI Panel) */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Side: Tabs and Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '-0.5rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <MatchingTable 
            auditResults={filteredResults} 
            loading={loading} 
            onRowClick={(item) => setSelectedItem(item)} 
          />
        </div>

        {/* Right Side: AI Panel */}
        <AIAssistantPanel />
      </div>

      {/* Drawer */}
      <ProductPreviewDrawer 
        selectedItem={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />

    </div>
  );
}
