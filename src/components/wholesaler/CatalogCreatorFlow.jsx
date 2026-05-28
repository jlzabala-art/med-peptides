import React, { useState, useEffect } from 'react';
import { catalogRepository } from '../../repositories/catalogRepository';
import { productRepository } from '../../repositories/productRepository';
import { protocolRepository } from '../../repositories/protocolRepository';
import { generateCatalogContent } from '../../services/catalogAIService';
import { emptyCatalog, CATALOG_STATUS, CATALOG_AUDIENCE, CATALOG_OWNER_TYPE } from '../../schemas/catalogSchema';
import CatalogPreviewPanel from './CatalogPreviewPanel';
import { 
  ArrowLeft, ArrowRight, Save, Bot, Sparkles, Check, 
  Trash2, Plus, Info, Layout, Users, Shield, Copy, Edit2
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Goal & Type', desc: 'Define catalog purpose' },
  { id: 2, name: 'Target Audience', desc: 'Who is this for?' },
  { id: 3, name: 'Products & Protocols', desc: 'Select items' },
  { id: 4, name: 'Pricing & Territory', desc: 'Visibility and protections' },
  { id: 5, name: 'AI Copy Gen', desc: 'Generate marketing content' },
  { id: 6, name: 'Branding & Details', desc: 'Customize styling' },
  { id: 7, name: 'Review & Publish', desc: 'Final checks and live link' }
];

export default function CatalogCreatorFlow({ ownerId, ownerType, editingCatalog = null, onBack }) {
  const [activeStep, setActiveStep] = useState(1);
  const [catalog, setCatalog] = useState(editingCatalog ? { ...editingCatalog } : emptyCatalog({ ownerId, ownerType }));
  
  // Database options
  const [allProducts, setAllProducts] = useState([]);
  const [allProtocols, setAllProtocols] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Flow control & wizard helpers
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Brand overrides
  const [companyName, setCompanyName] = useState(catalog.branding?.companyName || '');
  const [primaryColor, setPrimaryColor] = useState(catalog.branding?.primaryColor || '#1a73e8');
  const [logoUrl, setLogoUrl] = useState(catalog.branding?.logoUrl || '');
  const [contactEmail, setContactEmail] = useState(catalog.branding?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(catalog.branding?.contactPhone || '');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, protoList] = await Promise.all([
          productRepository.getCatalog(),
          protocolRepository.getProtocolTemplates()
        ]);
        setAllProducts(prodList);
        setAllProtocols(protoList);
      } catch (e) {
        console.error('Error fetching catalog assets:', e);
      } finally {
        setLoadingDb(false);
      }
    }
    loadData();
  }, []);

  const handleGoalSelect = (goalKey) => {
    setCatalog(prev => ({
      ...prev,
      goal: goalKey,
      title: prev.title || `${goalKey.charAt(0).toUpperCase() + goalKey.slice(1)} Portfolio`,
      slug: prev.slug || `${goalKey}-${Math.floor(Math.random() * 10000)}`
    }));
  };

  const handleProductToggle = (prodId) => {
    setCatalog(prev => {
      const selected = prev.sections[0]?.products || [];
      const isSelected = selected.includes(prodId);
      const nextProducts = isSelected 
        ? selected.filter(id => id !== prodId)
        : [...selected, prodId];

      const sections = [...prev.sections];
      if (sections.length === 0) {
        sections.push({ title: 'Featured Products', description: 'Recommended peptides and supplements.', products: nextProducts, protocols: [] });
      } else {
        sections[0] = { ...sections[0], products: nextProducts };
      }
      return { ...prev, sections };
    });
  };

  const handleProtocolToggle = (protoId) => {
    setCatalog(prev => {
      const selected = prev.sections[0]?.protocols || [];
      const isSelected = selected.includes(protoId);
      const nextProtocols = isSelected
        ? selected.filter(id => id !== protoId)
        : [...selected, protoId];

      const sections = [...prev.sections];
      if (sections.length === 0) {
        sections.push({ title: 'Featured Products', description: 'Recommended peptides and supplements.', products: [], protocols: nextProtocols });
      } else {
        sections[0] = { ...sections[0], protocols: nextProtocols };
      }
      return { ...prev, sections };
    });
  };

  // AI Recommendation Wizard: Uses pre-loaded products and filters them based on theme
  const runAiRecommender = () => {
    const goalLower = (catalog.goal || '').toLowerCase();
    
    // Quick keyword matchmaking for products
    const recommendedProductIds = allProducts.filter(p => {
      const name = p.name.toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      const goals = (p.goals || []).map(g => g.toLowerCase());
      
      if (goalLower.includes('weight') || goalLower.includes('metabolism')) {
        return name.includes('semaglutide') || name.includes('tirzepatide') || name.includes('glp') || goals.includes('weight loss');
      }
      if (goalLower.includes('longevity') || goalLower.includes('anti-aging')) {
        return name.includes('epitalon') || name.includes('nad') || name.includes('ghrp') || goals.includes('longevity');
      }
      if (goalLower.includes('cognition') || goalLower.includes('brain')) {
        return name.includes('semax') || name.includes('selank') || name.includes('dihexa') || goals.includes('cognitive enhancement');
      }
      if (goalLower.includes('sleep') || goalLower.includes('recovery')) {
        return name.includes('dsip') || name.includes('bpc') || name.includes('tb-500') || goals.includes('sleep');
      }
      return true; // fallback
    }).slice(0, 5).map(p => p.id);

    // Filter protocols
    const recommendedProtocolIds = allProtocols.filter(p => {
      const primaryGoal = (p.primary_goal || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return primaryGoal.includes(goalLower) || name.includes(goalLower);
    }).slice(0, 2).map(p => p.id);

    setCatalog(prev => {
      const sections = [{
        title: prev.sections[0]?.title || 'AI Recommended Program',
        description: prev.sections[0]?.description || `Optimized selection for ${prev.goal}.`,
        products: recommendedProductIds,
        protocols: recommendedProtocolIds
      }];
      return { ...prev, sections };
    });

    alert('AI Selection Wizard has prepopulated matching products & protocols.');
  };

  // Step 5: Trigger real Vertex AI generation for copywriting and FAQ sections
  const handleAiCopyGen = async () => {
    setAiGenerating(true);
    try {
      const selectedProducts = allProducts.filter(p => 
        catalog.sections[0]?.products?.includes(p.id)
      );
      const selectedProtocols = allProtocols.filter(p => 
        catalog.sections[0]?.protocols?.includes(p.id)
      );

      const generated = await generateCatalogContent({
        goal: customGoal || catalog.goal || 'General Health Optimization',
        audience: catalog.audience || 'doctors',
        products: selectedProducts,
        protocols: selectedProtocols,
        territory: catalog.territory,
        recipientName,
        clinicName
      });

      if (generated) {
        setCatalog(prev => ({
          ...prev,
          heroTitle: generated.heroTitle || prev.heroTitle,
          heroSubtitle: generated.heroSubtitle || prev.heroSubtitle,
          heroDescription: generated.heroDescription || prev.heroDescription,
          sections: generated.sections?.map((sec, sIdx) => ({
            title: sec.title,
            description: sec.description,
            products: sec.products || prev.sections[sIdx]?.products || [],
            protocols: sec.protocols || prev.sections[sIdx]?.protocols || []
          })) || prev.sections,
          faq: generated.faq || prev.faq,
          upsells: generated.upsells || prev.upsells,
          crossSellRecommendations: generated.crossSellRecommendations || prev.crossSellRecommendations,
          disclaimer: generated.disclaimer || prev.disclaimer
        }));
      }
    } catch (e) {
      alert(`AI Copy generation error: ${e.message}. Falling back to default templates.`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const finalBranding = companyName || primaryColor || logoUrl || contactEmail || contactPhone ? {
        companyName,
        primaryColor,
        logoUrl,
        contactEmail,
        contactPhone
      } : null;

      const finalCatalog = {
        ...catalog,
        branding: finalBranding,
        status: publish ? CATALOG_STATUS.PUBLISHED : CATALOG_STATUS.DRAFT
      };

      await catalogRepository.saveCatalog(finalCatalog);
      alert(publish ? 'Catalog published successfully!' : 'Catalog saved as draft.');
      onBack();
    } catch (e) {
      alert(`Save error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loadingDb) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5f6368', fontFamily: 'Inter, sans-serif' }}>Loading database structures & assets...</div>;
  }

  const selectedProductsInFlow = catalog.sections[0]?.products || [];
  const selectedProtocolsInFlow = catalog.sections[0]?.protocols || [];

  return (
    <div style={splitScreenContainerStyle}>
      {/* FULL WIDTH: Builder Flow */}
      <div style={{ ...builderPanelStyle, width: '100%', borderRight: 'none' }}>
        
        {/* Header */}
        <div style={flowHeaderStyle}>
          <button onClick={onBack} style={backLinkStyle}>
            <ArrowLeft size={16} /> Back to list
          </button>
          <h2 style={flowTitleStyle}>{editingCatalog ? 'Edit' : 'Create'} B2B Catalog</h2>
          <button onClick={() => setShowPreviewModal(true)} style={{ ...actionButtonStyle, backgroundColor: 'var(--color-bg-app)', color: '#1a73e8', border: '1px solid #1a73e8' }}>
            <Layout size={14} style={{ marginRight: 4 }} /> Preview Catalog
          </button>
        </div>

        {/* Stepper progress */}
        <div style={stepperStyle}>
          {STEPS.map(step => (
            <div 
              key={step.id} 
              onClick={() => setActiveStep(step.id)}
              style={{
                ...stepItemStyle,
                color: activeStep === step.id ? '#1a73e8' : '#5f6368',
                borderBottom: activeStep === step.id ? '2px solid #1a73e8' : '2px solid transparent'
              }}
            >
              <div style={stepNumStyle}>{step.id}</div>
              <div style={stepNameStyle}>{step.name}</div>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <div style={formBodyStyle}>
          {activeStep === 1 && (
            <div style={stepContentStyle}>
              <h3>Step 1: Select Catalog Category & Main Focus</h3>
              <p style={helpTextStyle}>The core goal dictates how AI structure recommender curates product highlights.</p>
              
              <div style={goalsGridStyle}>
                {['longevity', 'weight-management', 'cognitive-enhancement', 'sleep-and-recovery', 'muscle-growth'].map(g => (
                  <button
                    key={g}
                    onClick={() => handleGoalSelect(g)}
                    style={{
                      ...goalCardStyle,
                      borderColor: catalog.goal === g ? '#1a73e8' : '#dadce0',
                      backgroundColor: catalog.goal === g ? '#e8f0fe' : 'var(--color-bg-surface)'
                    }}
                  >
                    <Sparkles size={20} color={catalog.goal === g ? '#1a73e8' : '#5f6368'} />
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {g.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Catalog Title</label>
                <input 
                  type="text" 
                  value={catalog.title}
                  onChange={(e) => setCatalog(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Longevity & Cellular Repair Portfolio"
                  style={inputStyle}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>URL Slug</label>
                <input 
                  type="text" 
                  value={catalog.slug}
                  onChange={(e) => setCatalog(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  placeholder="e.g., longevity-portfolio"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div style={stepContentStyle}>
              <h3>Step 2: Define Target Audience</h3>
              <p style={helpTextStyle}>AI writing style changes to match the medical depth of the audience.</p>

              <div style={audienceOptionsStyle}>
                {Object.entries(CATALOG_AUDIENCE).map(([key, val]) => (
                  <label key={key} style={{
                    ...audienceLabelStyle,
                    borderColor: catalog.audience === val ? '#1a73e8' : '#dadce0',
                    backgroundColor: catalog.audience === val ? '#e8f0fe' : 'var(--color-bg-surface)'
                  }}>
                    <input 
                      type="radio" 
                      name="audience" 
                      value={val}
                      checked={catalog.audience === val}
                      onChange={() => setCatalog(prev => ({ ...prev, audience: val }))}
                      style={{ marginRight: '8px' }}
                    />
                    <div>
                      <strong style={{ textTransform: 'capitalize' }}>{val}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#5f6368' }}>
                        {val === 'doctors' ? 'Focuses on IUPAC, scientific PMIDs, protocols, dosage.' :
                         val === 'patients' ? 'Focuses on benefits, safety, straightforward explanations.' : 
                         'Focuses on pricing, supply margins, wholesale packages.'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div style={stepContentStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Step 3: Select Products & Protocols</h3>
                <button onClick={runAiRecommender} style={wizardButtonStyle}>
                  <Bot size={14} /> AI Recommendation Wizard
                </button>
              </div>

              <h4 style={sectionHeaderStyle}>Peptides & Supplements ({allProducts.length})</h4>
              <div style={listGridStyle}>
                {allProducts.map(prod => (
                  <label key={prod.id} style={checkboxRowStyle}>
                    <input 
                      type="checkbox"
                      checked={selectedProductsInFlow.includes(prod.id)}
                      onChange={() => handleProductToggle(prod.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <span>{prod.displayName || prod.name}</span>
                  </label>
                ))}
              </div>

              <h4 style={{ ...sectionHeaderStyle, marginTop: '1.5rem' }}>Clinical Protocols ({allProtocols.length})</h4>
              <div style={listGridStyle}>
                {allProtocols.map(proto => (
                  <label key={proto.id} style={checkboxRowStyle}>
                    <input 
                      type="checkbox"
                      checked={selectedProtocolsInFlow.includes(proto.id)}
                      onChange={() => handleProtocolToggle(proto.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <span>{proto.name || proto.protocol_id}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div style={stepContentStyle}>
              <h3>Step 4: Pricing Rules & Territory Protection</h3>
              
              <div style={formFieldStyle}>
                <label style={checkboxLabelStyle}>
                  <input 
                    type="checkbox"
                    checked={catalog.pricingVisible}
                    onChange={(e) => setCatalog(prev => ({ ...prev, pricingVisible: e.target.checked }))}
                    style={{ marginRight: '8px' }}
                  />
                  <span>Show pricing inside the catalog mini-site</span>
                </label>
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Assigned Territory Geo IDs</label>
                <input 
                  type="text" 
                  value={catalog.territory}
                  onChange={(e) => setCatalog(prev => ({ ...prev, territory: e.target.value }))}
                  placeholder="e.g., US, CA, EU"
                  style={inputStyle}
                />
                <p style={helpTextStyle}>Limits lead capturing & checkout protections to these geo IDs.</p>
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div style={stepContentStyle}>
              <h3>Step 5: AI Copy Generation (Vertex AI Agent)</h3>
              <p style={helpTextStyle}>Generate clinical copy, customized sections, FAQs, and cross-sell combinations based on your selected catalog details.</p>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Target Recipient Doctor/Clinic (Optional)</label>
                <input 
                  type="text" 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Dr. Jane Smith"
                  style={inputStyle}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Target Clinic Name (Optional)</label>
                <input 
                  type="text" 
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g., Longevity Center of LA"
                  style={inputStyle}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Focus Goal / Prompt details for AI Copy</label>
                <textarea 
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Custom merchandising focus, highlights, or requirements..."
                  style={textareaStyle}
                />
              </div>

              <button 
                onClick={handleAiCopyGen}
                disabled={aiGenerating || selectedProductsInFlow.length === 0} 
                style={{
                  ...actionButtonStyle,
                  backgroundColor: '#137333',
                  opacity: selectedProductsInFlow.length === 0 ? 0.5 : 1
                }}
              >
                {aiGenerating ? <Sparkles size={16} style={spinningIconStyle} /> : <Bot size={16} />}
                {aiGenerating ? 'Vertex AI Generating Copy...' : 'Generate Copy via Vertex AI'}
              </button>
            </div>
          )}

          {activeStep === 6 && (
            <div style={stepContentStyle}>
              <h3>Step 6: White-Label Branding Overrides</h3>
              <p style={helpTextStyle}>Set brand name, colors, logo, and WhatsApp/Email routing configuration.</p>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Company Name / Brand Header</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Apex Regenerative Labs"
                  style={inputStyle}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Primary Color (Hex)</label>
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: '60px', height: '36px', padding: 0 }}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Logo Image URL</label>
                <input 
                  type="text" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  style={inputStyle}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Inquiry Routing Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="leads@partnerbrand.com"
                  style={inputStyle}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={labelStyle}>Inquiry Routing WhatsApp / Phone (e.g. +14155552671)</label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+14155552671"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {activeStep === 7 && (
            <div style={stepContentStyle}>
              <h3>Step 7: Final Review & Publish</h3>
              <p style={helpTextStyle}>Confirm your catalog parameters before deploying it live on Med-Peptides catalog mini-site platform.</p>

              <div style={reviewBlockStyle}>
                <div><strong>Title:</strong> {catalog.title}</div>
                <div><strong>Slug:</strong> /catalog/{catalog.slug}</div>
                <div><strong>Focus:</strong> {catalog.goal}</div>
                <div><strong>Audience:</strong> {catalog.audience}</div>
                <div><strong>Products Selected:</strong> {selectedProductsInFlow.length}</div>
                <div><strong>Protocols Selected:</strong> {selectedProtocolsInFlow.length}</div>
                <div><strong>Territory assigned:</strong> {catalog.territory}</div>
              </div>

              <div style={buttonGroupStyle}>
                <button 
                  onClick={() => handleSave(false)} 
                  disabled={saving} 
                  style={{ ...actionButtonStyle, backgroundColor: '#5f6368' }}
                >
                  <Save size={16} /> Save Draft
                </button>
                <button 
                  onClick={() => handleSave(true)} 
                  disabled={saving} 
                  style={{ ...actionButtonStyle, backgroundColor: '#1a73e8' }}
                >
                  <Check size={16} /> Publish Catalog Live
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Navigation */}
        <div style={navigationFooterStyle}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              style={wizardPrevButtonStyle}
            >
              Previous
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowPreviewModal(true)}
              style={{ ...actionButtonStyle, backgroundColor: 'var(--color-bg-surface)', color: '#1a73e8', border: '1px solid #1a73e8' }}
            >
              <Layout size={14} /> Live Preview
            </button>
            <button 
              onClick={() => setActiveStep(prev => Math.min(STEPS.length, prev + 1))}
              disabled={activeStep === STEPS.length}
              style={wizardNextButtonStyle}
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Live Preview Panel */}
      {showPreviewModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#202124', fontWeight: 600 }}>
                Live Catalog Preview
              </h3>
              <button onClick={() => setShowPreviewModal(false)} style={modalCloseButtonStyle}>
                ✕
              </button>
            </div>
            <div style={modalBodyStyle}>
              <CatalogPreviewPanel 
                catalog={{
                  ...catalog,
                  branding: {
                    companyName,
                    primaryColor,
                    logoUrl,
                    contactEmail,
                    contactPhone
                  }
                }}
                products={allProducts}
                protocols={allProtocols}
                recipientName={recipientName}
                clinicName={clinicName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles (Google Cloud inspired) ──────────────────────────────────────────
const splitScreenContainerStyle = {
  display: 'flex',
  height: 'calc(100vh - 120px)',
  background: 'var(--color-bg-surface)',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  overflow: 'hidden',
  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 2px 6px 2px rgba(60,64,67,0.15)',
};

const builderPanelStyle = {
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #dadce0',
  background: 'var(--color-bg-surface)',
};

const previewPanelStyle = {
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--color-bg-app)',
};

const flowHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #dadce0',
};

const backLinkStyle = {
  background: 'none',
  border: 'none',
  color: '#1a73e8',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: 0,
  marginBottom: '0.5rem',
};

const flowTitleStyle = {
  margin: 0,
  fontSize: '1.2rem',
  color: '#202124',
  fontWeight: 600,
};

const stepperStyle = {
  display: 'flex',
  borderBottom: '1px solid #dadce0',
  backgroundColor: 'var(--color-bg-app)',
  overflowX: 'auto',
};

const stepItemStyle = {
  padding: '0.75rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const stepNumStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
};

const stepNameStyle = {
  fontSize: '0.8rem',
};

const formBodyStyle = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
};

const stepContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const helpTextStyle = {
  margin: 0,
  fontSize: '0.8rem',
  color: '#5f6368',
};

const goalsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.75rem',
};

const goalCardStyle = {
  padding: '1rem',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.15s ease',
};

const formFieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#3c4043',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.85rem',
  cursor: 'pointer',
  color: '#3c4043',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
};

const textareaStyle = {
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
  minHeight: '100px',
  resize: 'vertical',
};

const audienceOptionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const audienceLabelStyle = {
  border: '1px solid #dadce0',
  borderRadius: '8px',
  padding: '1rem',
  display: 'flex',
  alignItems: 'flex-start',
  cursor: 'pointer',
};

const listGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '0.5rem',
  maxHeight: '150px',
  overflowY: 'auto',
  border: '1px solid #dadce0',
  borderRadius: '4px',
  padding: '0.75rem',
};

const checkboxRowStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: '#3c4043',
  cursor: 'pointer',
};

const wizardButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: '#f1f3f4',
  color: '#1a73e8',
  border: '1px solid #dadce0',
  borderRadius: '4px',
  padding: '6px 12px',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const wizardPrevButtonStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  color: '#1a73e8',
  border: '1px solid #dadce0',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const wizardNextButtonStyle = {
  backgroundColor: '#1a73e8',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const sectionHeaderStyle = {
  margin: '1rem 0 0.5rem 0',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#5f6368',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const reviewBlockStyle = {
  backgroundColor: 'var(--color-bg-app)',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: '#3c4043',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
};

const navigationFooterStyle = {
  padding: '1rem 1.5rem',
  borderTop: '1px solid #dadce0',
  backgroundColor: 'var(--color-bg-app)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const previewHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #dadce0',
  backgroundColor: 'var(--color-bg-surface)',
};

const previewScrollStyle = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
};

const spinningIconStyle = {
  animation: 'spin 1s linear infinite'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(9, 30, 66, 0.54)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(2px)',
};

const modalContentStyle = {
  background: 'var(--color-bg-surface)',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '600px',
  height: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  overflow: 'hidden',
};

const modalHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #dadce0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'var(--color-bg-app)',
};

const modalCloseButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.2rem',
  color: '#5f6368',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  lineHeight: 1,
};

const modalBodyStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '0',
  backgroundColor: '#f1f3f4',
};
