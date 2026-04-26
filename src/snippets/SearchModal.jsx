import { Search, X, FlaskConical, Beaker, Activity, Zap, Sparkles, Brain, Dumbbell, Droplets, ShieldAlert, Sparkle, ClipboardList, Clock, MessageCircle, ArrowRight, HelpCircle, ExternalLink } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts, searchProtocols, searchFAQ, getSearchThemes, isQuestion, buildFAQIndex } from '../utils/searchEngine';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function SearchModal({ isOpen, onClose, onSelectProduct, products, allFaqs = [], protocolIndex = [], initialQuery = '', onQueryChange }) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [showAll, setShowAll] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [focusedIndex, setFocusedIndex] = useState(-1);
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
    setActiveTab('products');
    setFocusedIndex(-1);
    if (onQueryChange) onQueryChange(val);
  };



  const faqIndex = useMemo(() => buildFAQIndex(allFaqs), [allFaqs]);

  const searchResults = useMemo(() => searchProducts(searchTerm, products, protocolIndex), [searchTerm, products, protocolIndex]);
  const protocolResults = useMemo(() => searchProtocols(searchTerm, protocolIndex), [searchTerm, protocolIndex]);
  const faqResults = useMemo(() => searchFAQ(searchTerm, faqIndex), [searchTerm, faqIndex]);

  const searchThemes = useMemo(() => getSearchThemes(searchResults), [searchResults]);
  const questionMode = useMemo(() => isQuestion(searchTerm), [searchTerm]);

  // One entry per unique product — variants shown as chips inside the card
  const displayProducts = useMemo(() => {
    if (showAll) return searchResults;
    if (searchResults.length === 0) return [];
    return searchResults.slice(0, 6);
  }, [searchResults, showAll]);
  const displayProtocols = showAll ? protocolResults : protocolResults.slice(0, 3);
  const displayFaqs = showAll ? faqResults : faqResults.slice(0, 3);

  // Plain inline expression — avoids any useMemo closure TDZ in minified bundles
  const navigableItems =
    activeTab === 'products'  ? (displayProducts  || []) :
    activeTab === 'protocols' ? (displayProtocols || []) :
    activeTab === 'questions' ? (displayFaqs      || []) : [];

  const handleKeyDown = (e) => {
    if (!searchTerm.trim()) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, navigableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const item = navigableItems[focusedIndex];
      if (!item) return;
      if (activeTab === 'products')  { onSelectProduct(item); onClose(); }
      if (activeTab === 'protocols') { onClose(); navigate(`/protocol/${item.protocol_id}`); }
      if (activeTab === 'questions') { setSelectedFaqId(prev => prev === item.faqId ? null : item.faqId); }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-container" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 4000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 'clamp(0.75rem, 4vh, 2rem) 1rem',
      backgroundColor: 'rgba(5, 8, 14, 0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      animation: 'smFadeIn 0.18s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes smFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes smSlideDown { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .srCard:hover { transform: translateY(-2px); border-color: rgba(0,163,224,0.6) !important; box-shadow: 0 8px 24px -6px rgba(0,163,224,0.15) !important; }
        .srProtocol:hover { transform: translateY(-2px); border-color: rgba(16,185,129,0.6) !important; box-shadow: 0 8px 24px -6px rgba(16,185,129,0.12) !important; }
        .srFaq:hover { transform: translateY(-2px); border-color: rgba(168,85,247,0.6) !important; box-shadow: 0 8px 24px -6px rgba(168,85,247,0.12) !important; }
        .smInput::placeholder { color: rgba(100,116,139,0.7); }
        .smCloseBtn:hover { background: rgba(255,255,255,0.12) !important; }
        .smTabBtn { transition: color 0.2s, opacity 0.2s; }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '780px',
        backgroundColor: 'rgba(22, 28, 45, 0.98)',
        borderRadius: '24px',
        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.08)',
        overflow: 'hidden',
        animation: 'smSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        marginTop: '1rem',
        border: '0.5px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>

        {/* Search Input Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <Search size={20} strokeWidth={1.5} style={{ color: questionMode ? '#a78bfa' : '#00a3e0', flexShrink: 0, opacity: 0.9 }} />
          <input
            className="smInput"
            ref={inputRef}
            autoFocus
            type="search"
            inputMode="search"
            placeholder="Search products, protocols or ask a clinical question…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              fontSize: '1.05rem',
              outline: 'none',
              fontFamily: 'inherit',
              color: '#f1f5f9',
              fontWeight: 500,
              backgroundColor: 'transparent',
              letterSpacing: '-0.01em'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                transition: 'background 0.2s',
                fontSize: '0.65rem',
                fontWeight: 700,
                gap: '3px'
              }}
            >
              <X size={12} strokeWidth={1.5} /> Clear
            </button>
          )}
          <button
            className="smCloseBtn"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              flexShrink: 0,
              transition: 'background 0.2s'
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        {searchTerm.trim() && (
          <div style={{
            display: 'flex',
            borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            padding: '0 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            gap: '0'
          }}>
            {[
              { key: 'products',  label: 'Products',  count: searchResults.length,   color: '#00a3e0' },
              { key: 'protocols', label: 'Protocols', count: protocolResults.length,  color: '#10b981' },
              { key: 'questions', label: 'Questions', count: faqResults.length,       color: '#a78bfa' },
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  className="smTabBtn"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.85rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    letterSpacing: '0.02em',
                    color: isActive ? tab.color : 'rgba(148,163,184,0.6)',
                    borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                    marginBottom: '-0.5px',
                    transition: 'color 0.2s, border-color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '20px',
                    backgroundColor: isActive ? `${tab.color}22` : 'rgba(255,255,255,0.06)',
                    color: isActive ? tab.color : 'rgba(148,163,184,0.5)',
                    transition: 'all 0.2s',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Filter Pills — mobile thumb-friendly categories */}
        {!searchTerm.trim() && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            overflowX: 'auto',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'none',
          }}>
            {[
              { label: '🔥 Fat Loss', q: 'Fat Loss' },
              { label: '💉 Peptides', q: 'Peptide' },
              { label: '🦱 Hair', q: 'Hair' },
              { label: '🏋️ Recovery', q: 'Recovery' },
              { label: '🧬 Longevity', q: 'Longevity' },
              { label: '🩹 Healing', q: 'Healing' },
            ].map(({ label, q }) => (
              <button
                key={q}
                onClick={() => handleSearchChange(q)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(148,163,184,0.85)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,163,224,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,163,224,0.4)'; e.currentTarget.style.color = '#00a3e0'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Results Area */}
        <div style={{ maxHeight: '66vh', overflowY: 'auto', padding: '1.25rem 1.5rem', backgroundColor: 'transparent' }}>
          {!searchTerm.trim() ? (
            <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', color: 'rgba(148,163,184,0.4)'
              }}>
                <Brain size={36} />
              </div>
              <h3 style={{ color: 'rgba(241,245,249,0.9)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Clinical Discovery</h3>
              <p style={{ color: 'rgba(100,116,139,0.8)', fontSize: '0.875rem', maxWidth: '280px', margin: '0 auto', lineHeight: 1.6 }}>Search products, protocols and clinical Q&A across the Antigravity database.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
                {['Fat Loss', 'Hair Recovery', 'Healing'].map(tag => (
                  <button key={tag} onClick={() => setSearchTerm(tag)} style={{
                    padding: '6px 14px', borderRadius: '10px',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(148,163,184,0.8)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}>{tag}</button>
                ))}
              </div>
            </div>
          ) : (searchResults.length === 0 && protocolResults.length === 0 && faqResults.length === 0) ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <HelpCircle size={40} style={{ color: 'rgba(100,116,139,0.4)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(148,163,184,0.8)' }}>No matches for &ldquo;{searchTerm}&rdquo;</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(100,116,139,0.6)', marginTop: '0.4rem' }}>Try peptide name, biological goal, or a clinical question.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {activeTab === 'products' && displayProducts.length > 0 && (
                <div>
                <h4 style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00a3e0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00a3e0' }} />
                  Research Products
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {displayProducts.map((p, idx) => {
                      const isBestMatch = idx === 0 && p.searchScore >= 10;
                      // Collect dosage/strength chips: prefer subcollection variants,
                      // fall back to allStrengths (aggregated by searchEngine from any source)
                      let variantChips = [];
                      if (Array.isArray(p.variants) && p.variants.length > 0) {
                        variantChips = p.variants
                          .map(v => v.strength || v.dosage || v.label)
                          .filter(Boolean)
                          .filter((v, i, a) => a.indexOf(v) === i);
                      }
                      if (variantChips.length === 0 && Array.isArray(p.allStrengths) && p.allStrengths.length > 0) {
                        variantChips = p.allStrengths.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
                      }

                      return (
                        <div
                          key={`p-${p.id || p.name}-${idx}`}
                          className="srCard"
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '1rem 1.25rem',
                            background: focusedIndex === idx ? 'rgba(0,163,224,0.08)' : 'rgba(255,255,255,0.04)',
                            borderRadius: '14px',
                            border: focusedIndex === idx
                              ? '0.5px solid rgba(0,163,224,0.6)'
                              : isBestMatch ? '0.5px solid rgba(0,163,224,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
                            transform: focusedIndex === idx ? 'translateY(-2px)' : undefined,
                            boxShadow: focusedIndex === idx ? '0 6px 20px -6px rgba(0,163,224,0.25)' : undefined,
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
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(0,163,224,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00a3e0',
                            flexShrink: 0
                          }}>
                            {p.category === 'Research Supplies' ? <Beaker size={22} /> : <FlaskConical size={22} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Product name — shown ONCE */}
                            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'rgba(241,245,249,0.9)' }}>
                              {p.displayName || p.name}
                            </div>
                            {/* Sub-info row */}
                            <div style={{ fontSize: '0.74rem', color: 'rgba(100,116,139,0.7)', display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                              <span>
                                {p.casNumber ? `CAS ${p.casNumber}` : p.sku ? `SKU ${p.sku}` : p.scientificName || 'Biological Peptide'}
                              </span>
                              {p.protocolCount > 0 && (
                                <span style={{ color: '#0ea5e9', fontWeight: 600 }}>In {p.protocolCount} protocol{p.protocolCount !== 1 ? 's' : ''}</span>
                              )}
                            </div>
                            {/* Variant chips */}
                            {variantChips.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                                {variantChips.map(chip => (
                                  <span key={chip} style={{
                                    fontSize: '0.67rem', fontWeight: 700,
                                    padding: '2px 8px', borderRadius: '20px',
                                    backgroundColor: '#e0f2fe', color: '#0369a1',
                                    letterSpacing: '0.02em', whiteSpace: 'nowrap'
                                  }}>{chip}</span>
                                ))}
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

              {/* PROTOCOLS SECTION */}
              {activeTab === 'protocols' && displayProtocols.length > 0 && (
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
                          className="srProtocol"
                          onClick={() => { onClose(); navigate(`/protocol/${protocol.protocol_id}`); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                            background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
                            border: isBestProtocol ? '0.5px solid rgba(16,185,129,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                          }}
                        >
                          {isBestProtocol && (
                            <div style={{
                              position: 'absolute', top: 0, right: '1rem', backgroundColor: '#10b981', color: 'white',
                              padding: '3px 10px', fontSize: '0.6rem', fontWeight: 800, borderBottomLeftRadius: '8px',
                              display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
                            }}>
                              <Activity size={9} /> Recommended
                            </div>
                          )}
                          <div style={{ 
                            width: '44px', height: '44px', borderRadius: '12px',
                            backgroundColor: 'rgba(16,185,129,0.12)',
                            border: '0.5px solid rgba(16,185,129,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399',
                            flexShrink: 0
                          }}>
                            <ClipboardList size={22} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(241,245,249,0.92)', lineHeight: 1.3 }}>
                              {protocol.metadata?.scientificName || protocol.name}
                            </div>
                            {protocol.metadata?.scientificName && protocol.name && (
                              <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.45)', marginTop: '0.1rem', fontWeight: 500 }}>
                                {protocol.name}
                              </div>
                            )}
                            <div style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.6)', display: 'flex', gap: '1rem', marginTop: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> {protocol.duration_weeks}w</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FlaskConical size={11} /> {protocol.products_used?.length || 0} productos</span>
                              {protocol.category && (
                                <span style={{ fontWeight: 600, color: '#34d399' }}>{protocol.category}</span>
                              )}
                            </div>
                          </div>
                          <ArrowRight size={16} style={{ color: 'rgba(52,211,153,0.5)', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAQ SECTION */}
              {activeTab === 'questions' && displayFaqs.length > 0 && (
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
                          className="srFaq"
                          onClick={() => setSelectedFaqId(isExpanded ? null : faq.faqId)}
                          style={{
                            padding: '1rem 1.25rem',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '14px',
                            border: isMostRelevant ? '0.5px solid rgba(168,85,247,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
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
                              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'rgba(241,245,249,0.9)', lineHeight: '1.4' }}>{faq.question}</div>
                              <div style={{
                                fontSize: '0.82rem', color: 'rgba(100,116,139,0.8)', marginTop: '0.4rem',
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

              {/* Show more within active tab */}
              {(
                (activeTab === 'products' && searchResults.length > 6 && !showAll) ||
                (activeTab === 'protocols' && protocolResults.length > 3 && !showAll) ||
                (activeTab === 'questions' && faqResults.length > 3 && !showAll)
              ) && (
                <button
                  onClick={() => setShowAll(true)}
                  style={{
                    width: '100%', padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Show More Results
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.9rem 1.5rem',
          borderTop: '0.5px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00a3e0' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(100,116,139,0.7)' }}>Antigravity Discovery</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'rgba(100,116,139,0.5)' }}>Press <strong style={{ color: 'rgba(148,163,184,0.6)' }}>Esc</strong> to close</span>
        </div>
      </div>
    </div>
  );
}
