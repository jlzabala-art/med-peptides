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
import { 
  ArrowLeft, Save, Bot, Sparkles, Check, 
  Trash2, Plus, Layout, Search, X, Send, ShoppingCart, Lightbulb, History, ChevronDown, ChevronRight
} from 'lucide-react';
import { renderAIMarkdown } from '../shared/ClinicalAssistant/utils/markdownRenderer';
import FormattedResponse from '../shared/ClinicalAssistant/components/FormattedResponse';

const CANONICAL_GOALS = [
  'cognitive_mood',
  'hormonal_optimization',
  'immune_support',
  'longevity_anti_aging',
  'metabolic_weight',
  'recovery_repair',
  'sleep_circadian',
];


const GOAL_LABELS = {
  cognitive_mood: 'Cognitive & Mood',
  hormonal_optimization: 'Hormonal Optimization',
  immune_support: 'Immune Support',
  longevity_anti_aging: 'Longevity & Anti-Aging',
  metabolic_weight: 'Metabolic & Weight',
  recovery_repair: 'Recovery & Repair',
  sleep_circadian: 'Sleep & Circadian',
};

const DISCOVERY_QUESTIONS = [
  { id: 'products', question: "Before generating the website catalogue, which products should be included?", options: ["Entire catalogue", "Selected products", "Specific category", "Include future products", "Use your judgement"] },
  { id: 'audience', question: "Who is the intended audience for this catalogue?", options: ["Physicians", "Clinics", "Pharmacies", "Distributors", "Consumers", "Researchers", "Use your judgement"] },
  { id: 'objective', question: "What is the primary objective of the website content?", options: ["Generate sales", "Generate leads", "Product education", "Distributor recruitment", "Product awareness", "SEO positioning", "Use your judgement"] },
  { id: 'pricing', question: "Should pricing be displayed?", options: ["No pricing", "Retail pricing", "Distributor pricing", "Medical pricing", "Multiple pricing levels", "Use your judgement"] },
  { id: 'language', question: "What language should be used?", options: ["English", "Spanish", "Arabic", "French", "German", "Multi-language", "Use your judgement"] },
  { id: 'style', question: "What communication style should be used?", options: ["Scientific", "Medical", "Commercial", "Luxury", "Corporate", "Educational", "Use your judgement"] },
  { id: 'contentType', question: "What website content should be generated?", options: ["Product pages", "Category pages", "Collection pages", "Landing pages", "Comparison pages", "Homepage sections", "Use your judgement"] },
  { id: 'detailLevel', question: "How much information should be displayed per product?", options: ["Product name only", "Short summary", "Commercial description", "Technical description", "Scientific overview", "Comprehensive product profile", "Use your judgement"] },
  { id: 'images', question: "How should product images be handled?", options: ["Existing images provided by user", "Existing database images", "AI-generated suggestions", "No image recommendations", "Use your judgement"] },
  { id: 'scientificDepth', question: "What scientific depth should be included?", options: ["None", "Basic", "Intermediate", "Advanced", "Research-focused", "Use your judgement"] },
  { id: 'seo', question: "Should the content be optimized for search engines?", options: ["No", "Basic SEO", "Advanced SEO", "Use your judgement"] },
  { id: 'cta', question: "What action should the visitor take?", options: ["Contact sales", "Request quotation", "Request information", "Request sample", "Register account", "Buy online", "Use your judgement"] },
  { id: 'goal', question: "What should the generated content optimize for?", options: ["Maximize sales", "Maximize lead generation", "Maximize SEO performance", "Maximize scientific credibility", "Maximize distributor acquisition", "Maximize conversion rate", "Use your judgement"] }
];


export default function CatalogCreatorFlow({ ownerId, ownerType, editingCatalog = null, onBack }) {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId || ownerId;

  const [catalog, setCatalog] = useState(editingCatalog ? { ...editingCatalog } : emptyCatalog({ ownerId, ownerType }));
  
  // Database options
  const [allProducts, setAllProducts] = useState([]);
  const [allProtocols, setAllProtocols] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Chat state
  const [conversationState, setConversationState] = useState('DISCOVERY'); // DISCOVERY, VALIDATION, GENERATION
  const [discoveryData, setDiscoveryData] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [previousPrompts, setPreviousPrompts] = useState([]);
  const [openAccordion, setOpenAccordion] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const promises = [
          productRepository.getCatalog(),
          protocolRepository.getProtocolTemplates()
        ];
        
        if (ownerType === 'wholesaler' && tenantId) {
          promises.push(getDoc(doc(db, 'tenants', tenantId)));
        }

        const results = await Promise.all(promises);
        setAllProducts(results[0]);
        setAllProtocols(results[1]);

          if (results[2] && results[2].exists() && !editingCatalog) {
          const tenantData = results[2].data();
          if (tenantData.branding) {
            setCatalog(prev => ({
              ...prev,
              branding: tenantData.branding
            }));
          }
        }
        
        if (!editingCatalog) {
          setCatalog(prev => ({
            ...prev,
            contactEmail: prev.contactEmail || userProfile?.email || '',
            contactPhone: prev.contactPhone || userProfile?.phone || userProfile?.phoneNumber || '',
          }));
        }
      } catch (e) {
        console.error('Error fetching catalog assets:', e);
      } finally {
        setLoadingDb(false);
      }
    }
    loadData();

    // Load previous prompts
    const saved = localStorage.getItem('catalogBuilder_previousPrompts');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviousPrompts(JSON.parse(saved));
      } catch (err) {
        console.error('Error parsing saved prompts', err);
      }
    }
    
    // Initialize Discovery Chat
    const firstQ = DISCOVERY_QUESTIONS[0];
    setChatHistory([{ role: 'ai', content: firstQ.question, options: firstQ.options }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiTyping]);

  const handleSendMessage = async (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;
    
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: textToSend }]);

    if (conversationState === 'DISCOVERY') {
      let nextData = { ...discoveryData };
      const currentQ = DISCOVERY_QUESTIONS[currentQuestionIndex];
      
      if (textToSend === 'Use your judgement') {
        for (let i = currentQuestionIndex; i < DISCOVERY_QUESTIONS.length; i++) {
          nextData[DISCOVERY_QUESTIONS[i].id] = "AI Judgement";
        }
        setDiscoveryData(nextData);
        setConversationState('VALIDATION');
        showValidationSummary(nextData);
        return;
      }

      nextData[currentQ.id] = textToSend;
      setDiscoveryData(nextData);

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < DISCOVERY_QUESTIONS.length) {
        setCurrentQuestionIndex(nextIndex);
        const nextQ = DISCOVERY_QUESTIONS[nextIndex];
        setIsAiTyping(true);
        setTimeout(() => {
          setIsAiTyping(false);
          setChatHistory(prev => [...prev, { role: 'ai', content: nextQ.question, options: nextQ.options }]);
        }, 600);
      } else {
        setConversationState('VALIDATION');
        showValidationSummary(nextData);
      }
      return;
    }

    if (conversationState === 'VALIDATION') {
      if (textToSend === 'Confirm & Generate') {
        setConversationState('GENERATION');
        executeGeneration(discoveryData);
      } else if (textToSend === 'Modify Settings') {
        setConversationState('DISCOVERY');
        setCurrentQuestionIndex(0);
        setDiscoveryData({});
        const firstQ = DISCOVERY_QUESTIONS[0];
        setChatHistory(prev => [...prev, { role: 'ai', content: "Let's restart the discovery phase. " + firstQ.question, options: firstQ.options }]);
      }
      return;
    }

    if (conversationState === 'GENERATION') {
      setIsAiTyping(true);
      try {
        await callAdminAgent(textToSend);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  const showValidationSummary = (data) => {
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: "I have gathered all the necessary information. Please review the Discovery Summary below:",
        isValidation: true,
        summaryData: data,
        options: ["Confirm & Generate", "Modify Settings"]
      }]);
    }, 800);
  };

  const executeGeneration = async (data) => {
    setIsAiTyping(true);
    const promptText = `
      Please generate a website catalogue.
      MANDATORY CONSTRAINTS:
      ${Object.entries(data).map(([k, v]) => `- ${k.toUpperCase()}: ${v}`).join('\\n')}
      
      Follow all rules for Audience Adaptation, SEO Structure, Language, and Pricing.
    `;
    await callAdminAgent(promptText);
    setIsAiTyping(false);
  };

  const callAdminAgent = async (prompt) => {
    try {
      const response = await fetch('https://europe-west1-med-peptides-app.cloudfunctions.net/adminAgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          action: 'generate_catalog',
          prompt: prompt,
          context: { ownerId, ownerType, tenantId, currentCatalog: catalog }
        })
      });

      const data = await response.json();
      if (data.status === 'success' && data.data) {
        if (data.data.catalog) {
          const suggestedCatalog = data.data.catalog;
          const extractedIds = [];
          if (suggestedCatalog.sections && Array.isArray(suggestedCatalog.sections)) {
            suggestedCatalog.sections.forEach(sec => {
              if (sec.products && Array.isArray(sec.products)) {
                sec.products.forEach(pId => extractedIds.push(pId));
              }
            });
          }
          const uniqueIds = [...new Set([...catalog.selectedProducts, ...extractedIds])];
          setCatalog(prev => ({
            ...prev,
            ...suggestedCatalog,
            selectedProducts: uniqueIds
          }));
        }
        setChatHistory(prev => [...prev, { 
          role: 'ai', 
          content: data.data.message || "I've drafted a catalog based on your request. You can review and refine it in the Cart panel."
        }]);
      } else {
        throw new Error(data.message || 'Failed to parse AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    }
  };

  const handleAddByGoal = (goal) => {
    if (!goal || goal === '') return;
    const matchingProducts = allProducts.filter(p => p.goals && p.goals.includes(goal));
    const newIds = matchingProducts.map(p => p.id || p.slug).filter(Boolean);
    if (newIds.length > 0) {
      setCatalog(prev => {
        const updatedSelected = [...new Set([...(prev.selectedProducts || []), ...newIds])];
        return { ...prev, selectedProducts: updatedSelected };
      });
      // Try to reset the select element
      const selectEl = document.getElementById('addByGoalSelect');
      if (selectEl) selectEl.value = '';
    }
  };

  const handleProductToggle = (prodId) => {
    setCatalog(prev => {
      const sections = [...prev.sections];
      if (sections.length === 0) sections.push({ title: 'Featured Selection', products: [], protocols: [] });
      
      const selected = sections[0].products || [];
      const isSelected = selected.includes(prodId);
      sections[0].products = isSelected ? selected.filter(id => id !== prodId) : [...selected, prodId];
      return { ...prev, sections };
    });
  };

  const handleProtocolToggle = (protoId) => {
    setCatalog(prev => {
      const sections = [...prev.sections];
      if (sections.length === 0) sections.push({ title: 'Featured Selection', products: [], protocols: [] });
      
      const selected = sections[0].protocols || [];
      const isSelected = selected.includes(protoId);
      sections[0].protocols = isSelected ? selected.filter(id => id !== protoId) : [...selected, protoId];
      return { ...prev, sections };
    });
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const finalCatalog = {
        ...catalog,
        status: publish ? CATALOG_STATUS.PUBLISHED : CATALOG_STATUS.DRAFT
      };
      await catalogRepository.saveCatalog(finalCatalog);
      
      if (publish) {
        alert('Catalog published successfully!\nYou can share the link: https://regenpept-web.web.app/catalog/' + finalCatalog.slug);
      } else {
        alert('Catalog saved as draft.');
      }
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

  const filteredProducts = allProducts.filter(p => 
    (p.displayName || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const QUICK_PROMPTS = [
    "Create a premium Longevity & Cellular Repair catalog for VIP patients, high detail, including BPC-157 and NAD+.",
    "Build a Metabolic & Weight Management portfolio for doctors, featuring Semaglutide and Tirzepatide.",
    "Design a Neurocognitive enhancement catalog focusing on Semax, Selank and Dihexa.",
    "I need a sleep and recovery protocol catalog for sports clinics."
  ];

  return (
    <div style={splitScreenContainerStyle}>
      {/* LEFT PANEL: AI Chat Builder */}
      <div style={chatPanelStyle}>
        <div style={panelHeaderStyle}>
          <button onClick={onBack} style={backLinkStyle}>
            <ArrowLeft size={16} /> Back to list
          </button>
          <h2 style={flowTitleStyle}>AI Catalog Builder</h2>
        </div>

        <div style={chatMessagesContainerStyle}>
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={msg.role === 'ai' ? aiBubbleWrapperStyle : userBubbleWrapperStyle}>
                {msg.role === 'ai' && <Bot size={20} color="#1a73e8" style={{ marginTop: '4px', flexShrink: 0 }} />}
                <div style={msg.role === 'ai' ? aiMessageStyle : userMessageStyle}>
                  {msg.role === 'ai' ? (
                    typeof msg.content === 'object' ? (
                      <FormattedResponse formatted={msg.content} />
                    ) : (
                      renderAIMarkdown(msg.content)
                    )
                  ) : msg.content}
                </div>
              </div>
              
              {msg.isValidation && msg.summaryData && (
                <div style={{ marginLeft: '32px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dadce0', padding: '12px', fontSize: '0.85rem' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#202124' }}>DISCOVERY SUMMARY</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(msg.summaryData).map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid #f1f3f4' }}>
                          <td style={{ padding: '6px 0', fontWeight: 600, color: '#5f6368', textTransform: 'capitalize', width: '40%' }}>{k}</td>
                          <td style={{ padding: '6px 0', color: '#202124' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {msg.options && i === chatHistory.length - 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: msg.role === 'ai' ? '32px' : '0' }}>
                  {msg.options.map((opt, oIdx) => (
                    <button 
                      key={oIdx} 
                      onClick={() => handleSendMessage(opt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #1a73e8',
                        backgroundColor: '#e8f0fe',
                        color: '#1a73e8',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.target.style.backgroundColor = '#d2e3fc'; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = '#e8f0fe'; }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {conversationState !== 'DISCOVERY' && chatHistory.length === 1 && (
            <div style={accordionContainerStyle}>
              {/* Curated Accordion */}
              <div style={accordionSectionStyle}>
                <button style={accordionHeaderStyle} onClick={() => setOpenAccordion(openAccordion === 'curated' ? null : 'curated')}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Lightbulb size={16} color="#1a73e8"/> 
                    <span style={{fontWeight: 600, color: '#1a73e8'}}>Curated Prompts</span>
                  </div>
                  {openAccordion === 'curated' ? <ChevronDown size={16} color="#1a73e8"/> : <ChevronRight size={16} color="#1a73e8"/>}
                </button>
                {openAccordion === 'curated' && (
                  <div style={accordionContentStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("I want a sports recovery catalog with TB-500 and BPC-157.")}>
                          <td style={welcomeTableCellStyle}>🎯 <strong>Athletes:</strong> I want a sports recovery catalog with TB-500 and BPC-157.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Create a metabolic health portfolio with Semaglutide.")}>
                          <td style={welcomeTableCellStyle}>⚖️ <strong>Weight Loss:</strong> Create a metabolic health portfolio with Semaglutide.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Build a VIP anti-aging catalog focusing on NAD+ and GHK-Cu.")}>
                          <td style={welcomeTableCellStyle}>✨ <strong>Anti-Aging VIP:</strong> Build a VIP anti-aging catalog focusing on NAD+ and GHK-Cu.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("I want a catalog with all available injectable peptides.")}>
                          <td style={welcomeTableCellStyle}>📦 <strong>Complete Catalog:</strong> I want a catalog with all available injectable peptides.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Category Catalogs Accordion */}
              <div style={accordionSectionStyle}>
                <button style={accordionHeaderStyle} onClick={() => setOpenAccordion(openAccordion === 'categories' ? null : 'categories')}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Layout size={16} color="#059669"/> 
                    <span style={{fontWeight: 600, color: '#059669'}}>Category Catalogs</span>
                  </div>
                  {openAccordion === 'categories' ? <ChevronDown size={16} color="#059669"/> : <ChevronRight size={16} color="#059669"/>}
                </button>
                {openAccordion === 'categories' && (
                  <div style={accordionContentStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Create a complete catalog with all Injectable peptides.")}>
                          <td style={welcomeTableCellStyle}>💉 <strong>All Injectables:</strong> Create a complete catalog with all Injectable peptides.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Create a catalog with all Oral and Topical peptides.")}>
                          <td style={welcomeTableCellStyle}>💊 <strong>Oral & Topical:</strong> Create a catalog with all Oral and Topical peptides.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Build a catalog specifically for the Longevity and Anti-Aging category.")}>
                          <td style={welcomeTableCellStyle}>⏳ <strong>Longevity:</strong> Build a catalog specifically for the Longevity and Anti-Aging category.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Create a catalog containing all Weight Loss and Metabolic peptides.")}>
                          <td style={welcomeTableCellStyle}>⚖️ <strong>Weight Management:</strong> Create a catalog containing all Weight Loss and Metabolic peptides.</td>
                        </tr>
                        <tr style={welcomeTableRowStyle} onClick={() => handleSendMessage("Generate a catalog with all available Sexual Health and Libido products.")}>
                          <td style={welcomeTableCellStyle}>🔥 <strong>Sexual Health:</strong> Generate a catalog with all Sexual Health and Libido products.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Previous Prompts Accordion */}
              <div style={{...accordionSectionStyle, borderBottom: 'none'}}>
                <button style={accordionHeaderStyle} onClick={() => setOpenAccordion(openAccordion === 'previous' ? null : 'previous')}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <History size={16} color="#5f6368"/> 
                    <span style={{fontWeight: 600, color: '#5f6368'}}>Your Previous Prompts</span>
                  </div>
                  {openAccordion === 'previous' ? <ChevronDown size={16} color="#5f6368"/> : <ChevronRight size={16} color="#5f6368"/>}
                </button>
                {openAccordion === 'previous' && (
                  <div style={accordionContentStyle}>
                    {previousPrompts.length === 0 ? (
                      <div style={{padding: '10px 8px', fontSize: '0.85rem', color: '#5f6368', fontStyle: 'italic'}}>You have no saved previous prompts yet.</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {previousPrompts.map((p, idx) => (
                            <tr key={idx} style={welcomeTableRowStyle} onClick={() => handleSendMessage(p)}>
                              <td style={welcomeTableCellStyle}>🕒 {p}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {isAiTyping && (
            <div style={aiBubbleWrapperStyle}>
              <Bot size={20} color="#1a73e8" style={{ marginTop: '4px' }} />
              <div style={aiMessageStyle}>
                <Sparkles size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating catalog logic...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={chatInputContainerStyle}>
          <div style={quickPromptsContainerStyle}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => handleSendMessage(p)} style={quickPromptStyle}>
                {p.substring(0, 45)}...
              </button>
            ))}
          </div>
          <div style={inputWrapperStyle}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tell me what kind of catalog to build..."
              style={textInputStyle}
            />
            <button onClick={() => handleSendMessage()} style={sendButtonStyle}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Cart & Catalog Form */}
      <div style={cartPanelStyle}>
        <div style={{ ...panelHeaderStyle, justifyContent: 'space-between', borderBottom: '1px solid #dadce0', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#202124', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} color="#1a73e8" /> Catalog Cart
          </h3>
          <button onClick={() => setShowPreviewModal(true)} style={actionButtonStyleSecondary}>
            <Layout size={14} /> Preview
          </button>
        </div>

        <div style={cartBodyStyle}>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Catalog Title</label>
            <input 
              type="text" 
              value={catalog.title}
              onChange={(e) => setCatalog(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Generated by AI or type here..."
              style={inputStyle}
            />
          </div>

          <div style={formFieldStyle}>
            <label style={labelStyle}>URL Slug</label>
            <input 
              type="text" 
              value={catalog.slug}
              onChange={(e) => setCatalog(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g., longevity-catalog"
              style={inputStyle}
            />
          </div>

          <div style={formFieldStyle}>
            <label style={labelStyle}>Visibility</label>
            <select 
              value={catalog.visibility || 'private'}
              onChange={(e) => setCatalog(prev => ({ ...prev, visibility: e.target.value }))}
              style={{ ...inputStyle, backgroundColor: '#fff' }}
            >
              <option value="private">Private (Only I can see and use it)</option>
              <option value="public">Public (Anyone can view and reuse it)</option>
            </select>
          </div>

          <div style={{...formFieldStyle, flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '0.5rem'}}>
            <input 
              type="checkbox" 
              checked={catalog.pricingVisible}
              onChange={(e) => setCatalog(prev => ({ ...prev, pricingVisible: e.target.checked }))}
              id="pricing-visible"
            />
            <label htmlFor="pricing-visible" style={{...labelStyle, cursor: 'pointer', margin: 0}}>Include Prices?</label>
          </div>

          {catalog.pricingVisible && (
            <div style={formFieldStyle}>
              <label style={labelStyle}>Margin over cost (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="number" 
                  min="0"
                  step="5"
                  value={catalog.pricingMargin || 0}
                  onChange={(e) => setCatalog(prev => ({ ...prev, pricingMargin: Number(e.target.value) }))}
                  placeholder="e.g., 30"
                  style={{...inputStyle, width: '100px'}}
                />
                <span style={{fontSize: '0.8rem', color: '#5f6368'}}>% applied over your base cost</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #dadce0', paddingBottom: '4px' }}>
            <h4 style={sectionHeaderStyle}>Contact Information</h4>
            <p style={{ fontSize: '0.75rem', color: '#5f6368', margin: '4px 0 0 0' }}>
              These details will be hidden if the catalog is made Public.
            </p>
          </div>

          <div style={formFieldStyle}>
            <label style={labelStyle}>Contact Email</label>
            <input 
              type="email" 
              value={catalog.contactEmail || ''}
              onChange={(e) => setCatalog(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="e.g., doctor@clinic.com"
              style={inputStyle}
            />
          </div>

          <div style={formFieldStyle}>
            <label style={labelStyle}>Contact Phone / WhatsApp</label>
            <input 
              type="text" 
              value={catalog.contactPhone || ''}
              onChange={(e) => setCatalog(prev => ({ ...prev, contactPhone: e.target.value }))}
              placeholder="e.g., +1 555 0123"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            <h4 style={sectionHeaderStyle}>Items in Catalog ({selectedProductsInFlow.length + selectedProtocolsInFlow.length})</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                id="addByGoalSelect"
                onChange={(e) => handleAddByGoal(e.target.value)}
                style={{
                  height: '28px', padding: '0 12px', borderRadius: '14px', border: '1px solid var(--border)',
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="">Bulk Add by Goal...</option>
                {CANONICAL_GOALS.map(g => <option key={g} value={g}>{GOAL_LABELS[g]}</option>)}
              </select>
              <button onClick={() => setShowSearchModal(true)} style={actionButtonStyleSmall}>
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>

          {selectedProductsInFlow.length === 0 && selectedProtocolsInFlow.length === 0 ? (
            <div style={emptyCartStyle}>No items selected. Ask the AI or add manually.</div>
          ) : (
            <div style={cartListStyle}>
              {(() => {
                const grouped = {};
                // Group protocols under 'PROTOCOLOS'
                if (selectedProtocolsInFlow.length > 0) {
                  grouped['PROTOCOLOS'] = selectedProtocolsInFlow.map(id => {
                    const proto = allProtocols.find(x => x.id === id || x.protocol_id === id || x.slug === id);
                    if (!proto) return null;
                    
                    let desc = 'Clinical protocol';
                    if (proto.products && Array.isArray(proto.products) && proto.products.length > 0) {
                      desc = `Includes: ${proto.products.join(', ')}`;
                    } else if (proto.phases && proto.phases.length > 0) {
                      desc = `${proto.phases.length} phase protocol`;
                    }
                    
                    return {
                      id: proto.id || proto.protocol_id || proto.slug,
                      name: proto.name || proto.protocol_id || proto.slug,
                      type: 'protocol',
                      desc: desc,
                      original: proto
                    };
                  }).filter(Boolean);
                }

                // Group products
                selectedProductsInFlow.forEach(id => {
                  const p = allProducts.find(x => x.id === id || x.slug === id);
                  if (!p) return;
                  const cat = (p.category || p.productType || 'OTROS').toUpperCase();
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push({
                    id: p.id || p.slug,
                    name: p.displayName || p.name,
                    type: 'product',
                    desc: p.objective || p.category || p.productType || 'N/A',
                    original: p
                  });
                });

                // Sort categories: PEPTIDE, PROTOCOLOS, SUPPLEMENT, TESTING, then others
                const order = ['PEPTIDE', 'PROTOCOLOS', 'SUPPLEMENT', 'TESTING'];
                const sortedKeys = Object.keys(grouped).sort((a, b) => {
                  const idxA = order.indexOf(a);
                  const idxB = order.indexOf(b);
                  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                  if (idxA !== -1) return -1;
                  if (idxB !== -1) return 1;
                  return a.localeCompare(b);
                });

                return sortedKeys.map(cat => (
                  <div key={cat} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #dadce0', paddingBottom: '4px' }}>
                      {cat}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {grouped[cat].map(item => (
                        <div key={item.id} style={cartItemStyle}>
                          <div>
                            <strong>{item.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>{item.desc}</div>
                          </div>
                          <button onClick={() => item.type === 'protocol' ? handleProtocolToggle(item.id) : handleProductToggle(item.id)} style={removeBtnStyle}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleSave(false)} disabled={saving} style={{ ...actionButtonStyleSecondary, flex: 1 }}>
              <Save size={16} /> Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} style={{ ...actionButtonStylePrimary, flex: 1 }}>
              <Check size={16} /> Publish
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#202124', fontWeight: 600 }}>Add Product to Catalog</h3>
              <button onClick={() => setShowSearchModal(false)} style={modalCloseButtonStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '1rem', borderBottom: '1px solid #dadce0', backgroundColor: '#f8f9fa' }}>
              <div style={searchWrapperStyle}>
                <Search size={16} color="#5f6368" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search peptides, supplements..."
                  style={searchInputStyle}
                />
              </div>
            </div>
            <div style={modalBodyStyle}>
              {filteredProducts.map(p => {
                const isSelected = selectedProductsInFlow.includes(p.id);
                return (
                  <div key={p.id} style={searchResultItemStyle} onClick={() => handleProductToggle(p.id)}>
                    <div>
                      <strong style={{ color: '#202124' }}>{p.displayName || p.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>{p.objective || p.category || 'N/A'}</div>
                    </div>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? '#1a73e8' : '#dadce0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? '#1a73e8' : 'transparent'
                    }}>
                      {isSelected && <Check size={14} color="#fff" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '90%', maxWidth: '1000px', height: '90vh' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#202124', fontWeight: 600 }}>Live Catalog Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} style={modalCloseButtonStyle}><X size={18} /></button>
            </div>
            <div style={modalBodyStyle}>
              <CatalogPreviewPanel 
                catalog={catalog}
                products={allProducts}
                protocols={allProtocols}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────
const splitScreenContainerStyle = {
  display: 'flex',
  height: 'calc(100vh - 100px)',
  background: 'var(--color-bg-surface)',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  overflow: 'hidden',
  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 2px 6px 2px rgba(60,64,67,0.15)',
};

const chatPanelStyle = {
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #dadce0',
  backgroundColor: '#f8f9fa'
};

const cartPanelStyle = {
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--color-bg-surface)',
};

const panelHeaderStyle = {
  padding: '1rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  minHeight: '64px',
};

const backLinkStyle = {
  background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer',
  fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
};

const flowTitleStyle = { margin: '0 0 0 1rem', fontSize: '1.2rem', color: '#202124', fontWeight: 600 };

const chatMessagesContainerStyle = {
  flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem'
};

const aiBubbleWrapperStyle = { display: 'flex', gap: '12px', alignItems: 'flex-start' };
const userBubbleWrapperStyle = { display: 'flex', justifyContent: 'flex-end', width: '100%' };

const aiMessageStyle = {
  backgroundColor: 'var(--color-bg-surface)', padding: '0.75rem 1.25rem', borderRadius: '0 12px 12px 12px',
  border: '1px solid #dadce0', color: '#202124', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '85%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  overflowWrap: 'break-word'
};

const userMessageStyle = {
  backgroundColor: '#1a73e8', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '12px 12px 0 12px',
  fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '80%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
};

const accordionContainerStyle = {
  margin: '1rem 0 1rem 32px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dadce0', overflow: 'hidden'
};

const accordionSectionStyle = {
  borderBottom: '1px solid #dadce0'
};

const accordionHeaderStyle = {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '12px 16px', background: '#f8f9fa', border: 'none', cursor: 'pointer', textAlign: 'left'
};

const accordionContentStyle = {
  padding: '4px 16px 12px 16px', backgroundColor: '#fff'
};

const welcomeTableRowStyle = {
  borderBottom: '1px solid #f1f3f4', cursor: 'pointer', transition: 'background 0.2s'
};

const welcomeTableCellStyle = {
  padding: '12px 8px', fontSize: '0.85rem', color: '#202124'
};

const chatInputContainerStyle = { padding: '1rem', borderTop: '1px solid #dadce0', backgroundColor: 'var(--color-bg-surface)' };

const quickPromptsContainerStyle = { display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' };
const quickPromptStyle = {
  whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '16px', border: '1px solid #dadce0', backgroundColor: '#f8f9fa',
  color: '#1a73e8', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0
};

const inputWrapperStyle = { display: 'flex', gap: '0.5rem', alignItems: 'center' };
const textInputStyle = {
  flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #dadce0', outline: 'none', fontSize: '0.9rem'
};
const sendButtonStyle = {
  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1a73e8', color: '#fff', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};

const cartBodyStyle = { padding: '1.5rem', overflowY: 'auto', flex: 1 };
const formFieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' };
const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: '#3c4043' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #dadce0', fontSize: '0.85rem', outline: 'none' };

const sectionHeaderStyle = { margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#202124' };
const actionButtonStyleSmall = {
  display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f8f9fa', color: '#1a73e8',
  border: '1px solid #dadce0', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
};

const emptyCartStyle = { padding: '2rem', textAlign: 'center', border: '2px dashed #dadce0', borderRadius: '8px', color: '#5f6368', fontSize: '0.85rem' };
const cartListStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const cartItemStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #dadce0', borderRadius: '8px', backgroundColor: '#f8f9fa'
};
const removeBtnStyle = { background: 'none', border: 'none', color: '#d93025', cursor: 'pointer', padding: '4px' };

const actionButtonStylePrimary = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '6px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };
const actionButtonStyleSecondary = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '6px', backgroundColor: '#f8f9fa', color: '#1a73e8', border: '1px solid #dadce0', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 30, 66, 0.54)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' };
const modalContentStyle = { background: 'var(--color-bg-surface)', borderRadius: '8px', width: '90%', maxWidth: '500px', height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', overflow: 'hidden' };
const modalHeaderStyle = { padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dadce0' };
const modalCloseButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px' };
const searchWrapperStyle = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '24px', padding: '8px 16px' };
const searchInputStyle = { border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' };
const modalBodyStyle = { flex: 1, overflowY: 'auto' };
const searchResultItemStyle = { padding: '12px 1.5rem', borderBottom: '1px solid #f1f3f4', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' };
