 
import React, { useEffect, useRef } from 'react';
import { Target, Zap, Activity, Brain, Moon, Sparkles, ShieldCheck } from 'lucide-react';
import '../styles/pathway_navigation.css';

const PATHWAYS = [
  { id: 'Recovery & Repair',      name: 'Recovery',  icon: <Activity    size={20} />, count: 'Clinical repair' },
  { id: 'Cognitive & Mood',       name: 'Cognitive', icon: <Brain       size={20} />, count: 'Brain health'    },
  { id: 'Sleep & Circadian',      name: 'Sleep',     icon: <Moon        size={20} />, count: 'Circadian'       },
  { id: 'Metabolic & Weight',     name: 'Metabolic', icon: <Zap         size={20} />, count: 'Fat loss'        },
  { id: 'Longevity & Anti-Aging', name: 'Longevity', icon: <Sparkles    size={20} />, count: 'Aging'           },
  { id: 'Hormonal Optimization',  name: 'Hormonal',  icon: <Target      size={20} />, count: 'GH Axis'         },
  { id: 'Immune Support',         name: 'Immune',    icon: <ShieldCheck size={20} />, count: 'Immunity'        },
];

export default function PathwayNavigation({ onSelectCategory }) {
  const gridRef = useRef(null);

  // Staggered entrance animation — mirrors peptide-card pattern
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.pathway-card');
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const delay = Number(card.dataset.index) * 60;
            setTimeout(() => card.classList.add('pathway-card--visible'), delay);
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pathway-section">
      <div className="container" style={{ padding: '0 1rem' }}>

        <div className="pathway-header">
          <span className="pathway-header__label">Research Pathways</span>
          <h2 className="pathway-header__title">Select Biological Mechanism</h2>
          <p className="pathway-header__subtitle">
            Explore curated peptide protocols by clinical target
          </p>
        </div>

        <div className="pathway-grid" ref={gridRef}>
          {PATHWAYS.map((pathway, idx) => (
            <div
              key={pathway.id}
              className="pathway-card"
              data-index={idx}
              onClick={() => onSelectCategory(pathway.id)}
            >
              <div className="pathway-icon-wrapper">
                {pathway.icon}
              </div>

              <div className="pathway-card__body">
                <h3 className="pathway-card__name">{pathway.name}</h3>
                <span className="pathway-count">{pathway.count}</span>
                <p className="pathway-desc">Biological mechanism research.</p>
              </div>

              <button
                className="btn-build"
                onClick={(e) => { e.stopPropagation(); onSelectCategory(pathway.id); }}
              >
                Explore
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}