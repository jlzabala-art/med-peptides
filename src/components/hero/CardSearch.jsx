import React, { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '../../hooks/useResponsive';
import '../../styles/hero_card.css';

export default function CardSearch({ onSearch }) {
  const { t } = useTranslation();
  const EXPLORE_CHIPS = [
    t('hero.chips.recovery', 'Recovery'),
    t('hero.chips.longevity', 'Longevity'),
    t('hero.chips.cognitive', 'Cognitive'),
    t('hero.chips.sleep', 'Sleep'),
    t('hero.chips.metabolic', 'Metabolic'),
    t('hero.chips.hormonal', 'Hormonal'),
    t('hero.chips.athletic', 'Athletic')
  ];
  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState(null);
  const isMobile = useResponsive('(max-width: 768px)');

  useEffect(() => {
    if (selectedChip) {
      setQuery(selectedChip);
      handleSubmit(selectedChip);
    }
  }, [selectedChip]);

  const handleSubmit = (val = query) => {
    if (!val?.trim()) return;
    if (onSearch) onSearch(val);
    setQuery('');
    setSelectedChip(null);
  };

  return (
    <div className="hero-card card-search">
      <div className="icon-box"><Search size={24} /></div>
      <h3 className="card-title">{t('hero.search.title', 'I know what I want')}</h3>
      <p className="card-desc">{t('hero.search.desc', 'Search goals, compounds and protocol pathways.')}</p>
      <input
        className="card-input"
        type="text"
        placeholder={t('hero.search.placeholder', 'What are you trying to improve?')}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <button className="card-cta" onClick={() => handleSubmit()}>
        {t('hero.search.btn', 'Find')} <ArrowRight size={16} />
      </button>
      <small className="card-helper">{t('hero.search.helper', 'Browse directly')}</small>
      <div className="chip-row" style={{ display: isMobile ? 'none' : 'flex' }}>
        {EXPLORE_CHIPS.map(chip => (
          <button
            key={chip}
            className="chip"
            onClick={() => setSelectedChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
