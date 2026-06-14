import X from "lucide-react/dist/esm/icons/x";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Book from "lucide-react/dist/esm/icons/book";
import Shield from "lucide-react/dist/esm/icons/shield";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import FileText from "lucide-react/dist/esm/icons/file-text";
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';







export default function ResearchDetailDrawer({ 
  isOpen, 
  onClose, 
  data = null 
}) {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 10002
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'absolute',
              top: 0, right: 0, bottom: 0,
              width: '400px',
              maxWidth: '90%',
              backgroundColor: 'white',
              zIndex: 10003,
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Book size={20} />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Research Deep-Dive</h3>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Compound Summary */}
                <section>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Compound Overview</div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>{data.title || "Research Molecule"}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginTop: '0.5rem' }}>
                    {data.description || "Detailed analysis of the specified compound mechanism and research maturity."}
                  </p>
                </section>

                {/* Key Findings */}
                <section style={{ backgroundColor: 'var(--color-bg-app)', padding: '1rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Beaker size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Key Research Findings</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(data.findings || ["N/A"]).map((f, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{f}</li>
                    ))}
                  </ul>
                </section>

                {/* Safety & Evidence */}
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Shield size={16} color="var(--color-success)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Evidence & Safety Maturity</span>
                  </div>
                  <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Clinical Stage:</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{data.stage || "Phase II/III"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Evidence Score:</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-success)' }}>{data.score || "High"}</span>
                    </div>
                  </div>
                </section>

                {/* PubMed / DOI Links */}
                <section>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Scientific Sources</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(data.sources || []).map((s, i) => (
                      <a 
                        key={i} 
                        href={s.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                          textDecoration: 'none', color: 'var(--color-text-secondary)', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <FileText size={16} color="var(--primary)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{s.title}</div>
                          <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{s.journal || "PubMed Central"}</div>
                        </div>
                        <ExternalLink size={14} color="var(--color-text-tertiary)" />
                      </a>
                    ))}
                  </div>
                </section>

              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: 'var(--color-bg-app)' }}>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--color-text-tertiary)', textAlign: 'center', lineHeight: 1.4 }}>
                This data is aggregated from peer-reviewed scientific journals for research purposes only.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}