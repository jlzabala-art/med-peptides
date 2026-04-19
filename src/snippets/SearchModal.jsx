import { Search, X, FlaskConical, Beaker, Activity, Zap, Sparkles, Brain, Dumbbell, Droplets, ShieldAlert, Sparkle, ClipboardList, Clock, MessageCircle, ArrowRight, HelpCircle, ExternalLink } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts, searchProtocols, searchFAQ, getSearchThemes, isQuestion, buildFAQIndex } from '../utils/searchEngine';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function SearchModal({ isOpen, onClose, onSelectProduct, products, allFaqs = [], allMappings = [], protocolIndex = [], initialQuery = '', onQueryChange }) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [showAll, setShowAll] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialQuery);
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen, initialQuery]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setShowAll(false);
    setSelectedFaqId(null);
    if (onQueryChange) {
      onQueryChange(val);
    }
  };

  const faqIndex = useMemo(() => buildFAQIndex(allFaqs, allMappings), [allFaqs, allMappings]);

  const searchResults = useMemo(() => searchProducts(searchTerm, products, protocolIndex), [searchTerm, products, protocolIndex]);
  const protocolResults = useMemo(() => searchProtocols(searchTerm, protocolIndex), [searchTerm, protocolIndex]);
  const faqResults = useMemo(() => searchFAQ(searchTerm, faqIndex), [searchTerm, faqIndex]);

  const searchThemes = useMemo(() => getSearchThemes(searchResults), [searchResults]);
  const questionMode = useMemo(() => isQuestion(searchTerm), [searchTerm]);

  // Flatten products × variants — each variant becomes its own row
  const flatVariantRows = useMemo(() => {
    const rows = [];
    searchResults.forEach((p) => {
      const variants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [null];
      variants.forEach((v, vi) => {
        rows.push({ product: p, variant: v, variantIndex: vi, isFirstVariant: vi === 0 });
      });
    });
    return rows;
  }, [searchResults]);

  // Always show ALL variants for the first product; cap the rest to 6 total
  const displayProducts = useMemo(() => {
    if (showAll || flatVariantRows.length === 0) return flatVariantRows;
    // Find how many rows belong to the first product (they appear first in flatVariantRows)
    const firstProductId = flatVariantRows[0]?.product?.id || flatVariantRows[0]?.product?.name;
    const firstProductRows = flatVariantRows.filter(r =>
      (r.product?.id || r.product?.name) === firstProductId
    );
    const restRows = flatVariantRows
      .filter(r => (r.product?.id || r.product?.name) !== firstProductId)
      .slice(0, Math.max(0, 6 - firstProductRows.length));
    return [...firstProductRows, ...restRows];
  }, [flatVariantRows, showAll]);
  const displayProtocols = showAll ? protocolResults : protocolResults.slice(0, 3);
  const displayFaqs = showAll ? faqResults : faqResults.slice(0, 3);

  if (!isOpen) return null;

  return (
    <div className="search-modal-container" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 4000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 'clamp(1rem, 5vh, 2rem) 1rem',
      backgroundColor: 'rgba(7, 10, 15, 0.95)',
      backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .search-result-card:hover { transform: translateY(-3px); border-color: var(--primary) !important; box-shadow: 0 12px 20px -8px rgba(0,0,0,0.3); }
        .protocol-result-card:hover { transform: translateY(-3px); border-color: #10b981 !important; box-shadow: 0 12px 20px -8px rgba(16,185,129,0.2); }
        .faq-result-card:hover { transform: translateY(-3px); border-color: #a855f7 !important; box-shadow: 0 12px 20px -8px rgba(168,85,247,0.2); }
      `}</style>
      
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        marginTop: '1rem',
        border: '1px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Search Input Area */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: '#fcfdfe' }}>
          <Search size={24} style={{ color: questionMode ? '#a855f7' : '#00a3e0' }} />
          <input 
            autoFocus
            type="text"
            placeholder="Ask a question or search products & protocols..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              fontSize: '1.25rem',
              outline: 'none',
              fontFamily: 'inherit',
              color: '#0f172a',
              fontWeight: 500,
              backgroundColor: 'transparent'
            }}
          />
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Results Area */}
        <div style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
          {!searchTerm.trim() ? (
            <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#f1f5f9', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                color: '#CBD5E1'
              }}>
                <Brain size={40} />
              </div>
              <h3 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Discovery Engine</h3>
              <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '300px', margin: '0 auto' }}>Query across $med database: Products, Specialized Protocols, and Clinical FAQs.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                {['Fat Loss', 'Hair Recovery', 'Healing'].map(tag => (
                  <button key={tag} onClick={() => setSearchTerm(tag)} style={{
                    padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white',
                    color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (searchResults.length === 0 && protocolResults.length === 0 && faqResults.length === 0) ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <HelpCircle size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>No clinical matches for "{searchTerm}"</p>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>Try searching by peptide name, biological goal, or a full question.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Intelligent Overview Headers */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto' }}>
                  <Sparkles size={16} style={{ color: '#00a3e0' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unified Search Results</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '100px' }}>{flatVariantRows.length} VARIANTS</span>
                  <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '100px' }}>{protocolResults.length} PROTOCOLS</span>
                  <span style={{ backgroundColor: '#faf5ff', color: '#7e22ce', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '100px' }}>{faqResults.length} QUESTIONS</span>
                </div>
              </div>

              {/* PRODUCTS SECTION (BLUE) */}
              {displayProducts.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00a3e0' }} />
                    RESEARCH PRODUCTS
                  </h4>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {displayProducts.map(({ product: p, variant: v, variantIndex, isFirstVariant }, idx) => {
                      const isBestMatch = idx === 0 && p.searchScore >= 10;
                      const strength = v ? (v.strength || v.dosage || v.label) : null;
                      const displayLabel = strength
                        ? `${p.displayName || p.name} — ${strength}`
                        : (p.displayName || p.name);
                      return (
                        <div
                          key={`p-${p.id || p.name}-v${variantIndex}`}
                          className="search-result-card"
                          onClick={() => {
                            onSelectProduct({ ...p, _preselectedVariantIndex: variantIndex });
                            onClose();
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1.25rem',
                            padding: isFirstVariant ? '1.25rem' : '0.85rem 1.25rem 0.85rem 4.25rem',
                            backgroundColor: '#ffffff',
                            borderRadius: '18px',
                            border: isBestMatch ? '2px solid #00a3e0' : isFirstVariant ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                            cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
                            marginLeft: isFirstVariant ? '0' : '0.5rem',
                            opacity: isFirstVariant ? 1 : 0.92
                          }}
                        >
                          {isBestMatch && (
                            <div style={{
                              position: 'absolute', top: 0, right: '1.25rem', backgroundColor: '#00a3e0', color: 'white',
                              padding: '4px 10px', fontSize: '0.65rem', fontWeight: 800, borderBottomLeftRadius: '10px',
                              display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
                            }}>
                              <Sparkle size={10} fill="white" /> Best Match
                            </div>
                          )}
                          {isFirstVariant && (
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#f0f9ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00a3e0',
                              flexShrink: 0
                            }}>
                              {p.category === 'Research Supplies' ? <Beaker size={22} /> : <FlaskConical size={22} />}
                            </div>
                          )}
                          {!isFirstVariant && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#bae6fd', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: isFirstVariant ? 700 : 600, fontSize: isFirstVariant ? '1rem' : '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span>{displayLabel}</span>
                              {strength && (
                                <span style={{
                                  fontSize: '0.68rem', fontWeight: 700,
                                  padding: '2px 9px', borderRadius: '20px',
                                  backgroundColor: '#e0f2fe', color: '#0369a1',
                                  letterSpacing: '0.02em', whiteSpace: 'nowrap'
                                }}>{strength}</span>
                              )}
                            </div>
                            {isFirstVariant && (
                              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                <span>{p.scientificName || 'Biological Peptide'}</span>
                                {p.protocolCount > 0 && (
                                  <span style={{ color: '#0ea5e9', fontWeight: 600 }}>In {p.protocolCount} protocol{p.protocolCount !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <ArrowRight size={16} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PROTOCOLS SECTION (GREEN) */}
              {displayProtocols.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    CLINICAL PROTOCOLS
                  </h4>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {displayProtocols.map((protocol, idx) => {
                      const isBestProtocol = idx === 0 && protocol.searchScore >= 10;
                      return (
                        <div 
                          key={`prot-${idx}`}
                          className="protocol-result-card"
                          onClick={() => { onClose(); navigate(`/protocol-builder?templateId=${protocol.protocol_id}&startAtPhase=timeline`); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem',
                            backgroundColor: '#ffffff', borderRadius: '20px', border: isBestProtocol ? '2px solid #10b981' : '1px solid #e2e8f0',
                            cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                          }}
                        >
                          {isBestProtocol && (
                            <div style={{
                              position: 'absolute', top: 0, right: '1.25rem', backgroundColor: '#10b981', color: 'white',
                              padding: '4px 10px', fontSize: '0.65rem', fontWeight: 800, borderBottomLeftRadius: '10px',
                              display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
                            }}>
                              <Activity size={10} /> Recommended Protocol
                            </div>
                          )}
                          <div style={{ 
                            width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f0fdf4', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
                          }}>
                            <ClipboardList size={24} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{protocol.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {protocol.duration_weeks}w</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FlaskConical size={12} /> {protocol.products_used?.length || 0} Products</span>
                              <span style={{ fontWeight: 600, color: '#16a34a' }}>Target: {protocol.category}</span>
                            </div>
                          </div>
                          <div style={{ 
                            padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '10px', 
                            color: '#16a34a', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap'
                          }}>BUILDER</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAQ SECTION (PURPLE) */}
              {displayFaqs.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                    CLINICAL FAQ & INSIGHTS
                  </h4>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {displayFaqs.map((faq, idx) => {
                      const isMostRelevant = idx === 0 && (faq.searchScore >= 10 || questionMode);
                      const isExpanded = selectedFaqId === faq.faqId;
                      return (
                        <div 
                          key={`faq-${idx}`}
                          className="faq-result-card"
                          onClick={() => setSelectedFaqId(isExpanded ? null : faq.faqId)}
                          style={{
                            padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '24px', 
                            border: isMostRelevant ? '2px solid #a855f7' : '1px solid #e2e8f0',
                            cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                          }}
                        >
                          {isMostRelevant && (
                            <div style={{
                              position: 'absolute', top: 0, right: '1.25rem', backgroundColor: '#a855f7', color: 'white',
                              padding: '4px 10px', fontSize: '0.65rem', fontWeight: 800, borderBottomLeftRadius: '10px',
                              display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
                            }}>
                              <Brain size={10} /> Top Answer
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                            <div style={{ 
                              width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#faf5ff', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', flexShrink: 0
                            }}>
                              <MessageCircle size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', lineHeight: '1.4' }}>{faq.question}</div>
                              <div style={{ 
                                fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem', 
                                lineHeight: '1.5', display: isExpanded ? 'block' : '-webkit-box',
                                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden'
                              }}>
                                {faq.shortAnswer || faq.answer}
                              </div>
                              
                              {isExpanded && (
                                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Related Context</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {faq.tags?.slice(0, 3).map(tag => (
                                      <span key={tag} style={{ backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>#{tag}</span>
                                    ))}
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onClose(); navigate('/faq'); }}
                                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#a855f7', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      Full View <ExternalLink size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(searchResults.length > 3 || protocolResults.length > 3 || faqResults.length > 3) && !showAll && (
                <button 
                  onClick={() => setShowAll(true)}
                  style={{
                    width: '100%', padding: '1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '16px',
                    color: '#475569', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                >
                  Show All Clinical Matches ({searchResults.length + protocolResults.length + faqResults.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Area with Stats & Disclaimer */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfeff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00a3e0' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>v5.6 Discovery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
              <ShieldAlert size={14} />
              <span style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '300px' }}>Laboratory Research Only. Strict safety protocols required.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Press <strong>Esc</strong> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
