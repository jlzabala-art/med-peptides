 
import { ShieldCheck, Target, Layers, FileText, Award, Microscope } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';

const features = [
  {
    icon: <Target size={22} />,
    title: 'HPLC Purity',
    desc: 'High-Performance Liquid Chromatography ensuring up to 99% peptide purity across every batch.',
    image: '/assets/quality/hplc.png',
    stat: '≥ 99%',
    statLabel: 'Purity',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Mass Spectrometry',
    desc: 'Rigorous molecular weight verification confirming sequence accuracy before release.',
    image: '/assets/quality/mass-spec.png',
    stat: '100%',
    statLabel: 'Verified',
  },
  {
    icon: <Layers size={22} />,
    title: 'Synthesis Mastery',
    desc: 'Advanced solid-phase peptide synthesis with continuous process optimisation.',
    image: '/assets/quality/synthesis.png',
    stat: 'SPPS',
    statLabel: 'Method',
  },
  {
    icon: <FileText size={22} />,
    title: 'Full Traceability',
    desc: 'Every batch backed by complete documentation and a Certificate of Analysis.',
    image: '/assets/quality/traceability.png',
    stat: 'CoA',
    statLabel: 'Included',
  },
];

const TRUST_STATS = [
  { icon: <Award size={20} />,      value: 'ISO 9001',  label: 'Certified'            },
  { icon: <ShieldCheck size={20} />, value: '≥ 99%',    label: 'Purity guarantee'     },
  { icon: <Microscope size={20} />,  value: 'HPLC / MS', label: 'Dual verification'   },
  { icon: <FileText size={20} />,    value: 'CoA',       label: 'Every batch'          },
];

export default function Quality() {
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://Med-Peptides-app-27a3a.web.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Quality Standards",
            "item": "https://Med-Peptides-app-27a3a.web.app/quality"
          }
        ]
      },
      {
        "@type": "WebPage",
        "name": "Peptide Quality & Analytical Standards",
        "description": "Med-Peptides's rigorous quality control process, featuring HPLC and Mass Spectrometry verification for research-grade peptides.",
        "mainEntity": {
          "@type": "Service",
          "name": "Peptide Quality Verification",
          "description": "Comprehensive analytical testing including HPLC purity checks and Mass Spectrometry sequence verification."
        }
      }
    ]
  }), []);

  usePageMeta({
    title: 'Quality & Analytical Standards | HPLC & MS Verified Peptides',
    description: 'Every Med-Peptides batch is verified by HPLC and Mass Spectrometry. Discover our rigorous quality control process and compliance certifications.',
    canonicalUrl: 'https://Med-Peptides-app-27a3a.web.app/quality',
    structuredData
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="qp-root">
      <style>{`
        /* ── Root ── */
        .qp-root {
          min-height: 100vh;
          background: var(--surface);
          padding-top: clamp(5rem, 12vw, 8rem);
          padding-bottom: 5rem;
        }

        /* ── Hero ── */
        .qp-hero {
          text-align: center;
          max-width: 720px;
          margin: 0 auto;
          padding: 0 1.25rem 3.5rem;
        }
        .qp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0,90,156,0.07);
          color: var(--primary);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.35rem 0.9rem;
          border-radius: 100px;
          border: 1px solid rgba(0,90,156,0.15);
          margin-bottom: 1.25rem;
        }
        .qp-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(1.9rem, 5.5vw, 3.5rem);
          font-weight: 850;
          letter-spacing: -0.04em;
          color: var(--primary);
          line-height: 1.1;
          margin-bottom: 1.25rem;
        }
        .qp-hero p {
          font-size: clamp(0.95rem, 2.5vw, 1.15rem);
          color: var(--text-muted);
          line-height: 1.7;
        }
        .qp-hero p span {
          color: var(--secondary);
          font-weight: 700;
        }

        /* ── Trust stat bar ── */
        .qp-stat-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          margin: 0 1.25rem 3.5rem;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          background: #fff;
          box-shadow: var(--shadow-sm);
        }
        .qp-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          padding: 1.25rem 0.5rem;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .qp-stat-item:last-child { border-right: none; }
        .qp-stat-item svg { color: var(--primary); margin-bottom: 0.35rem; }
        .qp-stat-value {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }
        .qp-stat-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── Feature grid ── */
        .qp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 0 1.25rem;
          max-width: 960px;
          margin: 0 auto 3.5rem;
        }
        .qp-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          box-shadow: var(--shadow-sm);
        }
        .qp-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
          border-color: rgba(0,90,156,0.2);
        }

        /* Image area */
        .qp-card-img {
          width: 100%;
          aspect-ratio: 16/9;
          background-size: cover;
          background-position: center;
          background-color: var(--background);
          position: relative;
        }
        /* Stat badge inside image */
        .qp-card-stat {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          background: var(--primary);
          color: #fff;
          border-radius: 10px;
          padding: 0.3rem 0.65rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1.2;
        }
        .qp-card-stat-val {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .qp-card-stat-lbl {
          font-size: 0.55rem;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.8;
          letter-spacing: 0.04em;
        }

        /* Card body */
        .qp-card-body {
          padding: 1.25rem 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          flex: 1;
        }
        .qp-card-icon-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .qp-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: rgba(0,90,156,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }
        .qp-card-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
        .qp-card-desc {
          font-size: 0.83rem;
          color: var(--text-muted);
          line-height: 1.65;
        }

        /* ── Transparency block ── */
        .qp-transparency {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        .qp-transparency-inner {
          background: linear-gradient(145deg, #f0f7ff 0%, #ffffff 100%);
          border: 1px solid rgba(0,163,224,0.18);
          border-top: 4px solid var(--primary);
          border-radius: 20px;
          padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 5vw, 3.5rem);
          text-align: center;
        }
        .qp-coa-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--success);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 1rem;
        }
        .qp-transparency-inner h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          font-weight: 850;
          letter-spacing: -0.03em;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }
        .qp-transparency-inner p {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: var(--text-muted);
          line-height: 1.75;
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        .qp-pills {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .qp-pill {
          padding: 0.6rem 1.1rem;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-main);
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          transition: border-color 0.2s, color 0.2s;
          cursor: default;
        }
        .qp-pill:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .qp-stat-bar {
            grid-template-columns: repeat(2, 1fr);
            margin-left: 1.25rem;
            margin-right: 1.25rem;
          }
          .qp-stat-item:nth-child(2) { border-right: none; }
          .qp-stat-item:nth-child(3),
          .qp-stat-item:nth-child(4) {
            border-top: 1px solid var(--border);
          }
          .qp-stat-item:nth-child(4) { border-right: none; }

          .qp-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .qp-card-img { aspect-ratio: 16/8; }
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────── */}
      <div className="qp-hero">
        <div className="qp-badge">
          <ShieldCheck size={12} /> Quality &amp; Compliance
        </div>
        <h1>Uncompromising<br />Analytical Standards</h1>
        <p>
          Scientific innovation is the foundation of <span>Med</span>-Peptides.
          Every compound is validated through rigorous multi-stage analytical methods before release.
        </p>
      </div>

      {/* ── Trust stat bar ────────────────────────── */}
      <div className="qp-stat-bar">
        {TRUST_STATS.map(({ icon, value, label }) => (
          <div key={label} className="qp-stat-item">
            {icon}
            <div className="qp-stat-value">{value}</div>
            <div className="qp-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Feature cards ─────────────────────────── */}
      <div className="qp-grid">
        {features.map((f, i) => (
          <div key={i} className="qp-card">
            {/* Image */}
            <div className="qp-card-img" style={{ backgroundImage: `url(${f.image})` }}>
              <div className="qp-card-stat">
                <span className="qp-card-stat-val">{f.stat}</span>
                <span className="qp-card-stat-lbl">{f.statLabel}</span>
              </div>
            </div>
            {/* Body */}
            <div className="qp-card-body">
              <div className="qp-card-icon-row">
                <div className="qp-card-icon">{f.icon}</div>
                <div className="qp-card-title">{f.title}</div>
              </div>
              <p className="qp-card-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Transparency block ────────────────────── */}
      <div className="qp-transparency">
        <div className="qp-transparency-inner">
          <div className="qp-coa-label">
            <ShieldCheck size={16} /> Certificate of Analysis (CoA)
          </div>
          <h2>Analytical Transparency</h2>
          <p>
            We maintain a rigorous documentation protocol for every batch. HPLC Chromatograms and
            Mass Spectrometry results are available for institutional review — ensuring your research
            is built on verified chemical integrity.
          </p>
          <div className="qp-pills">
            <div className="qp-pill">Batch-Specific HPLC</div>
            <div className="qp-pill">Sequence Verification</div>
            <div className="qp-pill">Purity Optimisation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
