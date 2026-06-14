import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Save from "lucide-react/dist/esm/icons/save";
import Bot from "lucide-react/dist/esm/icons/bot";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Check from "lucide-react/dist/esm/icons/check";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import Layout from "lucide-react/dist/esm/icons/layout";
import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import Send from "lucide-react/dist/esm/icons/send";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb";
import History from "lucide-react/dist/esm/icons/history";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Activity from "lucide-react/dist/esm/icons/activity";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import React, { useState, useEffect, useRef } from 'react';
import { catalogRepository } from '../../repositories/catalogRepository';
import { productRepository } from '../../repositories/productRepository';
import { protocolRepository } from '../../repositories/protocolRepository';
import { emptyCatalog, CATALOG_STATUS } from '../../schemas/catalogSchema';
import CatalogPreviewPanel from './CatalogPreviewPanel';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';




















import { renderAIMarkdown } from '../shared/ClinicalAssistant/utils/markdownRenderer';

const CANONICAL_GOALS = ['cognitive_mood', 'hormonal_optimization', 'immune_support', 'longevity_anti_aging', 'metabolic_weight', 'recovery_repair', 'sleep_circadian'];
const GOAL_LABELS = { cognitive_mood: 'Cognitive & Mood', hormonal_optimization: 'Hormonal Optimization', immune_support: 'Immune Support', longevity_anti_aging: 'Longevity & Anti-Aging', metabolic_weight: 'Metabolic & Weight', recovery_repair: 'Recovery & Repair', sleep_circadian: 'Sleep & Circadian' };

const DISCOVERY_QUESTIONS = [
  { id: 'audience', label: "Target Audience", options: ["Physicians", "Clinics", "Pharmacies", "Distributors", "Consumers", "Researchers", "Use your judgement"] },
  { id: 'objective', label: "Primary Objective", options: ["Generate sales", "Generate leads", "Product education", "Distributor recruitment", "Product awareness", "SEO positioning", "Use your judgement"] },
  { id: 'pricing', label: "Pricing Strategy", options: ["No pricing", "Retail pricing", "Distributor pricing", "Medical pricing", "Multiple pricing levels", "Use your judgement"] },
  { id: 'language', label: "Language", options: ["English", "Spanish", "Arabic", "French", "German", "Multi-language", "Use your judgement"] },
  { id: 'style', label: "Communication Style", options: ["Scientific", "Medical", "Commercial", "Luxury", "Corporate", "Educational", "Use your judgement"] },
  { id: 'contentType', label: "Content Structure", options: ["Product pages", "Category pages", "Collection pages", "Landing pages", "Comparison pages", "Homepage sections", "Use your judgement"] },
  { id: 'detailLevel', label: "Information Detail", options: ["Product name only", "Short summary", "Commercial description", "Technical description", "Scientific overview", "Comprehensive product profile", "Use your judgement"] },
  { id: 'images', label: "Image Strategy", options: ["Existing images provided by user", "Existing database images", "AI-generated suggestions", "No image recommendations", "Use your judgement"] },
  { id: 'scientificDepth', label: "Scientific Depth", options: ["None", "Basic", "Intermediate", "Advanced", "Research-focused", "Use your judgement"] },
  { id: 'seo', label: "SEO Optimization", options: ["No", "Basic SEO", "Advanced SEO", "Use your judgement"] },
  { id: 'cta', label: "Call to Action", options: ["Contact sales", "Request quotation", "Request information", "Request sample", "Register account", "Buy online", "Use your judgement"] }
];

const QUICK_TEMPLATES = [
  { title: "Longevity Clinic", desc: "Anti-aging & Cellular Repair", icon: "⏳" },
  { title: "Weight Loss", desc: "Metabolic health focus", icon: "⚖️" },
  { title: "Hormonal Health", desc: "Balance & Optimization", icon: "🧬" },
  { title: "Compounding Pharmacy", desc: "Wholesale & bulk formulas", icon: "💊" },
  { title: "Aesthetic Medicine", desc: "Skin & Beauty focus", icon: "✨" },
  { title: "Functional Medicine", desc: "Root cause & wellness", icon: "🌿" }
];

export default function CatalogCreatorFlow({ ownerId, ownerType, editingCatalog = null, onBack }) {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId || ownerId;

  const [catalog, setCatalog] = useState(editingCatalog ? { ...editingCatalog } : emptyCatalog({ ownerId, ownerType }));
  const [allProducts, setAllProducts] = useState([]);
  const [allProtocols, setAllProtocols] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // New UI States
  const [prompt, setPrompt] = useState('');
  const [advancedSettings, setAdvancedSettings] = useState(DISCOVERY_QUESTIONS.reduce((acc, q) => ({...acc, [q.id]: 'Use your judgement'}), {}));
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepIndex, setGenStepIndex] = useState(0);
  const genSteps = ["Analyzing products...", "Building sections...", "Writing scientific content...", "Preparing catalog..."];
  const [errorState, setErrorState] = useState(null); // { message, details }
  const [aiRecommendations, setAiRecommendations] = useState([]); // Products recommended by AI
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [rightPanelTab, setRightPanelTab] = useState('summary'); // 'summary', 'preview'
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const promises = [productRepository.getCatalog(), protocolRepository.getProtocolTemplates()];
        if (ownerType === 'wholesaler' && tenantId) {
          promises.push(getDoc(doc(db, 'tenants', tenantId)));
        }
        const results = await Promise.all(promises);
        setAllProducts(results[0]);
        setAllProtocols(results[1]);

        if (results[2] && results[2].exists() && !editingCatalog) {
          const tenantData = results[2].data();
          if (tenantData.branding) setCatalog(prev => ({ ...prev, branding: tenantData.branding }));
        }
        if (!editingCatalog) {
          setCatalog(prev => ({
            ...prev,
            contactEmail: prev.contactEmail || userProfile?.email || '',
            contactPhone: prev.contactPhone || userProfile?.phone || userProfile?.phoneNumber || '',
          }));
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoadingDb(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenStepIndex(prev => (prev < genSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setGenStepIndex(0);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorState(null);
    setShowRecommendations(false);

    try {
      const combinedPrompt = `
        User Request: ${prompt}
        Constraints:
        ${Object.entries(advancedSettings).filter(([k,v]) => v !== 'Use your judgement').map(([k, v]) => `- ${k}: ${v}`).join('\n')}
      `;

      const response = await fetch('https://europe-west1-med-peptides-app.cloudfunctions.net/catalogAiAssistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}` },
        body: JSON.stringify({ mode: 'build_and_explain', query: combinedPrompt, products: allProducts, protocols: [], ownerId, ownerType })
      });

      const data = await response.json();
      if (data.extras && data.extras.catalogData) {
        const suggestedCatalog = data.extras.catalogData;
        const extractedIds = [];
        if (suggestedCatalog.sections && Array.isArray(suggestedCatalog.sections)) {
          suggestedCatalog.sections.forEach(sec => {
            if (sec.products && Array.isArray(sec.products)) {
              sec.products.forEach(pId => extractedIds.push(pId));
            }
          });
        }
        // Populate recommendations instead of auto-applying if there were no previous items
        if ((catalog.sections[0]?.products?.length || 0) === 0) {
          setAiRecommendations(extractedIds);
          setShowRecommendations(true);
          setCatalog(prev => ({ ...prev, ...suggestedCatalog, selectedProducts: [] })); // keep settings but dont apply products yet
        } else {
          const uniqueIds = [...new Set([...(catalog.selectedProducts || []), ...extractedIds])];
          setCatalog(prev => ({
            ...prev,
            ...suggestedCatalog,
            selectedProducts: uniqueIds,
            sections: [{ title: 'Featured', products: uniqueIds, protocols: catalog.sections[0]?.protocols || [] }]
          }));
        }
      } else {
        throw new Error(data.message || 'Failed to parse AI response. Check network or server logs.');
      }
    } catch (error) {
      setErrorState({ message: "Catalog Generation Failed", details: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptRecommendations = () => {
    setCatalog(prev => ({
      ...prev,
      selectedProducts: [...new Set([...(prev.selectedProducts || []), ...aiRecommendations])],
      sections: [{ title: 'AI Suggested', products: aiRecommendations, protocols: [] }]
    }));
    setShowRecommendations(false);
  };

  const handleProductToggle = (prodId) => {
    setCatalog(prev => {
      const sections = [...prev.sections];
      if (sections.length === 0) sections.push({ title: 'Featured Selection', products: [], protocols: [] });
      const selected = sections[0].products || [];
      const isSelected = selected.includes(prodId);
      sections[0].products = isSelected ? selected.filter(id => id !== prodId) : [...selected, prodId];
      return { ...prev, sections, selectedProducts: sections[0].products };
    });
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const finalCatalog = { ...catalog, status: publish ? CATALOG_STATUS.PUBLISHED : CATALOG_STATUS.DRAFT };
      await catalogRepository.saveCatalog(finalCatalog);
      alert(publish ? 'Catalog published successfully!' : 'Catalog saved as draft.');
      onBack();
    } catch (e) {
      alert(`Save error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loadingDb) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Database...</div>;

  const selectedProductsInFlow = catalog.sections[0]?.products || [];
  // Calculate Scores
  const calculateScore = () => {
    let score = 50;
    if (selectedProductsInFlow.length > 5) score += 20;
    if (catalog.title) score += 10;
    if (advancedSettings.seo !== 'Use your judgement' && advancedSettings.seo !== 'No') score += 10;
    if (advancedSettings.scientificDepth !== 'Use your judgement' && advancedSettings.scientificDepth !== 'None') score += 10;
    return Math.min(score, 100);
  };
  const sciScore = calculateScore();
  const comScore = Math.min(sciScore + 12, 98);
  const seoScore = Math.min(sciScore - 5, 92);

  // Layouts
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 100px)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #dadce0', overflow: 'hidden' }}>
      {/* LEFT PANEL: AI Prompt & Settings */}
      <div style={{ width: isMobile ? '100%' : '55%', borderRight: isMobile ? 'none' : '1px solid #dadce0', display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#5f6368', cursor: 'pointer', marginBottom: '1.5rem', padding: 0, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#202124', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>What catalog would you like to create?</h1>
        <p style={{ color: '#5f6368', marginBottom: '1.5rem' }}>Describe your ideal product portfolio, or use a template below.</p>

        {/* QUICK TEMPLATES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
          {QUICK_TEMPLATES.map((tpl, i) => (
            <div key={i} onClick={() => setPrompt(`Create a ${tpl.title} catalog. Focus on: ${tpl.desc}.`)} style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: prompt.includes(tpl.title) ? '#e8eaed' : '#fff' }} onMouseOver={e => e.currentTarget.style.borderColor = '#1a73e8'} onMouseOut={e => e.currentTarget.style.borderColor = '#dadce0'}>
              <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{tpl.icon}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#202124' }}>{tpl.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>{tpl.desc}</div>
            </div>
          ))}
        </div>

        {/* AI PROMPT INPUT */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'I need a highly scientific catalog for a Longevity Clinic featuring NAD+, BPC-157, and Epithalon. It should be targeted at physicians.'"
          style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px', border: '2px solid #e8eaed', fontSize: '1rem', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s', fontFamily: 'inherit', marginBottom: '1.5rem' }}
          onFocus={e => e.target.style.borderColor = '#1a73e8'}
          onBlur={e => e.target.style.borderColor = '#e8eaed'}
        />

        {/* ADVANCED SETTINGS COLLAPSIBLE */}
        <div style={{ border: '1px solid #dadce0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#3c4043' }}>
            <span>Advanced Settings</span>
            {isAdvancedOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {isAdvancedOpen && (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#fff' }}>
              {DISCOVERY_QUESTIONS.map(q => (
                <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368' }}>{q.label}</label>
                  <select 
                    value={advancedSettings[q.id]} 
                    onChange={e => setAdvancedSettings(prev => ({...prev, [q.id]: e.target.value}))}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #dadce0', fontSize: '0.85rem', outline: 'none' }}
                  >
                    {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ERROR STATE */}
        {errorState && (
          <div style={{ padding: '16px', backgroundColor: '#fce8e6', borderRadius: '8px', border: '1px solid #fad2cf', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle color="#d93025" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#c5221f', fontSize: '0.9rem' }}>{errorState.message}</h4>
              <p style={{ margin: '0 0 12px 0', color: '#3c4043', fontSize: '0.8rem' }}>{errorState.details}</p>
              <button onClick={handleGenerate} style={{ padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Retry Generation</button>
            </div>
          </div>
        )}

        {/* STICKY BOTTOM ACTION */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', alignItems: 'center', gap: '16px', position: isMobile ? 'sticky' : 'relative', bottom: isMobile ? 0 : 'auto', background: '#fff', zIndex: 10 }}>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            style={{ flex: 1, padding: '16px', borderRadius: '32px', border: 'none', backgroundColor: isGenerating || !prompt.trim() ? '#e8eaed' : '#1a73e8', color: isGenerating || !prompt.trim() ? '#9aa0a6' : '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: isGenerating || !prompt.trim() ? 'none' : '0 4px 12px rgba(26,115,232,0.3)' }}
          >
            {isGenerating ? (
              <><RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> {genSteps[genStepIndex]}</>
            ) : (
              <><Sparkles size={20} /> Generate Catalog</>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Live Summary / Preview */}
      <div style={{ width: isMobile ? '100%' : '45%', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #dadce0', background: '#fff' }}>
          <button onClick={() => setRightPanelTab('summary')} style={{ flex: 1, padding: '16px', border: 'none', background: rightPanelTab === 'summary' ? '#f8f9fa' : '#fff', borderBottom: rightPanelTab === 'summary' ? '2px solid #1a73e8' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, color: rightPanelTab === 'summary' ? '#1a73e8' : '#5f6368' }}>Catalog Summary</button>
          <button onClick={() => setRightPanelTab('preview')} style={{ flex: 1, padding: '16px', border: 'none', background: rightPanelTab === 'preview' ? '#f8f9fa' : '#fff', borderBottom: rightPanelTab === 'preview' ? '2px solid #1a73e8' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, color: rightPanelTab === 'preview' ? '#1a73e8' : '#5f6368' }}>Visual Preview</button>
        </div>

        {rightPanelTab === 'summary' ? (
          <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#202124', marginBottom: '1.5rem' }}>{catalog.title || 'Untitled Catalog'}</h3>
            {/* AI SCORE CARDS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ flex: 1, background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dadce0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f9d58' }}>{sciScore}%</div>
                <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px' }}>Scientific</div>
              </div>
              <div style={{ flex: 1, background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dadce0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a73e8' }}>{comScore}%</div>
                <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px' }}>Commercial</div>
              </div>
              <div style={{ flex: 1, background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dadce0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f29900' }}>{seoScore}%</div>
                <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px' }}>SEO Ready</div>
              </div>
            </div>

            {/* AI RECOMMENDATIONS */}
            {showRecommendations && aiRecommendations.length > 0 && (
              <div style={{ background: '#e8f0fe', padding: '1.5rem', borderRadius: '12px', border: '1px solid #d2e3fc', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} /> AI Recommended Products</h4>
                <p style={{ fontSize: '0.85rem', color: '#1967d2', marginBottom: '16px' }}>Based on your prompt, I suggest including these {aiRecommendations.length} products in your catalog.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {aiRecommendations.slice(0, 6).map(id => {
                    const p = allProducts.find(x => x.id === id || x.slug === id);
                    return p ? <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', background: '#fff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #aecbfa' }}><Check size={14} color="#1a73e8" /> {p.displayName || p.name}</div> : null;
                  })}
                  {aiRecommendations.length > 6 && <div style={{ fontSize: '0.8rem', color: '#1967d2', padding: '6px 10px' }}>+ {aiRecommendations.length - 6} more</div>}
                </div>
                <button onClick={handleAcceptRecommendations} style={{ width: '100%', padding: '10px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Accept Recommendations</button>
              </div>
            )}

            {/* PRODUCT LIST */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#202124' }}>Selected Items ({selectedProductsInFlow.length})</h4>
              <button onClick={() => setShowSearchModal(true)} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14} /> Add Manual</button>
            </div>

            {selectedProductsInFlow.length === 0 && !showRecommendations ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#fff', border: '2px dashed #dadce0', borderRadius: '12px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#202124' }}>No products added yet</h4>
                <p style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: '1.5rem' }}>Describe your catalog on the left, or add products manually to get started.</p>
                <button onClick={() => setPrompt("Atlas AI, please recommend a balanced selection of products for my catalog.")} style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '24px', fontWeight: 600, color: '#1a73e8', cursor: 'pointer' }}>Ask AI to recommend products</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedProductsInFlow.map(id => {
                  const p = allProducts.find(x => x.id === id || x.slug === id);
                  if (!p) return null;
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #dadce0', padding: '12px 16px', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#202124', fontSize: '0.9rem' }}>{p.displayName || p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>{p.category || 'Product'}</div>
                      </div>
                      <button onClick={() => handleProductToggle(id)} style={{ background: 'none', border: 'none', color: '#d93025', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Remove</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SAVE CONTROLS */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #dadce0' }}>
              <button onClick={() => handleSave(false)} disabled={saving} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', fontWeight: 600, color: '#5f6368', cursor: 'pointer' }}>Save Draft</button>
              <button onClick={() => handleSave(true)} disabled={saving} style={{ flex: 1, padding: '12px', background: '#0f9d58', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Publish Catalog</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
            <CatalogPreviewPanel catalog={catalog} products={allProducts} protocols={allProtocols} />
          </div>
        )}
      </div>

      {/* MODALS */}
      {showSearchModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '500px', height: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #dadce0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Add Product</h3>
              <button onClick={() => setShowSearchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ padding: '16px', borderBottom: '1px solid #dadce0', background: '#f8f9fa' }}>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dadce0', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {allProducts.filter(p => (p.displayName || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map(p => {
                const isSelected = selectedProductsInFlow.includes(p.id);
                return (
                  <div key={p.id} onClick={() => handleProductToggle(p.id)} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f1f3f4' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#202124' }}>{p.displayName || p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>{p.category}</div>
                    </div>
                    {isSelected && <Check color="#1a73e8" size={18} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}