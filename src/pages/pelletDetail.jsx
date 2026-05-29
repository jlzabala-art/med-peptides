import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPelletById } from '../lib/firestoreHelpers';
import { useCart } from '../context/CartProvider';
import app from '../firebase';
import '../styles/pelletDetail.css';

export default function PelletDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCart } = useCart();
  const [pellet, setPellet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPelletById(id);
        setPellet(data);
        if (data) {
          const analytics = getAnalytics(app);
          logEvent(analytics, 'view_pellet', {
            item_id: data.id,
            item_name: data.name,
            item_category: 'Hormone Pellets'
          });
        }
      } catch (e) {
        console.error('Failed to load pellet', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!pellet) return;
    updateCart(pellet, 1);
    const analytics = getAnalytics(app);
    logEvent(analytics, 'add_to_cart', {
      currency: 'USD',
      value: pellet.price || 0,
      items: [{
        item_id: pellet.id,
        item_name: pellet.name,
        item_category: 'Hormone Pellets',
        price: pellet.price || 0,
        quantity: 1
      }]
    });
    // Optional: navigate to cart or open cart modal
    window.dispatchEvent(new CustomEvent('nav:openCart'));
  };

  if (loading) return <div className="pellet-detail-loading">Loading…</div>;
  if (!pellet) return <div className="pellet-not-found">Pellet not found.</div>;

  const displayGoals = Array.isArray(pellet.goals) ? pellet.goals : [];
  const displayMechanisms = Array.isArray(pellet.mechanisms) ? pellet.mechanisms : [];
  const displayKeywords = Array.isArray(pellet.semanticKeywords) ? pellet.semanticKeywords : [];
  const pharmacology = pellet.pharmacology || {};
  const clinicalBrief = pellet.aiContent?.clinicalBrief || '';

  return (
    <div className="pellet-detail-wrapper">
      <Helmet>
        <title>{pellet.name} – Premium Hormone Pellet</title>
        <meta name="description" content={pellet.objective || 'Hormone pellet product details'} />
        <meta property="og:title" content={`${pellet.name} – Hormone Pellet`} />
        <meta property="og:description" content={pellet.objective || 'Hormone pellet product details'} />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Top bar */}
      <div className="pellet-detail-topbar">
        <button className="pellet-back-btn" onClick={() => navigate('/collection/hormone-pellets')}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Catalog
        </button>
        <div className="pellet-breadcrumb">
          <a href="/">Home</a> / <a href="/collection/hormone-pellets">Hormone Pellets</a> / {pellet.name}
        </div>
      </div>

      {/* Hero section */}
      <section className="pellet-detail-hero">
        <div className="pellet-detail-hero-inner">
          <div>
            <div className="pellet-detail-hero-category">Hormone Pellet • {pellet.subcategory || 'General'}</div>
            <h1 className="pellet-detail-hero-title">{pellet.name}</h1>
            <p className="pellet-detail-hero-objective">{pellet.objective}</p>
            <div className="pellet-detail-meta-pills">
              {displayKeywords.map((kw, i) => (
                <span key={i} className="pellet-detail-meta-pill">{kw}</span>
              ))}
            </div>
          </div>
          <div className="pellet-detail-dosage-box">
            <div className="pellet-detail-dosage-label">Standard Dose</div>
            <div className="pellet-detail-dosage-value">{pellet.dosage || 'TBD'}</div>
            {pharmacology.halfLife && (
              <div className="pellet-detail-duration">Half-life: {pharmacology.halfLife}</div>
            )}
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="pellet-detail-body">
        {/* Content sections */}
        <div className="pellet-detail-sections">
          
          {pellet.description && (
            <div className="pellet-detail-section">
              <h2 className="pellet-detail-section-title">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Overview
              </h2>
              <p className="pellet-detail-text">{pellet.description}</p>
            </div>
          )}

          {clinicalBrief && (
            <div className="pellet-detail-section" style={{ background: 'var(--section-alt, #EEF4FA)' }}>
              <h2 className="pellet-detail-section-title">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Clinical Brief
              </h2>
              <p className="pellet-detail-text" style={{ fontWeight: 500, color: 'var(--primary, #003666)' }}>{clinicalBrief}</p>
            </div>
          )}

          {displayGoals.length > 0 && (
            <div className="pellet-detail-section">
              <h2 className="pellet-detail-section-title">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Primary Goals
              </h2>
              <div className="pellet-goals-grid">
                {displayGoals.map((g, i) => (
                  <div key={i} className="pellet-goal-item">
                    <div className="pellet-goal-dot" />
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayMechanisms.length > 0 && (
            <div className="pellet-detail-section">
              <h2 className="pellet-detail-section-title">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Mechanisms of Action
              </h2>
              <div className="pellet-mechanisms-list">
                {displayMechanisms.map((mech, i) => (
                  <div key={i} className="pellet-mechanism-item">
                    <div className="pellet-mechanism-num">{i + 1}</div>
                    <span>{mech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Sidebar */}
        <aside className="pellet-detail-sidebar">
          <div className="pellet-sidebar-card">
            <h3 className="pellet-sidebar-card-title">Pharmacology</h3>
            <table className="pellet-pharmacology-table">
              <tbody>
                {pharmacology.halfLife && (
                  <tr><td>Half-life</td><td>{pharmacology.halfLife}</td></tr>
                )}
                {pharmacology.molecularWeight && (
                  <tr><td>Mol. Weight</td><td>{pharmacology.molecularWeight}</td></tr>
                )}
                {pharmacology.route && (
                  <tr><td>Route</td><td>{pharmacology.route}</td></tr>
                )}
                {pellet.dosage && (
                  <tr><td>Dosage</td><td>{pellet.dosage}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pellet-sidebar-card">
            <h3 className="pellet-sidebar-card-title">Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button className="pellet-cta-btn" onClick={handleAddToCart}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Add to Cart
              </button>
              <button className="pellet-cta-btn pellet-cta-btn--outline" onClick={() => window.dispatchEvent(new CustomEvent('nav:openContact'))}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Ask a Question
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
