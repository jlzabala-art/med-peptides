import React, { useState } from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';

export default function EvidencePanel({ evidence }) {
  const [expanded, setExpanded] = useState({});

  if (!evidence || Object.keys(evidence).length === 0) {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
        <h4 style={{ color: '#475569', marginBottom: '0.5rem' }}>Limited Direct Literature Found</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          No peer-reviewed publications were found in the literal cache for these specific compounds. Clinical reasoning is based on systemic synergy and anecdotal protocol density.
        </p>
      </div>
    );
  }

  const toggleExpand = (pmid) => {
    setExpanded(prev => ({ ...prev, [pmid]: !prev[pmid] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <BookOpen size={20} color="var(--primary)" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Scientific Literature Overview</h3>
      </div>

      {Object.entries(evidence).map(([compound, articles]) => (
        <div key={compound} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Evidence for {compound}
          </div>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {articles.map((article, idx) => {
              const pmid = article.pmid || `idx-${idx}`;
              const isExpanded = expanded[pmid];
              
              return (
                <div key={pmid} style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>{article.journal}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={10} /> {article.year}
                    </span>
                  </div>
                  
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                    {article.title}
                  </h4>

                  {article.summary && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <p style={{ 
                        fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0,
                        display: isExpanded ? 'block' : '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.summary}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => toggleExpand(pmid)}
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      {isExpanded ? <>Close Abstract <ChevronUp size={14}/></> : <>View Abstract <ChevronDown size={14}/></>}
                    </button>
                    <a 
                      href={article.pubmedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      PubMed <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ padding: '1rem', backgroundColor: 'rgba(0,163,224,0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        * Literature is fetched dynamically from NCBI Entrez. This interface facilitates research and is not a clinical recommendation.
      </div>
    </div>
  );
}
