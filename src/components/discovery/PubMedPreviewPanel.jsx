import X from "lucide-react/dist/esm/icons/x";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Clock from "lucide-react/dist/esm/icons/clock";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Activity from "lucide-react/dist/esm/icons/activity";
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';









import { getPubMedLiterature } from '../../services/pubmedService';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

export default function PubMedPreviewPanel({ isOpen, onClose, product }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  // 1. ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle browser back button to close panel gracefully on mobile
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ pubmedPanel: true }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  // Fetch PubMed articles when panel opens
  useEffect(() => {
    if (isOpen && product) {
      setLoading(true);
      setError(null);
      setExpandedAbstracts({});
      getPubMedLiterature(product)
        .then(data => {
          setArticles(data || []);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load scientific literature. Please try again later.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, product?.name]);

  // Scroll lock — centralized lock manager
  useEffect(() => {
    if (isOpen) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen]);

  const toggleAbstract = (pmid) => {
    setExpandedAbstracts(prev => ({ ...prev, [pmid]: !prev[pmid] }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 2. Dim background with medium opacity, click outside to close */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.3s ease-out'
        }} 
      />
      {/* Width 35%-40% Desktop */}
      <div 
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '40vw', minWidth: 'min(500px, 100vw)', backgroundColor: '#fafbfd', zIndex: 9999, boxShadow: '-10px 0 40px rgba(0,0,0,0.15)', overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Sticky Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ paddingRight: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <BookOpen size={24} /> Scientific Literature
            </h2>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Peer-reviewed publications related to <strong>{product?.name}</strong>
            </p>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close panel" 
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: 'white', border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,163,224,0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Improved Panel Header Summary */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,163,224,0.1)' }}>
            <p style={{ color: 'var(--text-main)', margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Peer-reviewed research associated with this compound. Data provided dynamically by the National Center for Biotechnology Information (NCBI).
            </p>
            {articles.length > 0 && !loading && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700, backgroundColor: 'rgba(0,163,224,0.05)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
                <Activity size={14} /> Showing {articles.length} recent publication{articles.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--primary)', gap: '1.5rem', animation: 'fadeIn 0.5s' }}>
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <Loader2 className="spinner" size={48} style={{ animation: 'spin 1.2s linear infinite' }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Querying PubMed Database...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', backgroundColor: 'var(--color-danger-bg)', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, lineHeight: 1.5 }}>{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <BookOpen size={56} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
              <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>No Results Found</h4>
              <p style={{ margin: 0, lineHeight: 1.5 }}>No literature previews available right now based on our primary compound match.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {articles.map((article, idx) => {
                const isExpanded = expandedAbstracts[article.pmid];
                const hasAbstract = article.abstract && article.abstract.trim().length > 0;
                return (
                  <div key={article.pmid || idx} style={{ 
                    padding: '1.25rem', 
                    border: '1px solid var(--border)', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    transition: 'all 0.2s ease',
                    scrollMarginTop: '100px'
                  }}>
                    {/* Top line: Journal & Year - Compact */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                        {article.journal}
                      </span>
                      {article.year && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {article.year}
                        </span>
                      )}
                    </div>
                    {/* Main Title - Compact */}
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', margin: '0 0 1rem 0', lineHeight: 1.4, fontWeight: 700 }}>
                      {article.title}
                    </h3>

                    {/* Conditional Abstract Content */}
                    {hasAbstract && isExpanded && (
                      <div style={{ 
                        marginBottom: '1.25rem', 
                        padding: '1rem', 
                        backgroundColor: 'var(--color-bg-app)', 
                        borderRadius: '8px', 
                        borderLeft: '3px solid var(--primary)',
                        animation: 'fadeIn 0.3s ease-out'
                      }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                          {article.abstract}
                        </p>
                      </div>
                    )}

                    {/* Action Row - No placeholder if no abstract */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                      {hasAbstract && (
                        <button 
                          onClick={() => toggleAbstract(article.pmid)}
                          style={{ flex: 1, minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: isExpanded ? 'rgba(0,163,224,0.1)' : 'white', color: isExpanded ? 'var(--primary)' : 'var(--text-main)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          {isExpanded ? <>Close Abstract <ChevronUp size={14} /></> : <>View Abstract <ChevronDown size={14} /></>}
                        </button>
                      )}
                      <a 
                        href={article.pubmedUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ 
                          flex: 1, 
                          minWidth: '130px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem', 
                          backgroundColor: hasAbstract ? 'transparent' : 'var(--primary)', 
                          color: hasAbstract ? 'var(--primary)' : 'white', 
                          border: hasAbstract ? '1px solid var(--primary)' : 'none', 
                          padding: '0.6rem', 
                          borderRadius: '8px', 
                          fontSize: '0.85rem', 
                          fontWeight: 700, 
                          textDecoration: 'none', 
                          transition: 'all 0.2s' 
                        }}
                        onMouseOver={(e) => { if (hasAbstract) e.currentTarget.style.backgroundColor = 'rgba(0,163,224,0.05)'; else e.currentTarget.style.opacity = '0.9'; }}
                        onMouseOut={(e) => { if (hasAbstract) e.currentTarget.style.backgroundColor = 'transparent'; else e.currentTarget.style.opacity = '1'; }}
                      >
                        {hasAbstract ? 'Full Article' : 'Open in PubMed'} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}