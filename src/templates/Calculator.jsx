/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { usePageMeta } from '../hooks/usePageMeta';
import SyringeVisualizer from '../components/SyringeVisualizer';
import VialVisualizer from '../components/VialVisualizer';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { trackToolUsage } from '../hooks/useAnalytics';
import {
  FlaskConical,
  Download,
  BookOpen,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

/* ─── Math engine ─────────────────────────────────────────────────────────── */
function calcUnits(mg, ml, dose) {
  const m = parseFloat(mg);
  const l = parseFloat(ml);
  const d = parseFloat(dose);
  const totalMcg = m * 1000;
  if (!totalMcg || !l || !d || isNaN(m) || isNaN(l) || isNaN(d)) return '—';
  return ((d / totalMcg) * l * 100).toFixed(1);
}

/* ─── PDF export (unchanged logic) ───────────────────────────────────────── */
function exportPDF({ mg, ml, dose, units }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now = new Date().toLocaleString();
  const dateOnly = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  doc.setFillColor(0, 43, 77);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Atlas Health', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Research Report', 14, 20);
  doc.text(`Generated: ${now}`, 210 - 14, 20, { align: 'right' });

  doc.setTextColor(0, 43, 77);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Precision Reconstitution Report', 14, 42);

  doc.setDrawColor(0, 43, 77);
  doc.setLineWidth(0.5);
  doc.line(14, 46, 196, 46);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Input Parameters', 14, 56);

  const rows = [
    ['Parameter',            'Value',    'Unit'],
    ['Date',                 dateOnly,   '—'  ],
    ['Peptide Quantity',     String(mg), 'mg' ],
    ['Bacteriostatic Water', String(ml), 'ml' ],
    ['Desired Dose',         String(dose), 'mcg'],
  ];

  let y = 62;
  rows.forEach((row, i) => {
    const isHeader = i === 0;
    if (isHeader) {
      doc.setFillColor(230, 240, 250);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      const shade = i % 2 === 0 ? 248 : 255;
      doc.setFillColor(shade, shade, shade);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.setFont('helvetica', 'normal');
    }
    doc.setTextColor(30, 30, 30);
    doc.text(row[0], 18, y);
    doc.text(row[1], 110, y);
    doc.text(row[2], 170, y);
    y += 10;
  });

  y += 6;
  doc.setFillColor(0, 43, 77);
  doc.rect(14, y, 182, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Calculated Research Dose', 105, y + 8, { align: 'center' });
  doc.setFontSize(22);
  doc.text(`${units} UNITS`, 105, y + 18, { align: 'center' });

  y += 34;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Formula:  Units = (Dose mcg ÷ (mg × 1000)) × ml × 100', 14, y);

  y += 16;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'This report is intended for research purposes only. Always verify calculations with analytical standards.',
    14, y, { maxWidth: 182 }
  );

  const FOOTER_Y = 282;
  doc.setFillColor(0, 43, 77);
  doc.rect(0, FOOTER_Y, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Atlas Health — Research Report  |  Atlas Health.com', 14, FOOTER_Y + 5.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(180, 205, 230);
  doc.text(
    'For research purposes only. Verify calculations before use.',
    105, FOOTER_Y + 11, { align: 'center' }
  );

  doc.save(`Atlas Health_Reconstitution_${Date.now()}.pdf`);
}

/* ─── Shared style tokens (must live before the component for minifier safety) ── */
const amberVal = {
  color: '#fbbf24',
  backgroundColor: 'rgba(251,191,36,0.12)',
  borderRadius: '3px',
  padding: '0 3px',
  fontWeight: 700,
};
const amberValLg = {
  color: '#f59e0b',
  backgroundColor: 'rgba(251,191,36,0.2)',
  borderRadius: '4px',
  padding: '1px 5px',
  fontWeight: 800,
  fontSize: '1.05em',
};

/* ─── InputField — memoised ────────────────────────────────────────────────── */
const InputField = memo(function InputField({ label, unit, hint, value, onChange, invalid }) {
  return (
    <div className="calc-field">
      <label className="calc-field__label">
        {label}
        <span className="calc-field__unit">{unit}</span>
      </label>
      <div className="calc-field__wrap">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          className={`calc-field__input${invalid ? ' calc-field__input--invalid' : ''}`}
        />
      </div>
      <div className="calc-field__hint-row">
        {invalid && (
          <span className="calc-field__err">
            <AlertCircle size={10} /> Must be &gt; 0
          </span>
        )}
        {!invalid && <small className="calc-field__hint">{hint}</small>}
      </div>
    </div>
  );
});

/* ─── Result number — glow animation when value changes ─────────────────────── */
const ResultDisplay = memo(function ResultDisplay({ units }) {
  const [glow, setGlow] = useState(false);
  const prevRef = useRef(units);

  useEffect(() => {
    if (units !== prevRef.current && units !== '—') {
      prevRef.current = units;
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 600);
      return () => clearTimeout(t);
    }
  }, [units]);

  return (
    <div className={`calc-result__number${glow ? ' calc-result__number--glow' : ''}`}>
      {units}
    </div>
  );
});

/* ─── Main component ────────────────────────────────────────────────────────── */
export default function Calculator() {
  usePageMeta({
    title: 'Peptide Reconstitution Calculator',
    description: 'Free peptide reconstitution calculator for researchers — compute concentration, dose volume, and vial usage based on peptide mass and bacteriostatic water.',
    path: '/calculator',
  });

  // ── All state declarations first (prevents TDZ under minification) ──────────
  const isMobile = useResponsive('(max-width: 767px)');
  const [bacWater, setBacWater] = useState('2');
  const [vialDosageMg, setVialDosageMg] = useState('5');
  const [desiredDosageMcg, setDesiredDosageMcg] = useState('250');

  // ── Derived values (useMemo BEFORE useEffect that reads them) ────────────────
  const units = useMemo(
    () => {
        const m = parseFloat(vialDosageMg);
        const l = parseFloat(bacWater);
        const d = parseFloat(desiredDosageMcg);
        if (!m || !l || !d || isNaN(m) || isNaN(l) || isNaN(d)) return '—';
        return ((d / (m * 1000)) * l * 100).toFixed(1);
    },
    [vialDosageMg, bacWater, desiredDosageMcg]
  );

  const invalid = useMemo(() => ({
    mg:   !vialDosageMg   || parseFloat(vialDosageMg)   <= 0,
    ml:   !bacWater       || parseFloat(bacWater)       <= 0,
    dose: !desiredDosageMcg || parseFloat(desiredDosageMcg) <= 0,
  }), [vialDosageMg, bacWater, desiredDosageMcg]);

  // ── Callbacks ────────────────────────────────────────────────────────────────
  const handleChange = (setter) => (e) => setter(e.target.value);

  const handleExport = useCallback(
    () => {
      trackToolUsage('peptide_calculator_export', {
        mg: vialDosageMg,
        ml: bacWater,
        dose: desiredDosageMcg,
        result_units: units,
      });
      exportPDF({ mg: vialDosageMg, ml: bacWater, dose: desiredDosageMcg, units });
    },
    [vialDosageMg, bacWater, desiredDosageMcg, units]
  );

  // ── Effects (after all memo/state so `units` is already initialised) ─────────
  useEffect(() => {
    if (units !== '—' && !isNaN(parseFloat(units))) {
      trackToolUsage('peptide_calculator', {
        mg: vialDosageMg,
        ml: bacWater,
        dose: desiredDosageMcg,
        result_units: units,
      });
    }
  }, [units, vialDosageMg, bacWater, desiredDosageMcg]);

  return (
    <div className="calc-page">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="calc-hero">
        <div className="calc-hero__orb calc-hero__orb--a" />
        <div className="calc-hero__orb calc-hero__orb--b" />
        <div className="container calc-hero__inner">
          <div className="calc-hero__badge">
            <FlaskConical size={13} /> Research Tool
          </div>
          <h1 className="calc-hero__title">
            Precision Reconstitution<br />
            <span className="calc-hero__subtitle">Calculator</span>
          </h1>
          <p className="calc-hero__tagline">
            Determine the exact insulin syringe units for your peptide dosage.
            Always verify with analytical standards.
          </p>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="container calc-body">

        {/* Mobile Picture-in-Picture syringe strip */}
        {isMobile && (
          <div className="calc-pip">
            <div className="calc-pip__visuals" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <VialVisualizer waterAmount={bacWater} />
              <ChevronRight size={24} color="rgba(255,255,255,0.3)" />
              <SyringeVisualizer units={units} />
            </div>
            <div className="calc-pip__result">
              <span className="calc-pip__label">Units to Inject</span>
              <ResultDisplay units={units} />
            </div>
          </div>
        )}

        {/* Primary grid */}
        <div className={`calc-grid${isMobile ? ' calc-grid--mobile' : ''}`}>

          {/* ── Input panel ─────────────────────────────────────────────── */}
          <div className="calc-panel calc-panel--inputs">
            <div className="calc-panel__head">
              <h2 className="calc-panel__title">Research Parameters</h2>
              <p className="calc-panel__desc">Enter your vial specifications below.</p>
            </div>

            <InputField
              label="Peptide Quantity"
              unit="mg"
              hint={`e.g. ${vialDosageMg} mg BPC-157 vial`}
              value={vialDosageMg}
              onChange={handleChange(setVialDosageMg)}
              invalid={invalid.mg}
            />
            <InputField
              label="Bacteriostatic Water"
              unit="ml"
              hint={`e.g. ${bacWater} ml added to vial`}
              value={bacWater}
              onChange={handleChange(setBacWater)}
              invalid={invalid.ml}
            />
            <InputField
              label="Desired Dose"
              unit="mcg"
              hint={`e.g. ${desiredDosageMcg} mcg per injection`}
              value={desiredDosageMcg}
              onChange={handleChange(setDesiredDosageMcg)}
              invalid={invalid.dose}
            />

            {/* Formula breakdown */}
            <div className="calc-formula">
              <div className="calc-formula__label">Formula</div>
              <code className="calc-formula__eq">
                ({desiredDosageMcg || 0} mcg ÷ ({vialDosageMg || 0} mg × 1000)) × {bacWater || 0} ml × 100
                {' '}= <strong className="calc-formula__result">{units} units</strong>
              </code>
            </div>
          </div>

          {/* ── Result panel — sticky on desktop ────────────────────────── */}
          {!isMobile && (
            <div className="calc-panel calc-panel--result">
              <div className="calc-result">
                <div className="calc-result__label">Units to Inject</div>
                <ResultDisplay units={units} />
                <div className="calc-result__units-label">UNITS</div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2.5rem', 
                  margin: '2rem 0',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '2rem',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem' }}>Step 1: Reconstitute</div>
                    <VialVisualizer waterAmount={bacWater} />
                  </div>
                  
                  <motion.div 
                    animate={{ x: [0, 5, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    <ChevronRight size={32} strokeWidth={1} />
                  </motion.div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem' }}>Step 2: Draw Dose</div>
                    <SyringeVisualizer units={units} />
                  </div>
                </div>

                <div className="calc-result__tip">
                  Pull the syringe to the{' '}
                  <strong>{units}</strong> mark on a standard{' '}
                  <strong>U-100 (1ml)</strong> insulin syringe.
                </div>

                {/* Minimalist PDF button */}
                <button className="calc-pdf-btn" onClick={handleExport}>
                  <Download size={14} strokeWidth={1.5} />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile PDF button (below inputs) */}
        {isMobile && (
          <button className="calc-pdf-btn calc-pdf-btn--mobile" onClick={handleExport}>
            <Download size={14} strokeWidth={1.5} />
            Download PDF Report
          </button>
        )}

        {/* ── Secondary row ────────────────────────────────────────────────── */}
        <div className={`calc-secondary${isMobile ? ' calc-secondary--mobile' : ''}`}>

          {/* Coffee analogy */}
          <div className="calc-card calc-card--amber">
            <div className="calc-card__head">
              <span className="calc-card__emoji">☕</span>
              <div>
                <span className="calc-card__badge">Quick Tip</span>
                <h3 className="calc-card__title">The Coffee Analogy</h3>
              </div>
            </div>
            <p className="calc-card__text">
              Think of your peptide{' '}
              <mark style={amberVal}>{vialDosageMg} mg</mark>{' '}
              as coffee grounds and{' '}
              <mark style={amberVal}>{bacWater} ml</mark>{' '}
              of water as your brew. To get your{' '}
              <mark style={amberVal}>{desiredDosageMcg} mcg</mark>{' '}
              dose, draw{' '}
              <mark style={amberValLg}>{units} units</mark>{' '}
              into your syringe.
            </p>
            <p className="calc-card__sub">
              More water dilutes the coffee. Less water makes it stronger —
              your reconstitution ratio determines how concentrated each unit is.
            </p>
          </div>

          {/* Reconstitution guide */}
          <div className="calc-card calc-card--white">
            <div className="calc-card__head">
              <BookOpen size={16} color="var(--primary)" />
              <h3 className="calc-card__title" style={{ color: 'var(--primary)' }}>
                Reconstitution Guide
              </h3>
            </div>
            <ul className="calc-guide-list">
              <li className="calc-guide-list__item">
                <span className="calc-guide-list__num">1</span>
                <span>
                  Use <Link to="/product/bacteriostatic-water" className="calc-guide-link">Bacteriostatic Water</Link> for multi-dose research vials.
                </span>
              </li>
              <li className="calc-guide-list__item">
                <span className="calc-guide-list__num">2</span>
                <span>
                  Gently swirl; <strong>never shake</strong> — shaking damages the molecular structure.
                </span>
              </li>
              <li className="calc-guide-list__item">
                <span className="calc-guide-list__num">3</span>
                <span>
                  Store at <strong>2°C – 8°C</strong>, away from light, after reconstitution.
                </span>
              </li>
              <li className="calc-guide-list__item">
                <span className="calc-guide-list__num">4</span>
                <span>
                  <Link to="/product/precision-insulin-syringes" className="calc-guide-link">U-100 syringes</Link> have <strong>100 units per 1ml</strong>. Each unit = 0.01 ml.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Supply CTAs ──────────────────────────────────────────────────── */}
        <div className={`calc-ctas${isMobile ? ' calc-ctas--mobile' : ''}`}>
          <Link to="/product/bacteriostatic-water" className="calc-cta calc-cta--water">
            <div className="calc-cta__left">
              <span className="calc-cta__emoji">💧</span>
              <div>
                <p className="calc-cta__name">Bacteriostatic Water</p>
                <p className="calc-cta__sub">Sterile 30 ml vials · 0.9% benzyl alcohol</p>
              </div>
            </div>
            <ChevronRight size={17} className="calc-cta__arrow" />
          </Link>

          <Link to="/product/precision-insulin-syringes" className="calc-cta calc-cta--syringe">
            <div className="calc-cta__left">
              <span className="calc-cta__emoji">💉</span>
              <div>
                <p className="calc-cta__name">Precision Syringes</p>
                <p className="calc-cta__sub">31G × 8 mm · U-100 sterile insulin syringes</p>
              </div>
            </div>
            <ChevronRight size={17} className="calc-cta__arrow" />
          </Link>
        </div>

      </div>
    </div>
  );
}

// (style tokens moved above the component — see top of file)
