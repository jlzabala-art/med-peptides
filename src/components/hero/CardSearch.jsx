import React, { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';
import '../../styles/hero_card.css';

const EXPLORE_CHIPS = ['Recovery', 'Longevity', 'Cognitive', 'Sleep', 'Metabolic', 'Hormonal', 'Athletic'];

export default function CardSearch({ onSearch }) {
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
      <h3 className="card-title">I know what I want</h3>
      <p className="card-desc">Search goals, compounds and protocol pathways.</p>
      <input
        className="card-input"
        type="text"
        placeholder="What are you trying to improve?"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <button className="card-cta" onClick={() => handleSubmit()}>
        Find <ArrowRight size={16} />
      </button>
      <small className="card-helper">Browse directly</small>
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
