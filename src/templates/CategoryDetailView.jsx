import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Info, FlaskConical, Beaker, Zap, Activity, HelpCircle, BookOpen, ChevronRight } from 'lucide-react';
import MobileProductCard from '../snippets/MobileProductCard';
import FAQModal from '../components/discovery/FAQModal';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import { getFAQForProduct } from '../utils/discoveryEngine';

export default function CategoryDetailView({ 
  category, 
  onBack, 
  onSelectProduct, 
  isProfessional,
  products,
  allFaqs,
  allMappings
}) {
  const [activeFAQProduct, setActiveFAQProduct] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [activePubMedProduct, setActivePubMedProduct] = useState(null);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  const handleOpenFAQ = async (product) => {
    setActiveFAQProduct(product);
    const faqs = getFAQForProduct(product.name, allFaqs || [], allMappings || [], isProfessional);
    setFaqItems(faqs);
    setShowFAQModal(true);
  };

  const handleOpenPubMed = (product) => {
    setActivePubMedProduct(product);
    setShowPubMedPanel(true);
  };

  const groupedProducts = useMemo(() => {
    const groups = {};
    products.filter(p => p.category === category).forEach(p => {
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
  }, [products, category]);

  const getCategoryIcon = () => {
    if (category?.includes('Injectable')) return <Zap size={40} />;
    if (category?.includes('Growth')) return <Activity size={40} />;
    return <Beaker size={40} />;
  };

  const categoryBackgrounds = {
    'Injectable Peptides': "Lyophilized powder designed for precise in-vitro research workflows. Ideal for assays requiring exact molar concentrations and direct cellular interaction.",
    'Topical Peptides': "Formulated in transdermal research bases to investigate skin barrier penetration, local tissue effects, and dermatological signaling.",
    'Oral Peptides': "Engineered for enhanced stability in simulated gastric environments, modeling systemic absorption and mucosal permeability.",
    'Research Supplies': "Essential laboratory consumables and high-purity solvents required for the proper handling, reconstitution, and administration of research materials."
  };
  const bgDesc = categoryBackgrounds[category] || "High-purity peptide compounds categorized by their primary vehicle of administration for specialized laboratory protocols.";

  if (!category) return null;

  return (
    <div className="template-root" style={{ padding: '1.5rem 1.5rem 4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>

      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '80px', 
          height: '80px', 
          backgroundColor: 'rgba(0, 75, 135, 0.05)', 
          borderRadius: '20px', 
          color: 'var(--primary)',
          marginBottom: '1.5rem'
        }}>
          {getCategoryIcon()}
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-main)', marginBottom: '1rem' }}>
          {category}
        </h1>
        <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Premium research peptides curated for high-performance laboratory environments. Verified purity and consistent analytical results.
        </p>

        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'rgba(0,163,224,0.05)', borderRadius: '12px', textAlign: 'left', maxWidth: '800px', margin: '1.5rem auto 0', border: '1px solid rgba(0,163,224,0.1)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Format Overview</h4>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
             {bgDesc}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ overflowX: 'auto' }}>
          {/* Desktop View */}
          <table className="responsive-table desktop-only" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead style={{ backgroundColor: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Research Peptide</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', width: '30%' }}>Description</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Investigational Strengths</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Scientific Tools</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((product, idx) => (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: idx % 2 === 0 ? 'white' : 'var(--background)'
                }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div onClick={() => onSelectProduct(product.name)} style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', fontSize: '1.05rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>CAS: {product.cas || 'Not Listed'}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {product.desc}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {product.allStrengths.map((s, sIdx) => (
                        <span key={sIdx} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleOpenFAQ(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <HelpCircle size={14} /> FAQ
                      </button>
                      <button 
                        onClick={() => handleOpenPubMed(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <BookOpen size={14} /> PubMed
                      </button>
                      <button 
                        onClick={() => onSelectProduct(product.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
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
        <div className="mobile-only" style={{ 
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {groupedProducts.map((product, idx) => (
            <MobileProductCard 
              key={idx}
              product={product}
              onSelectProduct={onSelectProduct}
              isProfessional={isProfessional}
              products={products}
              allFaqs={allFaqs}
              allMappings={allMappings}
            />
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '4rem', 
        padding: '2rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          padding: '0.75rem', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FlaskConical size={24} />
        </div>
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Scientific Compliance</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Med</span>-Peptides adheres to rigid ISO standards and GMP-like quality control. All research reagents listed are strictly for in-vitro research and laboratory experimentation. Final certification is provided with every shipment.
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
            setTimeout(() => onSelectProduct(p.name), 50);
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
