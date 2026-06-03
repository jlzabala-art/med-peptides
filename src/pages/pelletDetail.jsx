import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getHormonePellets } from '../lib/firestoreHelpers';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/pellets.css';

export default function PelletDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pellet, setPellet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateCart, setCartMetadata, setActiveModal } = useCart();
  const { isProfessional } = useAuth();

  useEffect(() => {
    async function fetchPellet() {
      try {
        const data = await getHormonePellets();
        const match = data.find(p => p.id === slug || p.slug === slug);
        setPellet(match || null);
      } catch (e) {
        console.error('Failed to load pellet', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPellet();
  }, [slug]);

  const handleAddToCart = () => {
    if (!pellet) return;
    updateCart(pellet, 1);
    setCartMetadata(prev => ({
      ...prev,
      [pellet.name]: { ...(prev[pellet.name] || {}), productType: 'pellet' }
    }));
    window.dispatchEvent(new CustomEvent('nav:openCart'));
  };

  if (loading) return <div className="pellet-detail-loading">{t('pelletDetail.loading', 'Loading…')}</div>;
  if (!pellet) return <div className="pellet-not-found">{t('pelletDetail.notFound', 'Pellet not found.')}</div>;

  const { pharmacology = {}, formulations = [] } = pellet;
  const clinicalBrief = pellet.clinicalBrief || pellet.description; // fallback if brief missing
  const activeHalfLife = pharmacology.halfLife || 'Variable';

  return (
    <div className="pellet-detail-wrapper">
      <Helmet>
        <title>{pellet.name} | {t('pelletDetail.metaTitle', 'Atlas Health Pellets')}</title>
        <meta name="description" content={pellet.objective} />
      </Helmet>

      {/* Top Breadcrumb Bar */}
      <div className="pellet-detail-topbar">
        <button className="pellet-back-btn" onClick={() => navigate('/collection/hormone-pellets')}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('pelletDetail.back', 'Back to Pellets')}
        </button>
        <div className="pellet-breadcrumb">
          <span onClick={() => navigate('/')}>{t('pelletDetail.home', 'Home')}</span> / 
          <span onClick={() => navigate('/collection/hormone-pellets')}>{t('pelletDetail.pellets', 'Pellets')}</span> / 
          <span className="current">{pellet.name}</span>
        </div>
      </div>

      <section className="pellet-detail-hero">
        <div className="pellet-detail-hero-inner">
          <div className="pellet-detail-hero-content">
            <div className="pellet-detail-hero-category">{t('pelletDetail.hormonePellet', 'Hormone Pellet')} • {pellet.subcategory || t('pelletDetail.general', 'General')}</div>
            <h1 className="pellet-detail-hero-title">{pellet.name}</h1>
            <p className="pellet-detail-hero-objective">{pellet.objective}</p>
            <div className="pellet-detail-meta-pills">
              {pellet.semanticKeywords?.slice(0,3).map((kw, i) => (
                <span key={i} className="pellet-detail-meta-pill">{kw}</span>
              ))}
            </div>
          </div>
          <div className="pellet-detail-dosage-box">
            <div className="pellet-detail-dosage-label">{t('pelletDetail.standardDose', 'Standard Dose')}</div>
            <div className="pellet-detail-dosage-value">{pellet.dosage || t('pelletDetail.tbd', 'TBD')}</div>
            {pharmacology.halfLife && (
              <div className="pellet-detail-duration">{t('pelletDetail.halfLife', 'Half-life:')} {pharmacology.halfLife}</div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="pellet-detail-body">
        {/* Left Col: Details */}
        <div className="pellet-detail-sections">
          
          {pellet.description && (
            <div className="pellet-detail-section">
              <h2 className="pellet-detail-section-title">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('pelletDetail.overview', 'Overview')}
              </h2>
              <p className="pellet-detail-text">{pellet.description}</p>
            </div>
          )}

          {clinicalBrief && (
            <div className="pellet-detail-section" style={{ background: 'var(--section-alt, #EEF4FA)' }}>
              <h2 className="pellet-detail-section-title">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {t('pelletDetail.clinicalBrief', 'Clinical Brief')}
              </h2>
              <p className="pellet-detail-text" style={{ fontWeight: 500, color: 'var(--primary, #003666)' }}>{clinicalBrief}</p>
            </div>
          )}

          {pellet.goals && pellet.goals.length > 0 && (
            <div className="pellet-detail-section">
              <h2 className="pellet-detail-section-title">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {t('pelletDetail.therapeuticGoals', 'Therapeutic Goals')}
              </h2>
              <div className="pellet-goals-grid">
                {pellet.goals.map((g, i) => (
                  <div key={i} className="pellet-goal-item">
                    <div className="pellet-goal-dot" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pellet.mechanisms && pellet.mechanisms.length > 0 && (
            <div className="pellet-detail-section">
              <h2 className="pellet-detail-section-title">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                {t('pelletDetail.mechanismsOfAction', 'Mechanisms of Action')}
              </h2>
              <div className="pellet-mechanisms-list">
                {pellet.mechanisms.map((m, i) => (
                  <div key={i} className="pellet-mechanism-item">
                    <div className="pellet-mechanism-num">{i + 1}</div>
                    <div className="pellet-mechanism-text">{m}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Sidebar (Pharmacology + Buy) */}
        <aside className="pellet-detail-sidebar">
          <div className="pellet-sidebar-card">
            <h3 className="pellet-sidebar-card-title">{t('pelletDetail.pharmacology', 'Pharmacology')}</h3>
            <table className="pellet-pharmacology-table">
              <tbody>
                {pharmacology.halfLife && (
                  <tr><td>{t('pelletDetail.halfLife', 'Half-Life')}</td><td>{pharmacology.halfLife}</td></tr>
                )}
                {pharmacology.molecularWeight && (
                  <tr><td>{t('pelletDetail.molWeight', 'Mol. Weight')}</td><td>{pharmacology.molecularWeight}</td></tr>
                )}
                {pharmacology.bioavailability && (
                  <tr><td>{t('pelletDetail.bioavailability', 'Bioavailability')}</td><td>{pharmacology.bioavailability}</td></tr>
                )}
                {pellet.route && (
                  <tr><td>{t('pelletDetail.route', 'Route')}</td><td>{pellet.route}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pellet-sidebar-card">
            <h3 className="pellet-sidebar-card-title">{t('pelletDetail.actions', 'Actions')}</h3>
            {isProfessional ? (
              <button className="pellet-cta-btn" onClick={handleAddToCart}>
                {t('pelletDetail.addToCart', 'Add to Cart')}
              </button>
            ) : (
              <button className="pellet-cta-btn pellet-cta-btn--outline" onClick={() => window.dispatchEvent(new CustomEvent('nav:openContact'))}>
                {t('pelletDetail.contactProfessional', 'Contact Professional')}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
