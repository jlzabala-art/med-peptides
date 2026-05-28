 
export default function StepByStepGuide() {
  const steps = [
    {
      image: '/images/step1-define-goal.png',
      imgPosition: '50% 25%',
      step: '01',
      title: 'Identify Goal Objectives',
      text: 'Define specific physiological markers and clinical endpoints for your research session.',
      accent: '#0EA5E9',
    },
    {
      image: '/images/step2-analyze-data.png',
      imgPosition: '50% 8%',
      step: '02',
      title: 'Analyze Research Pathways',
      text: 'Access detailed summaries of research peptides and protocols, including mechanism of action, targeted biological objectives, and structured research methodologies.',
      accent: '#6366F1',
    },
    {
      image: '/images/step3-procurement.png',
      imgPosition: '50% 20%',
      step: '03',
      title: 'Secure Procurement & Logistics',
      text: 'Execute secure acquisition of research compounds with streamlined global logistics and comprehensive documentation for research integrity.',
      accent: '#10B981',
    },
  ];

  return (
    <section className="sg-section">
      <div className="sg-container">
        <div className="sg-header">
          <span className="sg-eyebrow">Research Framework</span>
          <h2 className="sg-title">Protocol & Peptide Selection Process</h2>
          <p className="sg-subtitle">
            Structured methodologies to align research compounds with biological objectives.
          </p>
        </div>

        <div className="sg-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="sg-card" style={{ '--sg-accent': step.accent }}>
              {/* Image */}
              <div className="sg-image-wrap">
                <img
                  src={step.image}
                  alt={step.title}
                  className="sg-image"
                  loading="lazy"
                  style={{ objectPosition: step.imgPosition || '50% 20%' }}
                />
                <div className="sg-image-overlay" />
                <span className="sg-step-number">{step.step}</span>
              </div>

              {/* Content */}
              <div className="sg-card-body">
                <div className="sg-step-badge">Step {step.step}</div>
                <h3 className="sg-card-title">{step.title}</h3>
                <p className="sg-card-text">{step.text}</p>
              </div>

              {/* Bottom accent bar */}
              <div className="sg-accent-bar" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ── Section ─────────────────────────────────────────────── */
        .sg-section {
          padding: 5rem 1.25rem 6rem;
          background: var(--background, #f8fafc);
          position: relative;
          overflow: hidden;
        }

        /* subtle background pattern */
        .sg-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 30%, rgba(14,165,233,0.06) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(99,102,241,0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        /* ── Container ───────────────────────────────────────────── */
        .sg-container {
          max-width: 1140px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Header ──────────────────────────────────────────────── */
        .sg-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .sg-eyebrow {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--primary, #2563eb);
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.15);
          padding: 0.3rem 0.9rem;
          border-radius: 100px;
          margin-bottom: 1rem;
        }

        .sg-title {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 800;
          color: var(--text-main, #0f172a);
          margin: 0 0 0.75rem;
          line-height: 1.2;
        }

        .sg-subtitle {
          color: var(--text-muted, #64748b);
          font-size: 1.05rem;
          margin: 0;
          max-width: 480px;
          margin-inline: auto;
        }

        /* ── Cards Grid ──────────────────────────────────────────── */
        .sg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        /* ── Single Card ─────────────────────────────────────────── */
        .sg-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }

        .sg-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
        }

        /* ── Image area ──────────────────────────────────────────── */
        .sg-image-wrap {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .sg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }

        .sg-card:hover .sg-image {
          transform: scale(1.05);
        }

        .sg-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom,
            rgba(0,0,0,0.08) 0%,
            rgba(0,0,0,0.5) 100%);
        }

        .sg-step-number {
          position: absolute;
          top: 14px;
          right: 16px;
          font-size: 3.5rem;
          font-weight: 900;
          color: rgba(255,255,255,0.15);
          line-height: 1;
          letter-spacing: -2px;
          user-select: none;
        }

        /* ── Card body ───────────────────────────────────────────── */
        .sg-card-body {
          padding: 1.5rem 1.5rem 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sg-step-badge {
          display: inline-flex;
          align-items: center;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--sg-accent, var(--primary));
          background: color-mix(in srgb, var(--sg-accent, var(--primary)) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--sg-accent, var(--primary)) 20%, transparent);
          padding: 0.25rem 0.7rem;
          border-radius: 100px;
          width: fit-content;
        }

        .sg-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-main, #0f172a);
          margin: 0;
          line-height: 1.3;
        }

        .sg-card-text {
          font-size: 0.9rem;
          color: var(--text-muted, #64748b);
          line-height: 1.65;
          margin: 0;
          flex: 1;
        }

        /* ── Accent bottom bar ───────────────────────────────────── */
        .sg-accent-bar {
          height: 3px;
          background: var(--sg-accent, var(--primary));
          margin-top: auto;
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 900px) {
          .sg-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin-inline: auto;
            gap: 1.25rem;
          }

          .sg-image-wrap {
            height: 200px;
          }
          .sg-image { object-position: 50% 15%; }
        }

        @media (max-width: 480px) {
          .sg-section {
            padding: 3.5rem 1rem 4rem;
          }

          .sg-image-wrap {
            height: 175px;
          }
          .sg-image { object-position: 50% 12%; }
        }
      `}</style>
    </section>
  );
}
