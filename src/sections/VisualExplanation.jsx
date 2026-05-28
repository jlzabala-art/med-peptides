 
import { ArrowRight, Cpu, Zap, Activity } from 'lucide-react';

export default function VisualExplanation() {
  const steps = [
    {
      icon: <Cpu size={32} />,
      title: 'Peptide',
      subtitle: 'The Instruction',
      description: 'Highly specific chains of amino acids that act as biological keys.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Signal',
      subtitle: 'The Message',
      description: 'The peptide binds to specific receptors, triggering a cascade of biological data.'
    },
    {
      icon: <Activity size={32} />,
      title: 'Response',
      subtitle: 'The Result',
      description: 'Targeted biological outcomes: tissue repair, metabolic shifts, or immune modulation.'
    }
  ];

  return (
    <section className="visual-explanation">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How Peptides Work</h2>
          <p className="section-subtitle">The Biological Instruction Model</p>
        </div>

        <div className="flow-container">
          {steps.map((step, idx) => (
            <div key={idx} className="flow-step-wrapper">
              <div className="flow-step">
                <div className="step-icon-box">
                  {step.icon}
                  <div className="step-number">{idx + 1}</div>
                </div>
                <h3>{step.title}</h3>
                <span className="step-subtitle">{step.subtitle}</span>
                <p>{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="flow-arrow">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .visual-explanation {
          padding: 6rem 1.5rem;
          background: var(--background);
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .section-subtitle {
          color: var(--primary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.875rem;
        }
        .flow-container {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 2rem;
        }
        .flow-step-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .flow-step {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          width: 100%;
        }
        .flow-step:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: 0 12px 30px rgba(var(--primary-rgb, 45, 108, 223), 0.1);
        }
        .step-icon-box {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary), #6366f1);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          position: relative;
          box-shadow: 0 8px 15px rgba(var(--primary-rgb, 45, 108, 223), 0.3);
        }
        .step-number {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 28px;
          height: 28px;
          background: var(--text-main);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--surface);
        }
        .flow-step h3 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
          color: var(--text-main);
        }
        .step-subtitle {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .flow-step p {
          font-size: 0.9375rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .flow-arrow {
          color: var(--border);
          display: flex;
          align-items: center;
        }
        @media (max-width: 992px) {
          .flow-container {
            flex-direction: column;
            align-items: center;
          }
          .flow-step-wrapper {
            width: 100%;
            flex-direction: column;
            gap: 1.5rem;
          }
          .flow-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </section>
  );
}
