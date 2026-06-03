 
import React, { useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * PeptideEducationPage
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive scientific guide about peptides.
 */
export default function PeptideEducationPage() {
  const structuredData = useMemo(() => {
    const pageUrl = 'https://Atlas Health.com/what-are-peptides';
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "MedicalWebPage",
          "@id": `${pageUrl}#webpage`,
          "url": pageUrl,
          "name": "What Are Peptides? | Scientific Primer | Atlas Health",
          "description": "A comprehensive guide to research peptides, cellular signaling, and amino acid sequences for scientific professionals.",
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://Atlas Health.com#website",
            "name": "Atlas Health",
            "url": "https://Atlas Health.com"
          },
          "about": [
            {
              "@type": "MedicalBiologicalStructure",
              "name": "Peptide",
              "description": "Short-chain polymers of amino acid monomers linked by peptide (amide) bonds."
            },
            {
              "@type": "MedicalBiologicalStructure",
              "name": "G-protein coupled receptors (GPCRs)"
            }
          ]
        },
        {
          "@type": "TechArticle",
          "@id": `${pageUrl}#article`,
          "isPartOf": {
            "@id": `${pageUrl}#webpage`
          },
          "headline": "Understanding Peptides: A Scientific Primer",
          "description": "Learn the biological mechanisms, signaling pathways, and clinical applications of research peptides.",
          "inLanguage": "en-US",
          "mainEntityOfPage": pageUrl,
          "publisher": {
            "@type": "Organization",
            "name": "Atlas Health",
            "logo": {
              "@type": "ImageObject",
              "url": "https://Atlas Health.com/atlas-health-logo.png"
            }
          },
          "author": {
            "@type": "Organization",
            "name": "Atlas Health"
          },
          "articleSection": [
            "Molecular Architecture",
            "Why Research Peptides?",
            "Key Research Categories"
          ],
          "about": [
            {
              "@type": "Drug",
              "name": "GLP-1 analogues"
            },
            {
              "@type": "Drug",
              "name": "BPC-157"
            },
            {
              "@type": "Drug",
              "name": "TB-500"
            },
            {
              "@type": "Drug",
              "name": "Semax"
            }
          ]
        }
      ]
    };
  }, []);

  usePageMeta({
    title: 'What Are Peptides? | Scientific Primer | Atlas Health',
    description: 'A comprehensive guide to research peptides, cellular signaling, and amino acid sequences for scientific professionals.',
    path: '/what-are-peptides',
    structuredData
  });

  return (
    <div className="page-fade-in" style={{ background: 'var(--background)', color: 'var(--text-main)' }}>
      {/* Hero Header */}
      <header className="section-padding" style={{ 
        background: 'radial-gradient(circle at top right, var(--primary-soft) 0%, var(--background) 50%)',
        paddingTop: '8rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div className="max-w-700">
            <span className="badge badge-primary mb-m">RESEARCH CORE</span>
            <h1 className="h1 mb-l" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
              The Science of <span className="text-gradient">Peptides</span>
            </h1>
            <p className="text-muted" style={{ fontSize: '1.25rem', lineHeight: '1.8' }}>
              Bridging the gap between molecular biochemistry and clinical physiology. 
              Discover why peptides are the preferred modality for modern research.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '4rem' }} className="responsive-edu-grid">
            
            {/* Article Content */}
            <article style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
              <section className="mb-xl">
                <h2 className="h3 mb-m" style={{ color: 'var(--primary)' }}>1. Molecular Architecture</h2>
                <p>
                  Peptides are short-chain polymers of amino acid monomers linked by peptide (amide) bonds. 
                  Unlike full-sized proteins, which typically contain more than 50 amino acids and possess complex 
                  tertiary structures, peptides are smaller, often ranging from 2 to 50 amino acids.
                </p>
                <div style={{ 
                  background: 'var(--surface)', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)',
                  margin: '2rem 0'
                }}>
                  <h4 className="mb-s">The Signal Mechanism</h4>
                  <p className="text-muted" style={{ fontSize: '0.9375rem', marginBottom: 0 }}>
                    In biological systems, peptides serve as primary signaling molecules (hormones, neurotransmitters). 
                    They bind to specific G-protein coupled receptors (GPCRs) or receptor tyrosine kinases, initiating 
                    intracellular cascades that regulate metabolism, tissue repair, and immune response.
                  </p>
                </div>
              </section>

              <section className="mb-xl">
                <h2 className="h3 mb-m" style={{ color: 'var(--primary)' }}>2. Why Research Peptides?</h2>
                <p>
                  For the clinical researcher, peptides offer a unique combination of high potency, high selectivity, 
                  and low toxicity. Because they are based on naturally occurring amino acids, their metabolic 
                  byproducts are generally benign.
                </p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                  <li className="mb-s"><strong>Specificity:</strong> Minimal off-target effects compared to small molecule drugs.</li>
                  <li className="mb-s"><strong>Scalability:</strong> Advances in Solid-Phase Peptide Synthesis (SPPS) allow for high-purity production.</li>
                  <li className="mb-s"><strong>Diversity:</strong> Millions of possible sequences allow for targeted research into almost any physiological pathway.</li>
                </ul>
              </section>

              <section className="mb-xl">
                <h2 className="h3 mb-m" style={{ color: 'var(--primary)' }}>3. Key Research Categories</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }} className="category-edu-grid">
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h5 className="mb-s">Metabolic Signaling</h5>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Researching GLP-1 and GIP analogs for glycemic control and lipolysis.</p>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h5 className="mb-s">Tissue Repair</h5>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Investigating BPC-157 and TB-500 for angiogenesis and musculoskeletal healing.</p>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h5 className="mb-s">Cognitive Function</h5>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Exploring neuroprotective peptides like Selank and Semax.</p>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h5 className="mb-s">Immunomodulation</h5>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Studying Thymosin Alpha-1 and LL-37 for immune system optimization.</p>
                  </div>
                </div>
              </section>
            </article>

            {/* Sidebar / CTA */}
            <aside>
              <div style={{ 
                position: 'sticky', 
                top: '100px', 
                background: 'rgba(var(--primary-rgb), 0.05)', 
                padding: '2rem', 
                borderRadius: '16px',
                border: '1px solid var(--primary-soft)'
              }}>
                <h4 className="mb-m">Ready to Begin?</h4>
                <p className="text-muted mb-l" style={{ fontSize: '0.875rem' }}>
                  Explore our verified catalog of high-purity research peptides. 
                  Every batch is HPLC/Mass-Spec tested for analytical precision.
                </p>
                <button className="btn btn-primary w-full" style={{ marginBottom: '1rem' }}>
                  Browse Catalog
                </button>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', opacity: 0.6, margin: 0 }}>
                  FOR RESEARCH PURPOSES ONLY. NOT FOR HUMAN CONSUMPTION.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </main>

      {/* Summary Footer */}
      <section className="section-padding" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container text-center">
          <div className="max-w-700 mx-auto">
            <h2 className="h2 mb-m">Deepen Your Protocol Knowledge</h2>
            <p className="text-muted mb-l">
              Join our professional community for access to peer-reviewed 
              research protocols and analytical data.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline">Professional Registration</button>
              <button className="btn btn-primary">Join Newsletter</button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .responsive-edu-grid {
          display: grid;
        }
        @media (max-width: 992px) {
          .responsive-edu-grid {
            grid-template-columns: 1fr !important;
          }
          .category-edu-grid {
            grid-template-columns: 1fr !important;
          }
          aside {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
