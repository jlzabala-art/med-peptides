import Search from "lucide-react/dist/esm/icons/search";
import Info from "lucide-react/dist/esm/icons/info";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React, { useState } from 'react';






const ResearchSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const suggestedGoals = [
    { label: "Tissue Regeneration", icon: <Sparkles size={16} /> },
    { label: "Metabolic Research", icon: <TrendingUp size={16} /> },
    { label: "Immune Pathways", icon: <ShieldAlert size={16} /> },
    { label: "Neurological Stability", icon: <Info size={16} /> }
  ];

  return (
    <section className="research-search section-padding">
      <div className="container">
        <div className="search-box glass-card p-xl reveal">
          <div className="text-center mb-xl">
            <h2 className="h2 mb-m">What is your <span className="text-gradient">Research Focus?</span></h2>
            <p className="p-m text-secondary">Search our catalog by scientific application or molecule name.</p>
          </div>

          <div className="search-input-wrapper relative max-w-700 mx-auto mb-l">
            <input 
              type="text" 
              className="search-input w-full p-m pl-xl border-radius-s bg-darker border text-white"
              placeholder="Ex: 'Tissue repair', 'BPC-157', 'Cognitive function'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-m top-50 translate-y-n50 text-secondary" size={24} />
            <button className="btn btn-primary absolute right-s top-50 translate-y-n50">Search Catalog</button>
          </div>

          <div className="flex justify-center gap-m flex-wrap">
            <span className="p-s text-secondary">Quick Categories:</span>
            {suggestedGoals.map((goal, index) => (
              <button 
                key={index} 
                className="goal-chip flex items-center gap-s p-s px-m border border-radius-full hover-glow transition-all text-secondary hover-text-primary"
                onClick={() => setSearchQuery(goal.label)}
              >
                {goal.icon}
                <span>{goal.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchSearch;