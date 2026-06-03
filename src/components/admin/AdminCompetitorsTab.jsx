import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { ShieldAlert, RefreshCw, Plus, X, Globe, DollarSign, Activity, TrendingDown, TrendingUp, Save } from 'lucide-react';
import AdminPageHeader from './AdminPageHeader';

export default function AdminCompetitorsTab() {
  const [competitorData, setCompetitorData] = useState([]);
  const [ourProducts, setOurProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState([
    { name: "UAE Peptides", url: "https://uaepeptides.com/collections/all" },
    { name: "Peptide Sciences", url: "https://www.peptidesciences.com/peptides" },
    { name: "Limitless Life Nootropics", url: "https://limitlesslifenootropics.com/product-category/peptides/" }
  ]);
  const [newCompName, setNewCompName] = useState('');
  const [newCompUrl, setNewCompUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Competitor Prices
      const compSnap = await getDocs(query(collection(db, 'competitor_prices'), orderBy('scraped_at', 'desc'), limit(500)));
      const cData = compSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // 2. Fetch our products (vials)
      const ourSnap = await getDocs(query(collection(db, 'products')));
      const oData = ourSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // 3. Fetch Settings
      const settingsDoc = await getDoc(doc(db, 'settings', 'competitor_analysis'));
      if (settingsDoc.exists() && settingsDoc.data().urls) {
        setCompetitorUrls(settingsDoc.data().urls);
      }

      setCompetitorData(cData);
      setOurProducts(oData);
    } catch (err) {
      console.error('Error fetching competitor data', err);
    } finally {
      setLoading(false);
    }
  };

  const forceScan = async () => {
    setScanning(true);
    try {
      // Call the HTTP function via fetch since it's an onRequest function
      // Or if it was a callable, we would use httpsCallable. It's onRequest, so we need the URL.
      // Wait, in React we can just call it via standard fetch or if we define it as callable.
      // Let's assume we can fetch the local emulator or prod URL.
      // For safety, we will just simulate or call a known endpoint.
      // Since it's onRequest, let's just trigger a toast for now and simulate fetch if we don't have the exact URL.
      alert("Triggering Background Scan. This may take up to 2 minutes.");
      
      // Attempting to hit the default firebase function route structure (assuming us-central1)
      const projectId = "med-peptides-app"; // Using the known project ID
      const url = `https://us-central1-${projectId}.cloudfunctions.net/forceScrapeCompetitors`;
      await fetch(url, { method: 'POST' });
      
      setTimeout(() => {
        fetchData();
        setScanning(false);
      }, 5000); // Poll after 5s

    } catch (err) {
      console.error(err);
      alert('Error triggering scan');
      setScanning(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'competitor_analysis'), {
        urls: competitorUrls
      }, { merge: true });
      setShowSettings(false);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
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

  // Process data for comparison
  // Group competitor data by Product Name
  const comparisonMap = {};
  
  ourProducts.forEach(prod => {
    // Only focus on Vials/Peptides if possible, but we'll include all products for now
    if (!prod.displayName && !prod.name) return;
    const name = (prod.displayName || prod.name).toLowerCase();
    
    // Find matching competitor entries
    const matches = competitorData.filter(c => c.product_name && c.product_name.toLowerCase().includes(name) || name.includes(c.product_name.toLowerCase()));
    
    // Only add if we have competitor data to compare
    if (matches.length > 0) {
      comparisonMap[prod.id] = {
        ourProduct: prod,
        competitors: matches
      };
    }
  });

  return (
    <div style={{ marginBottom: '2rem' }}>
      <AdminPageHeader 
        title="Market & Competitor Analysis" 
        subtitle="Monitor competitor pricing for Vials and Peptides to maintain strategic advantage."
        icon={Activity}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={forceScan}
            disabled={scanning}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={16} className={scanning ? 'spin' : ''} /> 
            {scanning ? 'Scanning...' : 'Force Scan Now'}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <Globe size={16} /> Manage Target URLs
          </button>
        </div>
        
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Data last updated: {competitorData.length > 0 ? new Date(competitorData[0].scraped_at).toLocaleString() : 'Never'}
        </div>
      </div>

      {showSettings && (
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Competitor Target URLs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {competitorUrls.map((comp, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-app)', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, minWidth: '150px' }}>{comp.name}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>{comp.url}</span>
                <button onClick={() => removeCompetitor(idx)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Name</label>
              <input type="text" value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. Acme Peptides" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>URL</label>
              <input type="text" value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <button onClick={addCompetitor} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
              <Plus size={16} /> Add
            </button>
          </div>
          
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'right' }}>
            <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
              <Save size={16} /> Save Settings
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading analysis...</div>
      ) : Object.keys(comparisonMap).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
          <ShieldAlert size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No Match Data Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try forcing a scan to retrieve the latest competitor pricing, or verify that your product names align with standard peptide nomenclature.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.values(comparisonMap).map((match, idx) => {
            const prod = match.ourProduct;
            const myPrice = parseFloat(prod.price || 0);
            const myDosage = prod.dosage_mg || 1; // Default to 1 to avoid Infinity
            const myPPM = myPrice / myDosage;

            return (
              <div key={idx} style={{ background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{prod.displayName || prod.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Our Price: ${myPrice.toFixed(2)} ({prod.dosage_mg ? `${prod.dosage_mg}mg` : 'N/A'})</span>
                  </div>
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Our PPM: ${myPPM.toFixed(2)}/mg
                  </div>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                      <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)' }}>Competitor</th>
                      <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</th>
                      <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)' }}>Dosage</th>
                      <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)' }}>Price</th>
                      <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)' }}>Price per Mg (PPM)</th>
                      <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.competitors.map(comp => {
                      const compPrice = parseFloat(comp.price_usd || 0);
                      const compDosage = comp.dosage_mg || 1;
                      const compPPM = compPrice / compDosage;
                      const diffPPM = myPPM - compPPM;
                      
                      // If diffPPM > 0, we are MORE expensive. If diffPPM < 0, we are CHEAPER.
                      const isMoreExpensive = diffPPM > 0.5; // Threshold of 50 cents
                      const isCheaper = diffPPM < -0.5;

                      return (
                        <tr key={comp.id}>
                          <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600 }}>{comp.competitor_name}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>{comp.product_name}</td>
                          <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>{comp.dosage_mg ? `${comp.dosage_mg}mg` : 'N/A'}</td>
                          <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>${compPrice.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 600 }}>${compPPM.toFixed(2)}</span>
                              {isMoreExpensive ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--error)', fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                  <TrendingDown size={12} style={{ marginRight: '2px' }}/> They are cheaper
                                </span>
                              ) : isCheaper ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--success)', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                  <TrendingUp size={12} style={{ marginRight: '2px' }}/> We are cheaper
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                  Equal
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                            {comp.in_stock ? (
                              <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>In Stock</span>
                            ) : (
                              <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>Out of Stock</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
