 
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import homeData from '../data/homeData.json';
import { renderWithGradient } from '../utils/textUtils';

const StartHere = () => {
  const { badge, title, description, cta, ctaLink } = homeData.startHere;

  return (
    <section className="start-here section-padding bg-darker">
      <div className="container">
        <div className="glass-card p-xl border-glow relative overflow-hidden">
          <div className="flex items-center gap-xl flex-wrap relative z-10">
            <div className="flex-1 min-w-300">
              <div className="badge badge-primary mb-m">{badge}</div>
              <h2 className="h1 mb-m">{renderWithGradient(title)}</h2>
              <p className="p-l text-secondary mb-l max-w-600">
                {description}
              </p>
              <Link to={ctaLink} className="btn btn-primary">
                {cta} <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="flex-1 min-w-300">
              <div className="visual-abstract glass-card p-l bg-dark">
                <div className="peptide-chain-viz">
                  <div className="amino-acid anim-float-1"></div>
                  <div className="amino-acid anim-float-2"></div>
                  <div className="amino-acid anim-float-3"></div>
                  <div className="amino-acid anim-float-1"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative blur */}
          <div className="absolute -bottom-50 -right-50 w-300 h-300 bg-primary opacity-10 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default StartHere;
