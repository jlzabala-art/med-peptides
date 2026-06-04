import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import { Search, Plus, Loader2, CheckCircle, Database } from 'lucide-react';
import { Card } from '../ui';

const TARGET_ITEMS = [
  "AOD-9604 (5 mg)",
  "Kisspeptin 10-acetate (5 mg)",
  "hCG (5000 IU)",
  "Retatrutide (40 mg)",
  "Tirzepatide (60 mg)",
  "MOTS-C (40 mg)",
  "MOTS-C (60 mg)",
  "NAD+ (750 mg)",
  "BPC-157 (15 mg)",
  "TB-500 (45 mg)",
  "GLOW (10/10/75 mg)",
  "KLOW (10/10/75/10 mg)",
  "Tesamorelin (10 mg)",
  "Selank (10 mg)",
  "Thymosin Beta (45 mg)",
  "DSIP (5 mg)",
  "Epithalon (30 mg)",
  "Epithalon (100 mg)",
  "GHK-Cu (100 mg)",
  "SS-31 (50 mg)",
  "KPV (10 mg)",
  "PT 141 (20 mg)"
];

export default function AdminCatalogEnrichmentTab() {
  const [existingProducts, setExistingProducts] = useState([]);
  const [auditResults, setAuditResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrichingMap, setEnrichingMap] = useState({});

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      const dbProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setExistingProducts(dbProducts);

      const results = TARGET_ITEMS.map(item => {
        // Simple heuristic: just look at the base name before the parenthesis
        const baseName = item.split('(')[0].trim().toLowerCase();
        
        const found = dbProducts.find(p => 
          (p.name && p.name.toLowerCase().includes(baseName)) || 
          (p.displayName && p.displayName.toLowerCase().includes(baseName)) ||
          (p.slug && p.slug.includes(baseName.replace(/\s+/g, '-')))
        );

        return { item, found: !!found, productInfo: found };
      });
      
      setAuditResults(results);
    } catch (err) {
      console.error('Audit failed:', err);
    }
    setLoading(false);
  };

  const handleEnrichAndAdd = async (itemName) => {
    setEnrichingMap(prev => ({ ...prev, [itemName]: true }));
    try {
      const baseName = itemName.split('(')[0].trim();
      
      // 1. Ask Gemini to enrich this peptide
      const prompt = `As an expert biochemist, provide a valid JSON object for the peptide "${baseName}".
      It MUST follow exactly this structure, output ONLY raw JSON without markdown formatting:
      {
        "name": "${baseName}",
        "category": "Peptides",
        "description": "2-3 sentences explaining what it is.",
        "goals": ["Goal 1", "Goal 2"],
        "mechanismOfAction": "Short explanation of how it works.",
        "sideEffects": ["Effect 1", "Effect 2"]
      }`;

      const rawRes = await fetch('https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt, 
          history: [],
          context: { user_profile: { role: 'admin' } }
        })
      });

      if (!rawRes.ok) {
        throw new Error(`API Error: ${rawRes.statusText}`);
      }

      const resData = await rawRes.json();
      let enrichedData = {};
      
      try {
        const text = resData?.reply || resData?.text || resData?.result || resData;
        const cleaned = typeof text === 'string' ? text.replace(/^\`\`\`json\s*/i, '').replace(/\s*\`\`\`$/i, '').trim() : '{}';
        enrichedData = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("AI returned non-JSON, generating fallback data.", parseErr, res.data);
        enrichedData = {
          name: baseName,
          category: 'Peptides',
          description: `Automatically generated entry for ${baseName}.`,
          goals: ['General Health'],
          mechanismOfAction: 'Unknown',
          sideEffects: []
        };
      }

      // 2. Add to Firestore
      const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const docRef = doc(db, 'products', slug);
      
      await setDoc(docRef, {
        slug: slug,
        name: enrichedData.name || baseName,
        displayName: enrichedData.name || baseName,
        category: enrichedData.category || 'Peptides',
        description: enrichedData.description || '',
        goals: enrichedData.goals || [],
        mechanismOfAction: enrichedData.mechanismOfAction || '',
        sideEffects: enrichedData.sideEffects || [],
        createdAt: new Date().toISOString(),
        pricing: { cogs: 0, retail: 0 },
        stockCount: 0
      }, { merge: true });

      // Refresh Audit
      await runAudit();

    } catch (err) {
      console.error('Enrichment failed:', err);
      alert('Failed to enrich product: ' + err.message);
    }
    setEnrichingMap(prev => ({ ...prev, [itemName]: false }));
  };

  const missingCount = auditResults.filter(r => !r.found).length;
  const foundCount = auditResults.filter(r => r.found).length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Catalog Ingestion & Enrichment</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Auditing B2B Order Items (Magenta Compounding → LotusLand)
          </p>
        </div>
        <button 
          onClick={runAudit}
          disabled={loading}
          className="gcp-btn gcp-btn--secondary"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          Re-Audit Catalog
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-success)' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--color-success)' }}>{foundCount}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Products Found</span>
        </Card>
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#f59e0b' }}>{missingCount}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Missing Products</span>
        </Card>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <table className="gcp-table">
          <thead>
            <tr>
              <th>Order Item (Dose)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auditResults.map((res, i) => (
              <tr key={i} style={{ background: res.found ? 'transparent' : '#fffbeb' }}>
                <td style={{ fontWeight: 500 }}>{res.item}</td>
                <td>
                  {res.found ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle size={14} /> Available
                    </span>
                  ) : (
                    <span style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 600 }}>
                      Missing in DB
                    </span>
                  )}
                </td>
                <td>
                  {!res.found ? (
                    <button 
                      onClick={() => handleEnrichAndAdd(res.item)}
                      disabled={enrichingMap[res.item]}
                      className="gcp-btn gcp-btn--primary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
                    >
                      {enrichingMap[res.item] ? (
                        <><Loader2 size={14} className="spin" /> Enriching...</>
                      ) : (
                        <><Database size={14} /> Enrich & Add</>
                      )}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ID: {res.productInfo?.id}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
