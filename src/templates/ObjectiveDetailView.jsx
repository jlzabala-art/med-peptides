import React, { useState, useEffect, useMemo } from 'react';
import { Info, HelpCircle, BookOpen, ChevronRight, Beaker, Zap, Activity, FlaskConical } from 'lucide-react';
import MobileProductCard from '../snippets/MobileProductCard';
import FAQModal from '../components/discovery/FAQModal';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import { getFAQForProduct } from '../utils/discoveryEngine';

/**
 * ObjectiveDetailView — Redesigned scientific catalog for research goals.
 * Replaces commercial pricing/inquiry tables with scientific discovery tools.
 */
export default function ObjectiveDetailView({ 
  objectiveId, 
  onBack, 
  onSelectProduct, 
  isProfessional, 
  products,
  allFaqs
}) {
  const [activeFAQProduct, setActiveFAQProduct] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [activePubMedProduct, setActivePubMedProduct] = useState(null);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [objectiveId]);

  const handleOpenFAQ = async (product) => {
    setActiveFAQProduct(product);
    const faqs = getFAQForProduct(product.name, allFaqs || [], product.id, isProfessional);
    setFaqItems(faqs);
    setShowFAQModal(true);
  };

  const handleOpenPubMed = (product) => {
    setActivePubMedProduct(product);
    setShowPubMedPanel(true);
  };

  const groupedProducts = useMemo(() => {
    const groups = {};
    // Products associated with this scientific research goal
    const filtered = products.filter(p => p.objective && p.objective.includes(objectiveId));
    
    filtered.forEach(p => {
      const familyName = p.name;
      if (!groups[familyName]) {
        groups[familyName] = {
          ...p,
          allStrengths: []
        };
      }
      const strength = p.dosage || p.quantity || 'Standard';
      if (!groups[familyName].allStrengths.includes(strength)) {
        groups[familyName].allStrengths.push(strength);
      }
    });
    return Object.values(groups);
  }, [products, objectiveId]);

  if (!objectiveId) return null;

  const backgrounds = {
    'Healing & Repair': "Focuses on accelerating tissue regeneration, modulating the inflammatory cascade, and enhancing extracellular matrix remodeling for advanced wound healing studies.",
    'Metabolic Optimization': "Targets energy homeostasis, lipid metabolism, and insulin receptor sensitivity to study metabolic pathways and related models.",
    'Neuro-Cognitive': "Investigates neuroprotection, synaptic plasticity, and neurotrophic factors for modeling cognitive resilience and neurodegenerative diseases.",
    'Longevity & Vitality': "Explores cellular senescence, telomerase activity regulation, and mitochondrial efficiency in anti-aging research models.",
    'Somatic Research': "Examines muscle hypertrophy, satellite cell activation, and myostatin inhibition to understand somatic tissue development and preservation.",
    'Hormonal Pathways': "Involves the study of neuroendocrine regulation, HPTA axis signaling, and secretagogue physiological effects."
  };
  const researchBackground = backgrounds[objectiveId] || "Investigate specific biological mechanisms and signaling pathways using our high-purity research compounds.";

  return (
    <div className="template-root" style={{ padding: 'clamp(2rem, 8vw, 6rem) 1.5rem 4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>

      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-main)', marginBottom: '1rem' }}>
          {objectiveId}
        </h1>
        <p style={{ maxWidth: '750px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Peer-reviewed research catalog curated for <strong>{objectiveId.toLowerCase()}</strong> studies. High-purity peptides analyzed for consistent experimental outcomes.
        </p>
        
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(0,163,224,0.05)', borderRadius: '16px', textAlign: 'left', maxWidth: '800px', margin: '2rem auto 0', border: '1px solid rgba(0,163,224,0.1)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Research Focus</h4>
          <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
             {researchBackground}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)', borderRadius: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          {/* Desktop View */}
          <table className="desktop-only" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead style={{ backgroundColor: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Research Peptide</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '35%' }}>Description</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scientific Tools</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((product, idx) => (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: idx % 2 === 0 ? 'white' : 'var(--background)'
                }}>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={product.image || '/peptide-placeholder.png'} 
                        alt={product.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }}
                        onError={(e) => { e.target.src = '/peptide-placeholder.png'; }}
                      />
                      <div>
                        <div onClick={() => onSelectProduct(product.name)} style={{ fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', fontSize: '1.1rem' }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>CAS: {product.cas || 'Not Listed'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {product.desc}
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {product.allStrengths.map((s, sIdx) => (
                        <span key={sIdx} style={{ padding: '0.25rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                      <button 
                        onClick={() => handleOpenFAQ(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', fontSize: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <HelpCircle size={14} /> FAQ
                      </button>
                      <button 
                        onClick={() => handleOpenPubMed(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', fontSize: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <BookOpen size={14} /> PubMed
                      </button>
                      <button 
                        onClick={() => onSelectProduct(product.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '0.8rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                      >
                        View Profile <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-only" style={{ padding: '1.25rem' }}>
          {groupedProducts.map((product, idx) => (
            <MobileProductCard 
              key={idx}
              product={product}
              onSelectProduct={onSelectProduct}
              isProfessional={isProfessional}
              products={products}
              allFaqs={allFaqs}
            />
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '4rem', 
        padding: '2.5rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: '24px', 
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FlaskConical size={32} />
        </div>
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 800 }}>Clinical Integrity Statement</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            Med-Peptides implements standard laboratory controls for ISO-certified research reagents. Compounds listed under <strong>{objectiveId}</strong> are intended for controlled laboratory study and in-vitro applications only. Full Certificates of Analysis (CoA) are available for all scientific protocols.
          </p>
        </div>
      </div>

      <FAQModal 
          isOpen={showFAQModal}
          onClose={() => setShowFAQModal(false)}
          faqItems={faqItems}
          product={activeFAQProduct}
          relatedProducts={products}
          onProductClick={(p) => {
            setShowFAQModal(false);
            setTimeout(() => onSelectProduct(p.name), 50); // Small timeout to let scroll unlock run
          }}
      />

      <PubMedPreviewPanel 
        isOpen={showPubMedPanel}
        onClose={() => setShowPubMedPanel(false)}
        product={activePubMedProduct}
      />
    </div>
  );
}
