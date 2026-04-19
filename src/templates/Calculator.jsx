import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import SyringeVisualizer from '../components/SyringeVisualizer';
import { jsPDF } from 'jspdf';
import { FlaskConical, Download, BookOpen, Droplets, Syringe, ChevronRight } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function calcUnits(mg, ml, dose) {
  const m = parseFloat(mg);
  const l = parseFloat(ml);
  const d = parseFloat(dose);
  const totalMcg = m * 1000;
  if (!totalMcg || !l || !d || isNaN(m) || isNaN(l) || isNaN(d)) return '—';
  return ((d / totalMcg) * l * 100).toFixed(1);
}

/* ─── PDF export ───────────────────────────────────────────────────────────── */
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
  doc.text('REGEN PEPT', 14, 12);
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
  doc.text('REGEN PEPT — Research Report  |  regenpept.com', 14, FOOTER_Y + 5.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(180, 205, 230);
  doc.text(
    'For research purposes only. Verify calculations before use.',
    105, FOOTER_Y + 11, { align: 'center' }
  );

  doc.save(`RegenPept_Reconstitution_${Date.now()}.pdf`);
}

/* ─── component ────────────────────────────────────────────────────────────── */
export default function Calculator() {
  const isMobile = useResponsive('(max-width: 767px)');
  const isTablet = useResponsive('(max-width: 1099px)');
  const [reconData, setReconData] = useState({ mg: '5', ml: '2', dose: '250' });

  const units = useMemo(
    () => calcUnits(reconData.mg, reconData.ml, reconData.dose),
    [reconData]
  );

  const handleChange = (field) => (e) =>
    setReconData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleExport = () =>
    exportPDF({ mg: reconData.mg, ml: reconData.ml, dose: reconData.dose, units });

  return (
    <div style={{ backgroundColor: '#f7f9fc', minHeight: '100vh' }}>

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #002b4d 0%, #004b87 60%, #005fa3 100%)',
        paddingTop: 'clamp(5rem, 12vw, 8rem)',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-4rem', right: '-4rem',
          width: '24rem', height: '24rem',
          background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-6rem', left: '-6rem',
          width: '32rem', height: '32rem',
          background: 'rgba(255,255,255,0.03)', borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '0.4rem 1rem', borderRadius: '999px',
            color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem',
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '1.5rem'
          }}>
            <FlaskConical size={13} /> Research Tool
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            color: 'white', fontWeight: 850,
            letterSpacing: '-0.03em', lineHeight: 1.1,
            margin: '0 auto 1rem auto', maxWidth: '700px'
          }}>
            Precision Reconstitution<br />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.75em' }}>
              Calculator
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            maxWidth: '520px', margin: '0 auto', lineHeight: 1.6
          }}>
            Determine the exact insulin syringe units for your peptide dosage.
            Always verify with analytical standards.
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>

        {/* Primary grid: inputs + result side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 380px',
          gap: '1.5rem',
          maxWidth: '900px',
          margin: '0 auto 1.5rem auto',
        }}>

          {/* ── Input Panel ──────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e8eef5',
            boxShadow: '0 4px 24px rgba(0,43,77,0.06)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          }}>
            <h2 style={{
              fontSize: '1.05rem', fontWeight: 800,
              color: 'var(--primary)', marginBottom: '0.3rem',
              letterSpacing: '-0.01em'
            }}>
              Research Parameters
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Enter your vial specifications below.
            </p>

            <InputField
              label="Peptide Quantity"
              unit="mg"
              hint={`e.g. ${reconData.mg} mg BPC-157 vial`}
              value={reconData.mg}
              onChange={handleChange('mg')}
            />
            <InputField
              label="Bacteriostatic Water"
              unit="ml"
              hint={`e.g. ${reconData.ml} ml added to vial`}
              value={reconData.ml}
              onChange={handleChange('ml')}
            />
            <InputField
              label="Desired Dose"
              unit="mcg"
              hint={`e.g. ${reconData.dose} mcg per injection`}
              value={reconData.dose}
              onChange={handleChange('dose')}
            />

            {/* Formula breakdown */}
            <div style={{
              backgroundColor: '#f0f6ff',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              border: '1px solid #d0e4f7',
              marginTop: '0.5rem'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                Formula
              </div>
              <code style={{ fontSize: '0.82rem', color: '#334', wordBreak: 'break-all', display: 'block', lineHeight: 1.5 }}>
                ({reconData.dose} mcg ÷ ({reconData.mg} mg × 1000)) × {reconData.ml} ml × 100
                {' '}= <strong style={{ color: 'var(--primary)' }}>{units} units</strong>
              </code>
            </div>
          </div>

          {/* ── Result Panel ─────────────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(160deg, #002b4d 0%, #004b87 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,43,77,0.2)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
            order: isMobile ? -1 : 0,
          }}>
            <div style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)'
            }}>
              Calculated Research Dose
            </div>

            <div style={{
              fontSize: 'clamp(4rem, 10vw, 5.5rem)',
              fontWeight: 850, color: 'white', lineHeight: 1,
              letterSpacing: '-0.03em'
            }}>
              {units}
            </div>
            <div style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em',
              marginTop: '-0.75rem'
            }}>
              UNITS
            </div>

            {/* Syringe visualizer */}
            <SyringeVisualizer units={units} />

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0.9rem 1.1rem',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6,
              width: '100%',
            }}>
              Pull the syringe to the{' '}
              <strong style={{ color: 'white' }}>{units}</strong>{' '}
              mark on a standard <strong>U-100 (1ml)</strong> insulin syringe.
            </div>

            <button
              onClick={handleExport}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                backgroundColor: 'white',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.2s, transform 0.2s',
                letterSpacing: '0.02em',
                marginTop: 'auto',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Download size={16} /> Export PDF Report
            </button>
          </div>
        </div>

        {/* ── Secondary row: Coffee tip + Guide side by side ─────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1.5rem',
          maxWidth: '900px',
          margin: '0 auto 1.5rem auto',
        }}>

          {/* Coffee analogy */}
          <div style={{
            backgroundColor: '#fffbf5',
            borderRadius: '20px',
            border: '1px solid #f0ddb8',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>☕</span>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#fbbf24',
                  color: '#78350f',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}>Quick Tip</span>
                <h3 style={{ margin: 0, color: '#7a4c10', fontSize: '1rem', fontWeight: 800 }}>
                  The Coffee Analogy
                </h3>
              </div>
            </div>

            <p style={{ color: '#5a3a0a', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              Think of your peptide{' '}
              <strong style={amberVal}>{reconData.mg} mg</strong>{' '}
              as coffee grounds and{' '}
              <strong style={amberVal}>{reconData.ml} ml</strong>{' '}
              of water as your brew. To get your{' '}
              <strong style={amberVal}>{reconData.dose} mcg</strong>{' '}
              dose, draw{' '}
              <strong style={amberValLg}>{units} units</strong>{' '}
              into your syringe.
            </p>

            <p style={{ color: '#5a3a0a', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
              More water dilutes the coffee. Less water makes it stronger —
              your reconstitution ratio determines how concentrated each unit is.
            </p>
          </div>

          {/* Reconstitution guide */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e8eef5',
            boxShadow: '0 4px 24px rgba(0,43,77,0.05)',
            padding: '1.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <BookOpen size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                Reconstitution Guide
              </h3>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                'Use <strong>Bacteriostatic Water</strong> for multi-dose research vials.',
                'Gently swirl; <strong>never shake</strong> — shaking damages the molecular structure.',
                'Store at <strong>2°C – 8°C</strong>, away from light, after reconstitution.',
                'U-100 syringes have <strong>100 units per 1ml</strong>. Each unit = 0.01 ml.',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <span style={{
                    flexShrink: 0, width: '20px', height: '20px',
                    backgroundColor: 'rgba(0,43,77,0.08)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 800, marginTop: '1px'
                  }}>{i + 1}</span>
                  <span dangerouslySetInnerHTML={{ __html: tip }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Supply CTAs ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {/* Bacteriostatic Water */}
          <Link to="/supplies" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #e8f4ff 0%, #f0f9ff 100%)',
              borderRadius: '16px',
              border: '1px solid #bfdbfe',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,43,77,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.75rem' }}>💧</span>
                <div>
                  <p style={{ margin: '0 0 0.15rem 0', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    Bacteriostatic Water
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sterile 30 ml vials · 0.9% benzyl alcohol
                  </p>
                </div>
              </div>
              <ChevronRight size={18} color="var(--primary)" />
            </div>
          </Link>

          {/* Syringes */}
          <Link to="/supplies" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(4,120,87,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.75rem' }}>💉</span>
                <div>
                  <p style={{ margin: '0 0 0.15rem 0', fontWeight: 800, color: '#065f46', fontSize: '0.95rem' }}>
                    Precision Syringes
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    31G × 8 mm · U-100 sterile insulin syringes
                  </p>
                </div>
              </div>
              <ChevronRight size={18} color="#065f46" />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

/* ─── Input field sub-component ────────────────────────────────────────────── */
function InputField({ label, unit, hint, value, onChange }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem',
        color: 'var(--text-main)'
      }}>
        {label}
        <span style={{
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
          backgroundColor: 'rgba(0,43,77,0.07)', padding: '0.1rem 0.5rem',
          borderRadius: '999px'
        }}>{unit}</span>
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: '1.5px solid #dde6f0',
          fontSize: '1.05rem',
          fontWeight: 600,
          boxSizing: 'border-box',
          touchAction: 'manipulation',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          outline: 'none',
          color: 'var(--text-main)',
          backgroundColor: '#fafcff',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,43,77,0.08)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#dde6f0'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem', fontSize: '0.8rem' }}>{hint}</small>
    </div>
  );
}

/* ─── Shared style tokens ──────────────────────────────────────────────────── */
const amberVal = {
  color: '#b45309',
  backgroundColor: 'rgba(251,191,36,0.18)',
  borderRadius: '3px',
  padding: '0 3px',
  fontWeight: 700,
};
const amberValLg = {
  color: '#92400e',
  backgroundColor: 'rgba(251,191,36,0.28)',
  borderRadius: '4px',
  padding: '1px 5px',
  fontWeight: 800,
  fontSize: '1.05em',
};
