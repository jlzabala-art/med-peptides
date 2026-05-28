 
import React from 'react';

const SignalResponse = () => {
  return (
    <section className="signal-response section-padding bg-dark overflow-hidden">
      <div className="container">
        <div className="flex items-center gap-xl flex-wrap">
          <div className="flex-1 min-w-300">
            <h2 className="h2 mb-m">The <span className="text-gradient">Peptide Signal</span> Mechanism</h2>
            <p className="p-m text-secondary mb-l">
              Peptides act as highly specific ligands that bind to receptors on the cell surface, initiating a cascade of biological instructions known as signal transduction.
            </p>
            <ul className="list-styled mb-l">
              <li className="p-m mb-s">High receptor affinity for precise targeting</li>
              <li className="p-m mb-s">Rapid signaling onset for dynamic research</li>
              <li className="p-m">Predictable biochemical response pathways</li>
            </ul>
          </div>

          <div className="flex-1 min-w-300 relative">
            <div className="visualization-box glass-card p-xl border-glow">
              <div className="visual-signal-flow">
                <div className="signal-source">
                  <span className="p-s font-bold text-primary">Peptide Signal</span>
                  <div className="signal-particles"></div>
                </div>
                <div className="signal-line"></div>
                <div className="cellular-response">
                  <span className="p-s font-bold text-gradient">Cellular Response</span>
                  <div className="response-waves"></div>
                </div>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-200 h-200 bg-primary opacity-10 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignalResponse;
