"use client";

import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Plus from "lucide-react/dist/esm/icons/plus";
import X from "lucide-react/dist/esm/icons/x";
import Globe from "lucide-react/dist/esm/icons/globe";
import Save from "lucide-react/dist/esm/icons/save";
import Activity from "lucide-react/dist/esm/icons/activity";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Settings from "lucide-react/dist/esm/icons/settings";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import {
  getCompetitorKPIs,
  getCompetitorAnalysisSettings,
  saveCompetitorAnalysisSettings,
  getCompetitorAnalysisResults,
  scheduleCompetitorScrape
} from '../../services/settingsService';
import { getProduct } from '../../repositories/productRepository';
import PageHeader from '../ui/PageHeader';
import AlgoliaProductPicker from './protocols/tabs/AlgoliaProductPicker';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';
import { useToast } from '../../hooks/useToast';
import CompetitorAnalysisWidget from './CompetitorAnalysisWidget';
import AlgoliaCompetitorBadge from './competitors/AlgoliaCompetitorBadge';
import Search from "lucide-react/dist/esm/icons/search";

export default function AdminCompetitorsTab({ isSubTab = false, initialSearch = '', product = null }) {
  const [matches, setMatches] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [kpis, setKpis] = useState({ totalMatches: 0, highlyCompetitive: 0, needsAdjustment: 0, lastUpdated: null });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(product ? { id: product.id, name: product.canonicalName || product.name || product.id, ...product } : null);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setSelectedProduct({ id: product.id, name: product.canonicalName || product.name || product.id, ...product });
    } else if (initialSearch && !selectedProduct) {
      setSelectedProduct({ id: initialSearch, name: initialSearch, canonicalName: initialSearch });
    }
  }, [product, initialSearch]);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState([
    { name: "Peptide Sciences", url: "https://www.peptidesciences.com/" },
    { name: "Limitless Life", url: "https://limitlesslifenootropics.com/" },
    { name: "Core Peptides", url: "https://corepeptides.com/" }
  ]);
  const [scrapeFrequency, setScrapeFrequency] = useState("Diario");
  const [newCompName, setNewCompName] = useState('');
  const [newCompUrl, setNewCompUrl] = useState('');

  const fetchData = React.useCallback(async () => {
    try {
      // 1. Fetch KPIs from server
      const kpisData = await getCompetitorKPIs();
      if (kpisData) {
        setKpis(kpisData);
      }

      // 2. Fetch settings
      const data = await getCompetitorAnalysisSettings();
      if (data && Object.keys(data).length > 0) {
        if (data.urls) setCompetitorUrls(data.urls);
        else if (data.targetUrls) {
          setCompetitorUrls(data.targetUrls.map(url => ({ name: new URL(url).hostname.replace('www.',''), url })));
        }
        if (data.frequency) setScrapeFrequency(data.frequency);
      }

    } catch (err) {
      console.error('Error fetching competitor data', err);
      toast?.error('Error fetching competitor data');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    async function fetchProductCompetitors() {
      if (!selectedProduct) {
        setMatches([]);
        setProductDetails(null);
        return;
      }
      setLoading(true);
      try {
        const pId = selectedProduct.id || selectedProduct.objectID;
        
        // Fetch full product for variants
        const prod = await getProduct(pId);
        if (prod) {
          setProductDetails(prod);
        } else {
          setProductDetails(null);
        }

        const compResult = await getCompetitorAnalysisResults(pId);
        if (compResult) {
          setMatches([compResult]);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Error fetching product competitors:', err);
        toast?.error('Error fetching competitor data for this product');
      } finally {
        setLoading(false);
      }
    }
    fetchProductCompetitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  const forceScan = async () => {
    setScanning(true);
    try {
      toast?.info("Background Scan Triggered. This may take 1-2 minutes.");
      const projectId = "med-peptides-app"; 
      const pId = selectedProduct ? (selectedProduct.id || selectedProduct.objectID) : null;
      const url = `https://us-central1-${projectId}.cloudfunctions.net/forceScrapeCompetitors${pId ? `?productId=${pId}` : ''}`;
      await fetch(url, { method: 'POST' });
      // Scraping multiple sites takes time; poll after 60s
      setTimeout(async () => {
        if (selectedProduct) {
          const pDocId = selectedProduct.id || selectedProduct.objectID;
          const compResult = await getCompetitorAnalysisResults(pDocId);
          if (compResult) {
            setMatches([compResult]);
          }
        }
        await fetchData();
        setScanning(false);
        toast?.success("Scan completed. Data refreshed.");
      }, 60000); 
    } catch (err) {
      console.error(err);
      toast?.error('Error triggering scan');
      setScanning(false);
    }
  };

  const scheduleNightlyScan = async () => {
    if (!selectedProduct) return;
    try {
      const pId = selectedProduct.id || selectedProduct.objectID;
      await scheduleCompetitorScrape(pId, {
        productId: pId,
        productName: selectedProduct.canonicalName || selectedProduct.name,
        scheduledAt: new Date().toISOString(),
        status: 'pending',
        targetUrls: competitorUrls.map(c => c.url)
      });
      toast?.success(`"${selectedProduct.name}" scheduled for tonight's automated competitor scan.`);
    } catch (e) {
      console.error('Failed to schedule nightly scan:', e);
      toast?.error('Failed to schedule nightly scan: ' + e.message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await saveCompetitorAnalysisSettings({
        urls: competitorUrls,
        frequency: scrapeFrequency
      });
      setShowSettings(false);
      toast?.success('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast?.error('Error saving settings');
    }
  };

  const addCompetitor = () => {
    if (!newCompName || !newCompUrl) return;
    setCompetitorUrls([...competitorUrls, { name: newCompName, url: newCompUrl }]);
    setNewCompName('');
    setNewCompUrl('');
  };

  const removeCompetitor = (idx) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== idx));
  };

  const toggleCompetitor = (idx) => {
    const updated = [...competitorUrls];
    updated[idx].active = updated[idx].active === false ? true : false;
    setCompetitorUrls(updated);
  };

  const competitorColumns = [
    {
      key: 'name',
      header: 'Store Name',
      width: '25%',
      render: (row) => <div style={{ fontWeight: 700 }}>{row.name}</div>
    },
    {
      key: 'url',
      header: 'Target URL',
      width: '45%',
      render: (row) => <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{row.url}</div>
    },
    {
      key: 'active',
      header: 'Scrape Status',
      width: '15%',
      render: (row, idx) => (
        <div onClick={() => toggleCompetitor(idx)} style={{ cursor: 'pointer', display: 'inline-block' }}>
          <StatusBadge status={row.active !== false ? 'active' : 'inactive'} label={row.active !== false ? 'Active' : 'Ignored'} />
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '10%',
      render: (_, idx) => (
        <button onClick={() => removeCompetitor(idx)} style={{ color: 'var(--text-muted)', background: 'var(--bg-default)', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}><X size={16} /></button>
      )
    }
  ];

  const lastUpdatedStr = kpis.lastUpdated ? new Date(kpis.lastUpdated).toLocaleString() : 'Never';

  const sourcingColumns = [
    {
      key: 'sku',
      header: 'SKU / ID',
      width: '25%',
      render: (row) => <CopyableId value={row.sku || row.id} />
    },
    {
      key: 'name',
      header: 'Supplier',
      width: '30%',
      render: (row) => <div style={{ fontWeight: 600 }}>{row.supplierName || 'Unknown'}</div>
    },
    {
      key: 'type',
      header: 'Type',
      width: '25%',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--bg-light)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
          {row.isRawPowder ? 'Raw Powder' : 'Finished Vial'}
        </span>
      )
    },
    {
      key: 'cost',
      header: 'Cost / mg',
      width: '20%',
      render: (row) => {
        const cost = row.pricePerMg || row.kitPricePerMg;
        return <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{cost ? `$${parseFloat(cost).toFixed(2)}` : 'N/A'}</div>;
      }
    }
  ];

  const marketColumns = [
    {
      key: 'store',
      header: 'Store Name',
      width: '35%',
      render: (row) => <div style={{ fontWeight: 600 }}>{row.competitor_name}</div>
    },
    {
      key: 'product',
      header: 'Product Match',
      width: '45%',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{row.product_name}</div>
          <a href={row.competitor_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}>Ver URL ↗</a>
        </div>
      )
    },
    {
      key: 'ppm',
      header: 'Price / mg',
      width: '20%',
      render: (row) => (
        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
          {row.ppm ? `$${row.ppm.toFixed(2)}` : 'N/A'}
        </div>
      )
    }
  ];

  const matchData = matches.length > 0 ? matches[0] : null;
  const historyData = matchData?.history || [];
  
  // Quick trend calculation
  let priceTrend = 'stable';
  if (historyData.length > 1) {
    const latest = historyData[historyData.length - 1].avgPpm;
    const previous = historyData[historyData.length - 2].avgPpm;
    if (latest > previous + 0.05) priceTrend = 'up';
    if (latest < previous - 0.05) priceTrend = 'down';
  }

  return (
    <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
      <PageHeader
        title="Market & Competitor Analysis"
        subtitle="Monitor competitor pricing for Vials and Peptides to maintain strategic advantage."
        icon={Activity}
        actions={
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <Settings size={16} /> Settings
          </button>
        }
      />

      <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 100 }}>
        <AlgoliaProductPicker onProductSelect={setSelectedProduct} />
        {selectedProduct && (
           <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ fontWeight: 600 }}>Selected Product:</span>
               <span>{selectedProduct.name}</span>
             </div>
             <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
           </div>
        )}
      </div>

      {/* KPI Dashboard - Rendered from Server Data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Matches</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px' }}><Activity size={20} /></div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpis.totalMatches}</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Highly Competitive</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem', borderRadius: '8px' }}><CheckCircle size={20} /></div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpis.highlyCompetitive}</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Needs Adjustment</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px' }}><AlertCircle size={20} /></div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpis.needsAdjustment}</span>
          </div>
        </div>
        {/* Algolia Real-Time Market Benchmark KPI */}
        {selectedProduct && (
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <span style={{ color: '#1e40af', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Algolia Benchmark</span>
            <div style={{ marginTop: '0.25rem' }}>
              <AlgoliaCompetitorBadge
                productName={selectedProduct.canonicalName || selectedProduct.name || ''}
                ourPrice={selectedProduct.myPPMs?.retail || 0}
                dosageMg={selectedProduct.variants?.[0]?.dosage || 5}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '0.15rem' }}>vs. {competitorUrls.length} competitors</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          <button 
            onClick={forceScan}
            disabled={scanning}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          >
            <RefreshCw size={16} className={scanning ? 'spin' : ''} /> 
            {scanning ? 'Scanning...' : 'Force Scan Now'}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}
          >
            <Settings size={16} /> Config
          </button>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
          Data last updated: {lastUpdatedStr}
        </div>
      </div>

      {showSettings && (
        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)', animation: 'slideDown 0.3s ease-out', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: '#00BCD4', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.6rem', borderRadius: '10px' }}><Settings size={20} /></div>
            <div>
              <h3 style={{ margin: '0', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Configuración del Scraper</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Administra las URLs de la competencia y la frecuencia de búsqueda automática.</p>
            </div>
          </div>
          <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Frecuencia de Exploración</label>
            <select 
              value={scrapeFrequency}
              onChange={(e) => setScrapeFrequency(e.target.value)}
              style={{ padding: '0.75rem 1rem', width: '100%', maxWidth: '300px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-default)', outline: 'none' }}
            >
              <option value="Diario">Diario</option>
              <option value="Cada 3 días">Cada 3 días</option>
              <option value="Semanal">Semanal</option>
              <option value="Quincenal">Quincenal</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', position: 'relative' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>URLs de Competidores</h4>
            <DataTable 
              columns={competitorColumns} 
              data={competitorUrls} 
              keyExtractor={(item, idx) => idx.toString()} 
              pageSize={10}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.01)', padding: '1.25rem', borderRadius: '12px', border: '1px dashed var(--border)', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Name</label>
              <input className="gcp-input" type="text" value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. Acme Peptides" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target URL</label>
              <input className="gcp-input" type="text" value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="https://..." />
            </div>
            <button onClick={addCompetitor} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', borderRadius: '8px', fontWeight: 700, alignItems: 'center' }}>
              <Plus size={16} /> Add Store
            </button>
          </div>
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
              <Save size={18} /> Save Settings
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
          Loading rapid analysis...
        </div>
      ) : (!selectedProduct) ? (
        <EmptyState 
          icon={Search}
          title="No Product Selected"
          subtitle="Search and select a product using the Algolia search bar above to view its competitor analysis."
        />
      ) : (!matches || matches.length === 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Algolia Instant Benchmark — shown ALWAYS when no scrape data yet */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#003666', color: '#fff', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Algolia Live Benchmark</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Datos de mercado en tiempo real (sin necesidad de scraping)</span>
            </div>
            <AlgoliaCompetitorBadge
              productName={selectedProduct.canonicalName || selectedProduct.name || ''}
              ourPrice={selectedProduct.myPPMs?.retail || 0}
              dosageMg={selectedProduct.variants?.[0]?.dosage || 5}
            />
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                No Live Scrape Data Found for {selectedProduct.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '480px' }}>
                We haven't gathered live market pricing yet. Trigger an immediate scan or schedule an automated crawl for tonight. While you wait, Algolia provides instant benchmark data above.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.85rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.78rem',
              color: '#475569'
            }}>
              <span>Configured Target Stores:</span>
              <strong style={{ color: '#0f172a' }}>
                {competitorUrls.map(c => c.name).join(', ')}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={scheduleNightlyScan}
                className="gcp-btn-secondary"
                style={{ padding: '0.6rem 1.25rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                🌙 Schedule Nightly Web Scan
              </button>
              <button
                onClick={forceScan}
                disabled={scanning}
                className="gcp-btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={15} className={scanning ? 'spin' : ''} />
                {scanning ? 'Scanning Market...' : '⚡ Force Immediate Scan'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideUp 0.3s ease-out' }}>
          
          {/* Detail Header Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Costo Proveedor Promedio</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {matchData?.myAverageCost ? `$${matchData.myAverageCost.toFixed(2)}` : 'N/A'}/mg
              </span>
            </div>
            
            <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Precio Mercado Promedio</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {historyData.length > 0 ? `$${historyData[historyData.length - 1].avgPpm.toFixed(2)}` : 'N/A'}/mg
                </span>
                {priceTrend === 'up' && <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>↑ Subiendo</span>}
                {priceTrend === 'down' && <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>↓ Bajando</span>}
                {priceTrend === 'stable' && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>— Estable</span>}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Margen Bruto (Retail)</span>
              {matchData?.myPPMs?.retail && historyData.length > 0 ? (
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: matchData.myPPMs.retail < historyData[historyData.length - 1].avgPpm ? '#10b981' : '#ef4444' }}>
                  {((historyData[historyData.length - 1].avgPpm - matchData.myPPMs.retail) / historyData[historyData.length - 1].avgPpm * 100).toFixed(1)}%
                </span>
              ) : (
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>N/A</span>
              )}
            </div>
          </div>

          {/* Dual Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Mis Proveedores */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-light)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Mis Proveedores (Sourcing)</h3>
              </div>
              {productDetails?.variants?.length > 0 ? (
                <DataTable 
                  columns={sourcingColumns} 
                  data={productDetails.variants} 
                  globalSearch={false}
                  pageSize={10}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay proveedores (variants) registrados para este producto.
                </div>
              )}
            </div>

            {/* Competidores Externos */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-light)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Competidores Externos (Mercado)</h3>
              </div>
              {matchData?.competitors?.length > 0 ? (
                <DataTable 
                  columns={marketColumns} 
                  data={matchData.competitors.sort((a,b) => (a.ppm || 999) - (b.ppm || 999))} 
                  globalSearch={false}
                  pageSize={10}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron competidores externos. Fuerza un escaneo si es un producto nuevo.
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
