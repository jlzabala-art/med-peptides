 
import React from 'react';
import { Search, FlaskConical, Beaker } from 'lucide-react';
import homeData from '../data/homeData.json';
import { renderWithGradient } from '../utils/textUtils';

const IconMap = {
  Search: Search,
  FlaskConical: FlaskConical,
  Beaker: Beaker
};

const ChoosingGuide = () => {
  const { title, subtitle, steps } = homeData.choosingGuide;

  return (
    <section className="choosing-guide section-padding bg-dark" id="guide">
      <div className="container">
        <div className="text-center mb-xl">
          <h2 className="h2 mb-m">{renderWithGradient(title)}</h2>
          <p className="p-m text-secondary max-w-600 mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => {
            const IconComponent = IconMap[step.icon] || Search;
            return (
              <div key={index} className="step-card group">
                <div className="step-number text-gradient">0{index + 1}</div>
                <div className="step-content glass-card p-xl border-glow">
                  <div className="icon-box mb-m bg-primary-soft text-primary group-hover:scale-110 transition-all duration-300">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="h3 mb-s">{step.title}</h3>
                  <p className="p-m text-secondary">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-connector hidden-tablet"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ChoosingGuide;
