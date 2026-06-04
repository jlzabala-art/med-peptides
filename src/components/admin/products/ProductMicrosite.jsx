import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ChevronDown, ChevronUp, Bot, MessageSquare, FileText, LineChart, Stethoscope, Link2 } from 'lucide-react';
import AppStatusToggle from '../../ui/AppStatusToggle';

export default function ProductMicrosite({ product, onUpdateProduct }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(product.clinical_summary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'ai', text: `Hello! I'm Atlas AI. I've loaded the data for ${product.name}. What would you like to know about its clinical applications or interactions?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null); // 'clinical', 'inventory', 'protocols', 'ai'
  const [relatedProtocols, setRelatedProtocols] = useState([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);

  const handleEnrichData = async () => {
    setIsEnriching(true);
    try {
      const enrichProductData = httpsCallable(functions, 'enrichProductData');
      const response = await enrichProductData({ productId: product.id });
      if (response.data.success) {
        if (onUpdateProduct) {
          // Pass the enriched fields back up so the UI refreshes
          onUpdateProduct({ ...product, ...response.data.data });
        }
        alert(`Data enriched successfully! Fields updated: ${response.data.enrichedFields.join(', ')}`);
      }
    } catch (error) {
      console.error('Error enriching data:', error);
      alert('Error enriching data: ' + error.message);
    } finally {
      setIsEnriching(false);
    }
  };

  useEffect(() => {
    async function fetchBatches() {
      setLoadingBatches(true);
      try {
        // Querying all batches for this product (needs where if it scales, but filtering here for now to avoid needing composite indexes if we order)
        // A simple where is fine:
        const { query, where, collection, getDocs } = await import('firebase/firestore');
        const docsRef = collection(db, 'uploaded_documents');
        const q = query(docsRef, where('productId', '==', product.id));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually by date
        data.sort((a, b) => {
          const d1 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const d2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return d2 - d1;
        });
        setBatches(data);
      } catch (err) {
        console.error('Error fetching batches', err);
      } finally {
        setLoadingBatches(false);
      }
    }
    fetchBatches();
  }, [product.id, product.sku]);

  useEffect(() => {
    async function fetchRelatedProtocols() {
      setLoadingProtocols(true);
      try {
        const protocolsRef = collection(db, 'protocols');
        const snap = await getDocs(protocolsRef);
        const allProtocols = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const matched = allProtocols.filter(p => {
          if (!p.phases) return false;
          return p.phases.some(phase => 
            phase.items && phase.items.some(item => item.productId === product.id || item.productId === product.sku)
          );
        });
        setRelatedProtocols(matched);
      } catch (err) {
        console.error('Error fetching related protocols', err);
      } finally {
        setLoadingProtocols(false);
      }
    }
    fetchRelatedProtocols();
  }, [product.id, product.sku]);

  useEffect(() => {
    if (!product.materia_medica && !product.clinical_summary) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        const mockSummary = `**${product.name}** is typically categorized under ${product.category}. \n\n### Mechanism of Action\nData not available. Please wait for the auto-enrichment script to process this product.\n\n### Clinical Applications\n- N/A\n\n### Contraindications\n- N/A`;
        setSummary(mockSummary);
        setIsGenerating(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [product]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newLog = [...chatLog, { role: 'user', text: chatInput }];
    setChatLog(newLog);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setChatLog([...newLog, { 
        role: 'ai', 
        text: `Based on the clinical profile of ${product.name}, I am analyzing the provided Materia Medica. (This is a placeholder for the actual ClinicDAG LLM integration which will be hooked up shortly).` 
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const materia = product.materia_medica;

  const AccordionHeader = ({ title, subtitle, icon: Icon, id }) => {
    const isExpanded = expandedAccordion === id;
    return (
      <button 
        type="button"
        onClick={() => setExpandedAccordion(isExpanded ? null : id)}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${id}`}
        style={{ 
          width: '100%',
          padding: '1.25rem 1.5rem', 
          backgroundColor: isExpanded ? '#f8fafc' : '#ffffff', 
          borderBottom: '1px solid #e2e8f0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          outline: 'none',
          border: 'none',
          textAlign: 'left'
        }}
        onFocus={(e) => e.target.style.boxShadow = 'inset 0 0 0 2px #3b82f6'}
        onBlur={(e) => e.target.style.boxShadow = 'none'}
        onMouseEnter={(e) => { if (!isExpanded) e.target.style.backgroundColor = '#f8fafc'; }}
        onMouseLeave={(e) => { if (!isExpanded) e.target.style.backgroundColor = '#ffffff'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '8px',
            backgroundColor: isExpanded ? '#eff6ff' : '#f1f5f9',
            color: isExpanded ? '#2563eb' : '#64748b',
            transition: 'all 0.2s ease'
          }}>
            {Icon && <Icon size={20} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: isExpanded ? '#0f172a' : '#334155' }}>{title}</span>
            {subtitle && <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{subtitle}</span>}
          </div>
        </div>
        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', backgroundColor: isExpanded ? '#e2e8f0' : 'transparent' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
    );
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      margin: '0.5rem 0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>

      {/* Accordion 1: Clinical Information */}
      <AccordionHeader 
        title="Clinical Information" 
        subtitle="Materia Medica, MOA, and contraindications"
        icon={Stethoscope}
        id="clinical" 
      />
      <div 
        id="accordion-content-clinical"
        style={{ 
          display: expandedAccordion === 'clinical' ? 'block' : 'none',
          padding: '1.5rem', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {isGenerating ? (
          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', borderWidth: '0.15em' }}></span>
            Checking AI Data...
          </div>
        ) : materia ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* CAS Number Header if present */}
              {product.casNumber && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CAS Registry Number</span>
                  <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600, fontSize: '1rem' }}>{product.casNumber}</span>
                </div>
              )}

              {/* AI Enriched Badge */}
              {product.lastEnrichedAt && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0fdf4', color: '#166534', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <Bot size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>AI Enriched Data</span>
                  <span style={{ fontSize: '0.75rem', color: '#15803d' }}>
                    ({new Date(product.lastEnrichedAt).toLocaleDateString()})
                  </span>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Mechanism of Action</h4>
                <button
                  onClick={handleEnrichData}
                  disabled={isEnriching}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600,
                    backgroundColor: '#eff6ff', color: '#2563eb', border: 'none',
                    borderRadius: '6px', cursor: isEnriching ? 'not-allowed' : 'pointer',
                    opacity: isEnriching ? 0.7 : 1
                  }}
                >
                  {isEnriching ? (
                    <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span> Enriching...</>
                  ) : (
                    <><Bot size={14} /> Enrich Data (AI)</>
                  )}
                </button>
              </div>
              {materia.mechanism_of_action && (
                <div style={{ marginTop: '0.5rem' }}>
                  {(() => {
                    const text = materia.mechanism_of_action;
                    const sentences = text.split(/\.\s+/).filter(Boolean);
                    if (sentences.length <= 1) return <p style={{ margin: 0, textAlign: 'justify', lineHeight: '1.5' }}>{text}</p>;
                    return (
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.5' }}>
                        {sentences.map((s, i) => (
                          <li key={i}>{s.trim()}{s.trim().endsWith('.') ? '' : '.'}</li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#0f172a', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>Clinical Applications</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {materia.clinical_applications?.map((app, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{app}</li>
                ))}
              </ul>
            </div>

            {materia.contraindications && materia.contraindications.length > 0 && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#991b1b', fontWeight: 700, borderBottom: '2px solid #fecaca', paddingBottom: '0.5rem' }}>Contraindications & Interactions</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#b91c1c' }}>
                  {materia.contraindications.map((ci, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{ci}</li>
                  ))}
                </ul>
              </div>
            )}

            {materia.references && materia.references.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scientific References</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                  {materia.references.map((ref, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s', ':hover': { color: '#2563eb' } }}>
                        {ref.title || 'View Study'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Contact Action */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                onClick={() => window.location.href = `/admin/messages?to=medical_team&product=${product.sku}`} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#334155'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
              >
                <MessageSquare size={18} /> Request Additional Information
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ 
              __html: summary
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)\n/g, '<h4 style="margin: 1.5rem 0 0.5rem; font-size: 1rem; color: #0f172a; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">$1</h4>')
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/\n- /g, '<br/>&bull; ') 
            }}
          />
        )}
      </div>

      {/* Accordion 2: Batches & CoAs */}
      <AccordionHeader 
        title="Batches & CoAs" 
        subtitle="Quality control and laboratory certificates"
        icon={FileText}
        id="batches" 
      />
      <div 
        id="accordion-content-batches"
        style={{ 
          display: expandedAccordion === 'batches' ? 'block' : 'none',
          padding: '1.5rem', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out',
          backgroundColor: '#f8fafc'
        }}
      >
        {loadingBatches ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading batches...</div>
        ) : batches.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No batches or CoAs registered for this product.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {batches.map(batch => (
              <div key={batch.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Document: {batch.fileName || batch.id}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', fontWeight: 600 }}>{batch.documentType || 'CoA'}</span>
                  </div>
                </div>
                
                {batch.extractedData && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Peptide</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.peptide_name || 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Dosage</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.dosage || 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>HPLC Purity</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.purity_percentage || batch.extractedData.purityHPLC ? `${batch.extractedData.purity_percentage || batch.extractedData.purityHPLC}` : 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Net Content</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.extractedData.netPeptideContent ? `${batch.extractedData.netPeptideContent}` : 'N/A'}</span></div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Result / Status</span><span style={{ fontWeight: 700, color: batch.extractedData.conclusion === 'Pass' || batch.extractedData.conclusion === 'Approved' ? '#10b981' : '#f59e0b' }}>{batch.extractedData.conclusion || 'N/A'}</span></div>
                  </div>
                )}
                
                {batch.url && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <a href={batch.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FileText size={14} /> View Original Document (PDF) &rarr;
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 3: AI Access */}
      <AccordionHeader 
        title="AI Access (ClinicDAG Assistant)" 
        subtitle="Chat with AI about this specific product"
        icon={Bot}
        id="ai" 
      />
      <div 
        id="accordion-content-ai"
        style={{ 
          display: expandedAccordion === 'ai' ? 'flex' : 'none',
          flexDirection: 'column',
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Atlas AI Q&A</span>
          </div>
          <div style={{ padding: '1.5rem', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatLog.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {msg.role === 'user' ? 'You' : 'Atlas AI'}
                </span>
                <div style={{
                  backgroundColor: msg.role === 'user' ? '#0f172a' : '#f1f5f9',
                  color: msg.role === 'user' ? 'white' : '#334155',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  borderBottomRightRadius: msg.role === 'user' ? 0 : '8px',
                  borderBottomLeftRadius: msg.role === 'ai' ? 0 : '8px',
                  fontSize: '0.85rem',
                  maxWidth: '85%',
                  lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                Atlas AI is typing...
              </div>
            )}
          </div>
          <form onSubmit={handleSendChat} style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask something about the clinical profile..."
              style={{ flex: 1, padding: '1rem 1.5rem', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#0f172a' }}
            />
            <button type="submit" disabled={!chatInput.trim() || isTyping} style={{ padding: '0 1.5rem', backgroundColor: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', opacity: (!chatInput.trim() || isTyping) ? 0.5 : 1 }}>
              Send
            </button>
          </form>
        </div>
      {/* Accordion 4: Competitor Tracking */}
      <AccordionHeader 
        title="Competitor Analysis (Track Pricing)" 
        subtitle="Monitor competitor prices daily"
        icon={LineChart}
        id="competitors" 
      />
      <div 
        id="accordion-content-competitors"
        style={{ 
          display: expandedAccordion === 'competitors' ? 'block' : 'none',
          padding: '1.5rem', 
          borderBottom: '1px solid #e2e8f0',
          animation: 'fadeIn 0.3s ease-in-out',
          backgroundColor: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Active Price Monitoring</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              If you enable this option, the scraper will search for this product's prices in competitors' catalogs every night.
            </p>
          </div>
          <AppStatusToggle 
            isActive={!!product.trackCompetitors}
            activeLabel="Monitoring Active"
            inactiveLabel="Monitoring Disabled"
            onToggle={() => {
              if (onUpdateProduct) {
                onUpdateProduct(product.id, { trackCompetitors: !product.trackCompetitors });
              }
            }}
          />
        </div>
      </div>

      {/* Accordion 5: Accounting & Integration (Zoho Books) */}
      <AccordionHeader 
        title="Accounting & Integration" 
        subtitle="Zoho Books account mappings and sync status"
        icon={Link2}
        id="accounting" 
      />
      <div 
        id="accordion-content-accounting"
        style={{ 
          display: expandedAccordion === 'accounting' ? 'block' : 'none',
          padding: '1.5rem', 
          backgroundColor: '#f8fafc'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#0f172a' }}>Sales Information</h5>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Sales Account</label>
              <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                {product.salesAccount || 'Sales (System Default)'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Sales Tax</label>
              <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                {product.taxId || 'Tax Exempt (Default)'}
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#0f172a' }}>Purchase Information</h5>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Purchase Account</label>
              <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                {product.purchaseAccount || 'Cost of Goods Sold (System Default)'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Zoho Item ID</label>
              <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                {product.zoho_item_id || 'Not synced yet'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
          * Account mapping is controlled by Zoho Books (Source of Truth)
        </div>
      </div>
    </div>
  );
}
