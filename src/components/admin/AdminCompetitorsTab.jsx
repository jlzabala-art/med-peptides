/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ShieldAlert, RefreshCw, Plus, X, Globe, Save, Activity, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import AdminPageHeader from './AdminPageHeader';
import { useToast } from '../../hooks/useToast';
import CompetitorAnalysisWidget from './CompetitorAnalysisWidget';

export default function AdminCompetitorsTab() {
  const [cacheData, setCacheData] = useState({ matches: [], lastUpdated: null });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedTier, setSelectedTier] = useState('retail');
  
  const { toast } = useToast();

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState([
    { name: "UAE Peptides", url: "https://uaepeptides.com/collections/all" }
  ]);
  const [scrapeFrequency, setScrapeFrequency] = useState("Diario");
  
  const [newCompName, setNewCompName] = useState('');
  const [newCompUrl, setNewCompUrl] = useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const cacheDoc = await getDoc(doc(db, 'settings', 'competitor_cache'));
      if (cacheDoc.exists()) {
        setCacheData(cacheDoc.data());
      }
      
      const settingsDoc = await getDoc(doc(db, 'settings', 'competitor_analysis'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.urls) setCompetitorUrls(data.urls);
        else if (data.targetUrls) {
          setCompetitorUrls(data.targetUrls.map(url => ({ name: new URL(url).hostname.replace('www.',''), url })));
        }
        if (data.frequency) setScrapeFrequency(data.frequency);
      }

    } catch (err) {
      console.error('Error fetching competitor data', err);
      toast?.error('Error fetching competitor data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const forceScan = async () => {
    setScanning(true);
    try {
      toast?.info("Background Scan Triggered. This may take a minute.");
      const projectId = "med-peptides-app"; 
      const url = `https://us-central1-${projectId}.cloudfunctions.net/forceScrapeCompetitors`;
      await fetch(url, { method: 'POST' });
      
      setTimeout(() => {
        fetchData();
        setScanning(false);
        toast?.success("Scan completed. Data refreshed.");
      }, 7000); 

    } catch (err) {
      console.error(err);
      toast?.error('Error triggering scan');
      setScanning(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'competitor_analysis'), {
        urls: competitorUrls,
        frequency: scrapeFrequency
      }, { merge: true });
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

  const kpiStats = useMemo(() => {
    let cheaperCount = 0;
    let expensiveCount = 0;
    let totalMatches = cacheData.matches ? cacheData.matches.length : 0;

    (cacheData.matches || []).forEach(match => {
      const myPPM = match.myPPMs ? match.myPPMs[selectedTier] : null;
      let isOverallCheaper = true;
      let isOverallExpensive = true;
      
      if (!myPPM) return;

      match.competitors.forEach(comp => {
        const compPPM = comp.ppm;
        if (!compPPM) return;
        const diff = myPPM - compPPM;
        if (diff > 0.05) isOverallCheaper = false; // We are more expensive
        if (diff < -0.05) isOverallExpensive = false; // We are cheaper
      });

      if (isOverallCheaper && !isOverallExpensive) cheaperCount++;
      if (isOverallExpensive && !isOverallCheaper) expensiveCount++;
    });

    return { cheaperCount, expensiveCount, totalMatches };
  }, [cacheData, selectedTier]);

  // Inject AI Context
  useEffect(() => {
    const contextStr = (cacheData.matches || []).map(m => {
      const myPPM = m.myPPMs ? m.myPPMs[selectedTier] : 0;
      const comps = m.competitors.map(c => `${c.competitor_name} ($${c.ppm ? c.ppm.toFixed(2) : 0}/mg)`).join(', ');
      return `Product: ${m.productName} (Our ${selectedTier} PPM: $${myPPM ? myPPM.toFixed(2) : 0}). Competitors: ${comps}`;
    }).join('; ');

    window.dispatchEvent(new CustomEvent('admin-context-update', {
      detail: {
        page: 'competitor_analysis',
        summary: `Competitor pricing analysis active for tier ${selectedTier}. Found matches for ${kpiStats.totalMatches} products. We are cheaper on ${kpiStats.cheaperCount} products and more expensive on ${kpiStats.expensiveCount}. Detail: ${contextStr}`,
        suggestedActions: [
          `Based on competitors, suggest optimal pricing for our expensive products in the ${selectedTier} tier.`,
          'Summarize our market positioning.',
          'Are there any competitors undercutting our prices?'
        ]
      }
    }));
  }, [cacheData, selectedTier, kpiStats]);

  const lastUpdatedStr = cacheData.lastUpdated ? new Date(cacheData.lastUpdated).toLocaleString() : 'Never';

  return (
    <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
      <AdminPageHeader 
        title="Market & Competitor Analysis" 
        subtitle="Monitor competitor pricing for Vials and Peptides to maintain strategic advantage."
        icon={Activity}
      />

      {/* KPI Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Matches</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px' }}><Activity size={20} /></div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpiStats.totalMatches}</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Highly Competitive</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem', borderRadius: '8px' }}><CheckCircle size={20} /></div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpiStats.cheaperCount}</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Needs Adjustment</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px' }}><AlertCircle size={20} /></div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpiStats.expensiveCount}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          <select 
            value={selectedTier} 
            onChange={(e) => setSelectedTier(e.target.value)}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'rgba(59, 130, 246, 0.05)', color: 'var(--primary)', fontWeight: 700, outline: 'none' }}
          >
            <option value="retail">Compare: RETAIL Price</option>
            <option value="clinic">Compare: CLINIC Price</option>
            <option value="wholesaler">Compare: WHOLESALER Price</option>
            <option value="distributor">Compare: DISTRIBUTOR Price</option>
            <option value="master">Compare: MASTER Price</option>
          </select>

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
            {competitorUrls.map((comp, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '1rem 1.25rem', borderRadius: '12px', transition: 'all 0.2s', ':hover': { borderColor: 'var(--primary)', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {comp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{comp.url}</div>
                  </div>
                </div>
                <button onClick={() => removeCompetitor(idx)} style={{ color: 'var(--text-muted)', background: 'var(--bg-default)', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}><X size={16} /></button>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.01)', padding: '1.25rem', borderRadius: '12px', border: '1px dashed var(--border)', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Name</label>
              <TextField type="text" value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. Acme Peptides" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target URL</label>
              <TextField type="text" value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="https://..." />
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
      ) : (!cacheData.matches || cacheData.matches.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldAlert size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>No Match Data Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Try forcing a scan to retrieve the latest competitor pricing, or verify that your product names align with standard nomenclature.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {cacheData.matches.map((match, idx) => {
            const myPPM = match.myPPMs ? match.myPPMs[selectedTier] : 0;
            
            return (
              <div key={idx} style={{ 
                background: 'var(--bg-surface)', 
                borderRadius: '12px', 
                border: '1px solid var(--border)', 
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s',
              }}>
                <div style={{ 
                  padding: '1.25rem 1.5rem', 
                  background: 'linear-gradient(to right, rgba(0,0,0,0.02), transparent)', 
                  borderBottom: '1px solid var(--border)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>{match.productName}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Base Dosage: {match.myMg ? `${match.myMg}mg` : 'N/A'}</span>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, var(--primary), #00BCD4)', 
                    color: 'white', 
                    padding: '0.4rem 1rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0, 188, 212, 0.3)'
                  }}>
                    Our {selectedTier.toUpperCase()} PPM: ${myPPM ? myPPM.toFixed(2) : '0'}/mg
                  </div>
                </div>
                
                <div style={{ padding: '1rem 1.5rem' }}>
                  <CompetitorAnalysisWidget 
                    matchData={match.competitors} 
                    selectedTier={selectedTier}
                    myPPMs={match.myPPMs}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
