import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { getHormonePellets } from '../lib/firestoreHelpers';
import PelletCard from '../components/PelletCard';
import { useTranslation } from 'react-i18next';
import '../styles/pellets.css';

export default function PelletsPage() {
  const { t } = useTranslation();
  const [pellets, setPellets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('All');

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getHormonePellets();
        setPellets(data);
      } catch (e) {
        console.error('Failed to load hormone pellets', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Extract unique goals
  const uniqueGoals = useMemo(() => {
    const goalsSet = new Set();
    pellets.forEach(p => {
      if (Array.isArray(p.goals)) {
        p.goals.forEach(g => goalsSet.add(g));
      }
    });
    return ['All', ...Array.from(goalsSet)].slice(0, 8); // Limit to top goals for UI
  }, [pellets]);

  // Filter and search
  const filteredPellets = useMemo(() => {
    return pellets.filter(p => {
      // Goal filter
      if (selectedGoal !== 'All') {
        if (!p.goals || !p.goals.includes(selectedGoal)) return false;
      }
      // Search filter
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesObjective = p.objective?.toLowerCase().includes(q);
        const matchesKeywords = p.semanticKeywords?.some(k => k.toLowerCase().includes(q));
        if (!matchesName && !matchesObjective && !matchesKeywords) return false;
      }
      return true;
    });
  }, [pellets, debouncedSearch, selectedGoal]);

  return (
    <div className="pellets-page-wrapper">
      <Helmet>
        <title>{t('pelletsPage.metaTitle', 'Hormone Pellets Catalog | Atlas Health')}</title>
        <meta name="description" content={t('pelletsPage.metaDesc', 'Explore our premium range of hormone replacement pellets.')} />
      </Helmet>

      {/* Hero Banner */}
      <section className="pellets-hero">
        <div className="pellets-hero-inner">
          <div className="pellets-hero-content">
            <div className="pellets-hero-badge">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t('pelletsPage.badge', 'Clinical Grade')}
            </div>
            <h1 className="pellets-hero-title">{t('pelletsPage.title1', 'Hormone')} <span>{t('pelletsPage.title2', 'Pellets')}</span></h1>
            <p className="pellets-hero-subtitle">
              {t('pelletsPage.subtitle', 'Advanced hormone replacement therapy options designed for sustained release and optimal physiological balance.')}
            </p>
          </div>
          <div className="pellets-hero-visual">
            <div className="pellets-hero-icon-ring">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="pellets-toolbar">
        <div className="pellets-search-wrap">
          <svg className="pellets-search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="pellets-search-input"
            placeholder={t('pelletsPage.searchPlaceholder', 'Search by name, objective, or keyword...')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="pellets-filter-chips">
          {uniqueGoals.map(goal => (
            <button
              key={goal}
              className={`pellets-chip ${selectedGoal === goal ? 'active' : ''}`}
              onClick={() => setSelectedGoal(goal)}
            >
              {goal === 'All' ? t('pelletsPage.allGoals', 'All') : goal}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pellets-content">
        <div className="pellets-results-bar">
          <div className="pellets-results-count">
            {t('pelletsPage.showing', 'Showing')} <strong>{filteredPellets.length}</strong> {filteredPellets.length === 1 ? t('pelletsPage.result', 'result') : t('pelletsPage.results', 'results')}
          </div>
        </div>

        {loading ? (
          <div className="pellets-grid">
            {[1, 2, 3].map(i => <div key={i} className="pellets-skeleton-card" />)}
          </div>
        ) : filteredPellets.length > 0 ? (
          <div className="pellets-grid">
            {filteredPellets.map(p => (
              <PelletCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="pellets-empty">
            <svg className="pellets-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>{t('pelletsPage.noPelletsFound', 'No pellets found')}</h3>
            <p>{t('pelletsPage.adjustSearch', 'Try adjusting your search or filters.')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
