"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Activity,
  Award,
  Zap,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  Clock,
  Layers
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';

export default function ColwayTrichologyStemCellShowcase({ lang = 'en' }) {
  const isEs = lang === 'es';
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const bannerSrc = '/images/products/colway/colway-trichology-banner.jpg';
  const pdfDownloadUrl = '/docs/colway-trichology-pharmacist-monograph.pdf';

  return (
    <section style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── 1. Hero Banner Image (Have a Good Baicapil™ Hair Day) ── */}
      <div
        onClick={() => setIsBannerModalOpen(true)}
        role="button"
        tabIndex={0}
        title={isEs ? 'Haz clic para ampliar la imagen del tratamiento' : 'Click to inspect high-resolution campaign banner'}
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '360px',
          overflow: 'hidden',
          cursor: 'zoom-in',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={bannerSrc}
          alt="Have a Good Baicapil™ Hair Day - Colway Trichology Hair Care Line"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '360px',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Floating Zoom Pill */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '14px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <ZoomIn size={14} />
          <span>{isEs ? 'Ampliar Campaña' : 'Inspect Banner'}</span>
        </div>

        {/* Floating Technical Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          background: 'rgba(13, 148, 136, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '6px',
          padding: '4px 10px',
          color: '#ffffff',
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          Colway Trichology · Baicapil™ 2%
        </div>
      </div>

      {/* ── 2. Header Strip with PDF Download Button ── */}
      <div style={{
        padding: '1.75rem 2rem 1.25rem',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(13, 148, 136, 0.1)',
            color: '#0d9488',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '6px'
          }}>
            <Sparkles size={12} />
            <span>{isEs ? 'Monografía Técnica Farmacéutica' : 'Pharmacist Technical Monograph'}</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {isEs 
              ? 'Activación de Células Madre Foliculares (HFSC) y Baicapil™ 2%' 
              : 'Follicular Stem Cell Activation & Baicapil™ 2% Formulations'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
            {isEs 
              ? 'Evolución de la línea tricológica: superando la simple vasodilatación de diosmina mediante reactivación celular directa.' 
              : 'Next-generation hair care: advancing beyond traditional diosmin vasodilation toward direct follicular stem cell reactivation.'}
          </p>
        </div>

        {/* Prominent PDF Download Button */}
        <a
          href={pdfDownloadUrl}
          download="COLWAY-TRICHOLOGY-PHARMACIST-TECHNICAL-MONOGRAPH.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: '#0d9488',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0f766e'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.transform = 'none'; }}
        >
          <Download size={16} />
          <span>{isEs ? 'Descargar Infografía Oficial (PDF)' : 'Download Technical Monograph (PDF)'}</span>
        </a>
      </div>

      {/* ── 3. 4 Clinical & Biomarker Efficacy Cards (From Original PDF) ── */}
      <div style={{
        padding: '1.5rem 2rem',
        background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0d9488', lineHeight: 1.1 }}>
              +49%
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginTop: '4px' }}>
              {isEs ? 'Incremento de Cabello' : 'Hair Count Increase'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Evaluado en 84 días clínicos' : 'Documented in 84 days'}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0284c7', lineHeight: 1.1 }}>
              +17%
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginTop: '4px' }}>
              {isEs ? 'Grosor y Calibre' : 'Hair Thickness'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Mayor resistencia a la tracción' : 'Improved tensile elasticity'}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#7c3aed', lineHeight: 1.1 }}>
              COL-XVII
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginTop: '4px' }}>
              {isEs ? 'Expresión Colágeno XVII' : 'Collagen XVII Boost'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Frena canicie y miniaturización' : 'Slows graying & miniaturization'}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ea580c', lineHeight: 1.1 }}>
              2.0%
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginTop: '4px' }}>
              {isEs ? 'Concentración Baicapil™' : 'Optimal Concentration'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Eficacia biológica estandarizada' : 'Maximum receptor saturation'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Primary Active Focus: 3 Biological Mechanisms ── */}
      <div style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
          {isEs ? 'Foco Activo Primario: Baicapil™ 2% y Registro de Células Madre' : 'Primary Active Focus: Baicapil™ 2% & Stem Cell Registration'}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(13, 148, 136, 0.12)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <Zap size={20} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {isEs ? '1. Activación de Células Madre (HFSC)' : '1. HFSC Stem Cell Activation'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              {isEs
                ? 'Estimula las células madre del folículo piloso en la región de la protuberancia (bulge), iniciando la renovación metabólica y promoviendo la proliferación celular.'
                : 'Stimulates hair follicle stem cells (HFSCs) in the bulge region, initiating metabolic renewal and promoting cellular proliferation.'}
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <Clock size={20} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {isEs ? '2. Prolongación de la Fase Anágena' : '2. Anagen Phase Prolongation'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              {isEs
                ? 'Induce a los folículos pilosos a entrar en la fase de crecimiento activo (anágena) y extiende significativamente su duración, retrasando el inicio de la fase catágena.'
                : 'Forces hair follicles into the active growth (anagen) phase and significantly extends its duration, delaying the onset of catagen.'}
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(225, 29, 72, 0.12)',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <ShieldCheck size={20} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {isEs ? '3. Reducción de la Caída Telógena' : '3. Telogen Shedding Reduction'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              {isEs
                ? 'Previene la miniaturización folicular y la caída prematura, generando incrementos medibles en la densidad capilar total y el calibre de la fibra.'
                : 'Prevents follicle miniaturization and premature shedding, resulting in measurable increases in total hair density and fiber caliber.'}
            </p>
          </div>
        </div>

        {/* ── 5. Detailed Breakdown of Shampoo & Conditioner Formulas (From PDF) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Shampoo Card */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Paso 1 · Limpieza Folicular Diaria' : 'Step 1 · Daily Trichological Cleansing'}
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#f0fdfa', color: '#0d9488', fontWeight: 700 }}>
                Shampoo 200ml
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Hair Strengthening Shampoo
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              {isEs 
                ? 'Prepara el sustrato del cuero cabelludo mientras suministra compuestos bioactivos concentrados directamente a la unidad folicular.' 
                : 'Prepares the scalp substrate while delivering concentrated bioactive compounds directly to the follicular unit.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>Baicapil™ (2%) · Stem Cell Target</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Complejo botánico (Escutelaria asiática, extractos de soja y trigo). Rico en baicalina; reduce la microinflamación del cuero cabelludo y prolonga la fase anágena.' 
                    : 'Botanical complex (Baikal Skullcap, Soy & Wheat). Rich in Baicalin; reduces scalp micro-inflammation while prolonging anagen.'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>Kerascalp™ (Amla Extract) · Follicle Integrity</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Potencia la expresión de Colágeno XVII en el nicho de células madre. Previene la miniaturización folicular, aumenta la densidad y ralentiza la despigmentación (canas).' 
                    : 'Enhances Collagen XVII expression at the stem cell niche. Prevents follicle miniaturization, increases hair density, and slows depigmentation (graying).'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>Hydrafeel® (Pantotrophin 3) · Hydration / Barrier</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Derivado avanzado de Provitamina B5. Fija la humedad intrínseca, protege la fibra capilar frente al estrés térmico/ambiental y protege el cabello teñido.' 
                    : 'Advanced Provitamin B5 derivative. Binds intrinsic moisture, shields hair shaft from thermal/environmental stress, and protects color-treated hair.'}
                </span>
              </div>
            </div>
          </div>

          {/* Conditioner Card */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Paso 2 · Terapia Post-Lavado y Sellado' : 'Step 2 · Synergistic Post-Shampoo Therapy'}
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#f0f9ff', color: '#0284c7', fontWeight: 700 }}>
                Conditioner 200ml
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Hair Strengthening Conditioner
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              {isEs 
                ? 'Restaura el equilibrio lipídico, mejora la elasticidad ante la tracción y establece una matriz protectora frente al daño ambiental.' 
                : 'Restores lipid equilibrium, enhances tensile elasticity, and establishes a protective matrix against environmental damage.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>Baicapil™ (2%) + Kerascalp™ · Stem Cell Target</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Refuerza la vía activa primaria para mantener el metabolismo folicular óptimo, mejorar la densidad y aportar protección antienvejecimiento.' 
                    : 'Reinforces primary active pathway to maintain optimal follicle metabolism, density enhancement, and anti-aging protection.'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>Cottonseed & Sweet Almond Oils · Lipid Matrix</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Rico en ácidos grasos insaturados esenciales y ácido linoleico. Restaura la barrera lipídica cortical, alisa la cutícula y calma la irritación del cuero cabelludo.' 
                    : 'High in essential unsaturated fatty acids and linoleic acid. Restores cortical lipid barrier, smooths cuticle, prevents split ends, and calms scalp irritation.'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>Horsetail Extract & Hydrafeel® · Structural Fortification</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Extracto de cola de caballo rico en silicio orgánico: fortalece las matrices estructurales de queratina, detoxifica el cuero cabelludo y garantiza hidratación sostenida.' 
                    : 'Silica-rich extract fortifies keratin structural matrices, detoxifies the scalp environment, and guarantees sustained hydration.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. Pharmaceutical Rationale & Patient Counseling ── */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#f8fafc',
          border: '1px solid #334155'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#38bdf8" />
            <span>{isEs ? 'Racional Farmacéutico y Consejo al Paciente' : 'Pharmaceutical Rationale & Patient Counseling'}</span>
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            fontSize: '0.8rem',
            lineHeight: 1.55
          }}>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>
                {isEs ? 'Mecanismo de Acción:' : 'Mechanism of Action:'}
              </strong>
              <span style={{ color: '#cbd5e1' }}>
                {isEs
                  ? 'Supera la vasodilatación tradicional de diosmina para pasar a la reactivación celular directa mediante Baicapil™ 2%, estimulando las células madre quiescentes del bulge.'
                  : 'Moves beyond traditional vasodilation (diosmin) to stem cell reactivation (Baicapil™ 2%), stimulating quiescent bulge stem cells directly.'}
              </span>
            </div>

            <div>
              <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>
                {isEs ? 'Perfil de Indicación:' : 'Indication Profile:'}
              </strong>
              <span style={{ color: '#cbd5e1' }}>
                {isEs
                  ? 'Efluvio telógeno, afinamiento androgenético, cabello debilitado post-estrés o tratamientos farmacológicos, y envejecimiento capilar prematuro/canicie.'
                  : 'Telogen effluvium, androgenetic thinning support, fragile/weakened hair post-stress/treatment, premature hair aging and depigmentation.'}
              </span>
            </div>

            <div>
              <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>
                {isEs ? 'Pauta de Aplicación:' : 'Patient Regimen:'}
              </strong>
              <span style={{ color: '#cbd5e1' }}>
                {isEs
                  ? 'Champú de uso diario sobre cuero cabelludo húmedo masajeando para activar la microcirculación; seguido del Acondicionador dejado 2-3 minutos para sellar los activos.'
                  : 'Daily application of Shampoo to wet scalp, massaged to stimulate microcirculation; followed by Conditioner left for 2-3 minutes to seal actives into hair shaft and scalp.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Image Modal for Campaign Banner */}
      <ImageModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        imageSrc={bannerSrc}
        altText="Colway Trichology Campaign Banner"
      />
    </section>
  );
}
