import Search from "lucide-react/dist/esm/icons/search";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Send from "lucide-react/dist/esm/icons/send";
import X from "lucide-react/dist/esm/icons/x";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import Shield from "lucide-react/dist/esm/icons/shield";
import Check from "lucide-react/dist/esm/icons/check";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import FileText from "lucide-react/dist/esm/icons/file-text";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { catalogRepository } from '../repositories/catalogRepository';
import { productRepository } from '../repositories/productRepository';
import { protocolRepository } from '../repositories/protocolRepository';
import { searchCatalogSemantic, askCatalogAssistant } from '../services/catalogAIService';
import { resolveCatalogContact } from '../utils/contactRouter';













export default function PublicCatalogView() {
  const { catalogSlug } = useParams();
  const [searchParams] = useSearchParams();
  // URL Customization hooks
  const urlRecipient = searchParams.get('recipient') || '';
  const urlClinic = searchParams.get('clinic') || '';

  const [catalog, setCatalog] = useState(null);
  const [products, setProducts] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Contact & routing
  const [contactInfo, setContactInfo] = useState(null);

  // Lead form
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Chatbot Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // FAQ accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadCatalogData() {
      if (!catalogSlug) return;
      setLoading(true);
      try {
        const cat = await catalogRepository.getCatalogBySlug(catalogSlug);
        if (!cat) {
          setError('Catalog not found.');
          return;
        }

        // Increment view count in background
        catalogRepository.incrementCatalogViews(cat.id);

        const [prodList, protoList] = await Promise.all([
          productRepository.getCatalog(),
          protocolRepository.getProtocolTemplates()
        ]);

        setCatalog(cat);
        setProducts(prodList);
        setProtocols(protoList);

        // Resolve Inquiry routing
        const fallbackContact = await resolveCatalogContact(cat);
        setContactInfo({
          email: cat.contactEmail || fallbackContact?.email,
          whatsAppLink: cat.contactPhone 
            ? `https://wa.me/${cat.contactPhone.replace(/[^0-9]/g,'')}` 
            : fallbackContact?.whatsAppLink
        });
      } catch {
        // Ignorar el error para que la interfaz siga funcionando en modo offline o degradado
      } finally {
        setLoading(false);
      }
    }

    loadCatalogData();
  }, [catalogSlug]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    setSearching(true);
    try {
      const response = await searchCatalogSemantic({
        query: searchQuery,
        catalogContext: {
          sections: catalog.sections,
          goal: catalog.goal,
          audience: catalog.audience
        }
      });
      setSearchResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadSubmitting(true);
    try {
      await catalogRepository.saveLeadRequest({
        catalogId: catalog.id,
        catalogSlug: catalog.slug,
        ownerId: catalog.ownerId,
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        message: leadMessage,
        status: 'new'
      });
      setLeadSuccess(true);
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      setLeadMessage('');
    } catch (err) {
      alert(`Error submitting request: ${err.message}`);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', text: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const replyText = await askCatalogAssistant({
        message: userMsg.text,
        catalogContext: {
          title: catalog.title,
          goal: catalog.goal,
          sections: catalog.sections,
          disclaimer: catalog.disclaimer
        },
        history: chatHistory
      });

      setChatHistory(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Error connecting to catalog assistant.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div style={fullPageMessageStyle}>Loading portfolio details...</div>;
  }

  if (error || !catalog) {
    return <div style={fullPageMessageStyle}>{error || 'Catalog not found.'}</div>;
  }

  // Branding variables
  const primaryColor = catalog.branding?.primaryColor || '#1a73e8';
  const logoUrl = catalog.branding?.logoUrl || '';
  const companyName = catalog.branding?.companyName || 'Atlas Health Franchise';

  // Helper selectors
  const getProductInfo = (id) => products.find(p => p.id === id || p.slug === id);
  const getProtocolInfo = (id) => protocols.find(p => p.id === id || p.protocol_id === id || p.protocol_slug === id);

  return (
    <div style={{
      fontFamily: catalog.branding?.fontFamily || "'Inter', sans-serif",
      backgroundColor: 'var(--color-bg-app)',
      minHeight: '100vh',
      color: '#202124'
    }}>
      {/* Personalized Header Banner */}
      {(urlRecipient || urlClinic) && (
        <div style={{
          backgroundColor: '#e8f0fe',
          borderBottom: `2px solid ${primaryColor}`,
          padding: '0.75rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#185abc'
        }}>
          Prepared specifically for {urlRecipient ? urlRecipient : 'Clinical Lead'} {urlClinic ? `at ${urlClinic}` : ''}
        </div>
      )}

      {/* Main Header */}
      <header style={headerStyle}>
        <div style={headerContainerStyle}>
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} style={{ maxHeight: '40px', objectFit: 'contain' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-bg-surface)',
                fontWeight: 800
              }}>
                M
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: primaryColor }}>{companyName}</span>
            </div>
          )}

          {/* Semantic Search Box */}
          <form onSubmit={handleSearch} style={searchFormStyle}>
            <Search size={16} style={searchIconStyle} />
            <input 
              type="text" 
              placeholder="Ask anything (e.g., peptides for cellular repair)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
            />
            {searching && <span style={searchLoaderStyle}>Scoring...</span>}
          </form>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--color-bg-surface)', borderBottom: '1px solid #dadce0', padding: '4rem 2rem 5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#202124' }}>
          {catalog.heroTitle || catalog.title}
        </h1>
        {catalog.heroSubtitle && (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: primaryColor, marginBottom: '1.5rem' }}>
            {catalog.heroSubtitle}
          </h2>
        )}
        {catalog.heroDescription && (
          <p style={{ fontSize: '1rem', color: '#5f6368', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            {catalog.heroDescription}
          </p>
        )}
      </section>

      {/* Main Body Grid */}
      <main style={mainContainerStyle}>
        {/* Left Side: Portfolio curation */}
        <div style={contentColumnStyle}>
          {searchResult && (
            <div style={searchResultsContainerStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: primaryColor }}>
                  Semantic Search Results
                </h3>
                <button onClick={() => { setSearchResult(null); setSearchQuery(''); }} style={clearSearchButtonStyle}>
                  Clear Results
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#5f6368', margin: '0 0 1.25rem 0' }}>
                {searchResult.relevanceExplanation}
              </p>
              {/* Matched Products Grid */}
              <div style={productsGridStyle}>
                {searchResult.matchedProductIds?.map(prodId => {
                  const prod = getProductInfo(prodId);
                  if (!prod) return null;
                  return (
                    <div key={prodId} style={productCardStyle}>
                      <h4 style={productTitleStyle}>{prod.displayName || prod.name}</h4>
                      <p style={productDescStyle}>{prod.desc || prod.science?.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalog Sections */}
          {!searchResult && catalog.sections?.map((section, sIdx) => (
            <div key={sIdx} style={sectionContainerStyle}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#202124', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                {section.title}
              </h2>
              {section.description && (
                <p style={{ color: '#5f6368', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {section.description}
                </p>
              )}

              {/* Products in this Section */}
              <div style={productsGridStyle}>
                {section.products?.map(prodId => {
                  const prod = getProductInfo(prodId);
                  if (!prod) return null;
                  return (
                    <div key={prodId} style={productCardStyle}>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#e8f0fe', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor }}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 style={productTitleStyle}>{prod.displayName || prod.name}</h4>
                          <span style={productBadgeStyle}>{prod.productType || 'peptide'}</span>
                        </div>
                      </div>
                      <p style={productDescStyle}>
                        {prod.desc || prod.science?.desc || 'Details currently under review.'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f3f4', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#137333' }}>
                          {catalog.pricingVisible && prod.defaultVariant?.pricing?.retailPrice?.base?.kitUSD
                            ? `$${(prod.defaultVariant.pricing.retailPrice.base.kitUSD * (1 + (catalog.pricingMargin || 0) / 100)).toFixed(2)}`
                            : 'Request Pricing'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>
                          {prod.defaultVariant?.route?.replace('_', ' ') || 'Injectable vial'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Protocols in this Section */}
              {section.protocols?.length > 0 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {section.protocols.map(protoId => {
                    const proto = getProtocolInfo(protoId);
                    if (!proto) return null;
                    return (
                      <div key={protoId} style={protocolCardStyle}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#202124' }}>
                          Protocol: {proto.name || proto.protocol_id}
                        </h4>
                        <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.8rem', color: '#5f6368' }}>
                          {proto.description || proto.goal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* FAQs */}
          {catalog.faq?.length > 0 && (
            <section style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} color={primaryColor} /> Frequently Asked Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {catalog.faq.map((faq, fIdx) => (
                  <div key={fIdx} style={faqContainerStyle}>
                    <button onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)} style={faqQuestionButtonStyle}>
                      <span>{faq.q}</span>
                      <ChevronDown size={16} />
                    </button>
                    {activeFaq === fIdx && <div style={faqAnswerStyle}>{faq.a}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Side: Sticky inquiry capture */}
        <div style={inquiryColumnStyle}>
          <div style={stickyCardStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
              Request Access & Pricing
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#5f6368', lineHeight: 1.5 }}>
              Submit your credentials below. The assigned territory wholesaler will route pricing lists and ordering pathways.
            </p>

            {leadSuccess ? (
              <div style={successBlockStyle}>
                <Check size={24} color="#137333" />
                <h4 style={{ margin: '0.5rem 0 0.25rem 0' }}>Request Submitted</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#137333' }}>
                  Our team will contact you within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={leadFormStyle}>
                <div style={formFieldStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Dr. Alexander Fleming"
                    style={inputStyle}
                  />
                </div>
                <div style={formFieldStyle}>
                  <label style={labelStyle}>Medical Email</label>
                  <input 
                    type="email" 
                    required 
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    style={inputStyle}
                  />
                </div>
                <div style={formFieldStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input 
                    type="text" 
                    required 
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+1 (415) 555-0199"
                    style={inputStyle}
                  />
                </div>
                <div style={formFieldStyle}>
                  <label style={labelStyle}>Message / Inquiry Notes</label>
                  <textarea 
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                    placeholder="Specify target compounds or quantities..."
                    style={textareaStyle}
                  />
                </div>

                <button type="submit" disabled={leadSubmitting} style={{ ...submitButtonStyle, backgroundColor: primaryColor }}>
                  {leadSubmitting ? 'Submitting...' : 'Request Pricing Sheet'}
                </button>
              </form>
            )}

            {catalog.visibility !== 'public' && contactInfo && (
              <div style={quickContactContainerStyle}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5f6368' }}>
                  Direct Channels
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {contactInfo.whatsAppLink && (
                    <a href={contactInfo.whatsAppLink} target="_blank" rel="noopener noreferrer" style={channelLinkStyle}>
                      <MessageSquare size={14} /> WhatsApp Quick Chat
                    </a>
                  )}
                  {contactInfo.email && (
                    <a href={`mailto:${contactInfo.email}`} style={channelLinkStyle}>
                      <Mail size={14} /> {contactInfo.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Chat Assistant Trigger */}
      <button onClick={() => setChatOpen(true)} style={{ ...chatTriggerStyle, backgroundColor: primaryColor }}>
        <MessageSquare size={20} />
        <span>Ask AI Catalog Assistant</span>
      </button>

      {/* Chatbot Drawer */}
      {chatOpen && (
        <div style={drawerOverlayStyle}>
          <div style={drawerStyle}>
            <div style={drawerHeaderStyle}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#202124' }}>AI Portfolio Assistant</h3>
                <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>Trained on {catalog.title}</span>
              </div>
              <button onClick={() => setChatOpen(false)} style={closeDrawerButtonStyle}>
                <X size={18} />
              </button>
            </div>
            <div style={chatBodyStyle}>
              {chatHistory.length === 0 && (
                <div style={chatEmptyStyle}>
                  <MessageSquare size={32} color="#dadce0" />
                  <p>Ask me details about the compounds, administration routes, or protocols in this catalog.</p>
                </div>
              )}
              {chatHistory.map((msg, mIdx) => (
                <div key={mIdx} style={{
                  ...messageRowStyle,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    ...messageBubbleStyle,
                    backgroundColor: msg.role === 'user' ? primaryColor : '#f1f3f4',
                    color: msg.role === 'user' ? 'var(--color-bg-surface)' : '#202124'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ ...messageRowStyle, justifyContent: 'flex-start' }}>
                  <div style={{ ...messageBubbleStyle, backgroundColor: '#f1f3f4', color: '#5f6368' }}>
                    Answering...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} style={chatInputFormStyle}>
              <input 
                type="text" 
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                style={chatInputStyle}
              />
              <button type="submit" style={chatSendButtonStyle}>
                <Send size={16} color={primaryColor} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles (Google Cloud inspired) ──────────────────────────────────────────
const fullPageMessageStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  fontSize: '1rem',
  color: '#5f6368',
};

const headerStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  borderBottom: '1px solid #dadce0',
  padding: '1rem 2rem',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
  flexWrap: 'wrap',
  gap: '1rem',
};

const searchFormStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flex: '0 1 360px',
};

const searchIconStyle = {
  position: 'absolute',
  left: '12px',
  color: '#5f6368',
};

const searchInputStyle = {
  width: '100%',
  padding: '8px 12px 8px 36px',
  borderRadius: '24px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
};

const searchLoaderStyle = {
  position: 'absolute',
  right: '12px',
  fontSize: '0.72rem',
  color: '#1a73e8',
  fontWeight: 600,
};

const mainContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2.5rem 1.5rem',
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
};

const contentColumnStyle = {
  flex: '1 1 700px',
};

const inquiryColumnStyle = {
  flex: '0 0 320px',
};

const sectionContainerStyle = {
  marginBottom: '3.5rem',
};

const productsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1.25rem',
};

const productCardStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  padding: '1.25rem',
  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.05)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const productTitleStyle = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
  color: '#202124',
};

const productBadgeStyle = {
  fontSize: '0.7rem',
  color: '#5f6368',
  backgroundColor: '#f1f3f4',
  padding: '2px 6px',
  borderRadius: '4px',
  fontWeight: 600,
  textTransform: 'uppercase',
  display: 'inline-block',
  marginTop: '4px',
};

const productDescStyle = {
  fontSize: '0.82rem',
  color: '#5f6368',
  lineHeight: 1.55,
  margin: '0.5rem 0 1.25rem 0',
};

const protocolCardStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid #dadce0',
  borderRadius: '6px',
  padding: '1rem',
};

const faqContainerStyle = {
  border: '1px solid #dadce0',
  borderRadius: '6px',
  backgroundColor: 'var(--color-bg-surface)',
  marginBottom: '0.5rem',
  overflow: 'hidden',
};

const faqQuestionButtonStyle = {
  width: '100%',
  textAlign: 'left',
  padding: '1rem',
  background: 'none',
  border: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: '#202124',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const faqAnswerStyle = {
  padding: '1rem',
  borderTop: '1px solid #dadce0',
  fontSize: '0.85rem',
  lineHeight: 1.55,
  color: '#5f6368',
  backgroundColor: '#fafafa',
};

const stickyCardStyle = {
  position: 'sticky',
  top: '80px',
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  padding: '1.5rem',
  boxShadow: '0 1px 3px 0 rgba(60,64,67,0.1), 0 4px 8px 3px rgba(60,64,67,0.15)',
};

const leadFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const formFieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#3c4043',
};

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.82rem',
  outline: 'none',
};

const textareaStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.82rem',
  outline: 'none',
  minHeight: '80px',
  resize: 'vertical',
};

const submitButtonStyle = {
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '10px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  marginTop: '0.5rem',
};

const successBlockStyle = {
  backgroundColor: '#e6f4ea',
  border: '1px solid #137333',
  borderRadius: '4px',
  padding: '1.25rem',
  textAlign: 'center',
  color: '#137333',
};

const quickContactContainerStyle = {
  marginTop: '1.5rem',
  borderTop: '1px solid #dadce0',
  paddingTop: '1rem',
};

const channelLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#1a73e8',
  textDecoration: 'none',
  fontSize: '0.8rem',
  fontWeight: 600,
};

const chatTriggerStyle = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '24px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
  zIndex: 1000,
};

const drawerOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  zIndex: 1001,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerStyle = {
  width: '380px',
  height: '100%',
  backgroundColor: 'var(--color-bg-surface)',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
};

const drawerHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #dadce0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeDrawerButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#5f6368',
  cursor: 'pointer',
};

const chatBodyStyle = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  backgroundColor: 'var(--color-bg-app)',
};

const chatEmptyStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--color-text-tertiary)',
  textAlign: 'center',
  fontSize: '0.82rem',
  padding: '2rem',
};

const messageRowStyle = {
  display: 'flex',
  width: '100%',
};

const messageBubbleStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  maxWidth: '80%',
  fontSize: '0.82rem',
  lineHeight: 1.45,
};

const chatInputFormStyle = {
  padding: '1rem 1.5rem',
  borderTop: '1px solid #dadce0',
  display: 'flex',
  gap: '0.5rem',
};

const chatInputStyle = {
  flex: 1,
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
};

const chatSendButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const searchResultsContainerStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '2rem',
};

const clearSearchButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#d93025',
  fontWeight: 600,
  fontSize: '0.8rem',
  cursor: 'pointer',
};