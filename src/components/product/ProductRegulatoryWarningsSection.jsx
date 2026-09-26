"use client";

import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Droplets, 
  Building2, 
  Info, 
  Beaker, 
  Clock, 
  Thermometer 
} from '@/lib/icons';

/**
 * ProductRegulatoryWarningsSection
 * Tailored regulatory warnings and safety governance for each product category:
 * - Cosmetics (Colway, hair & skin care): EU Reg 1223/2009, CPNP, topical safety, patch testing, PAO 12M.
 * - Diagnostic Kits (Bloodo, capillary DBS): CE-IVDR 2017/746, Whatman 903 drying, specimen validity, ISO 15189.
 * - Solvents (Bacteriostatic Water): 0.9% Benzyl Alcohol, 28-day puncture limit, aseptic handling.
 * - Corporate Services (Spain/UAE): Law 14/2013, institutional escrow, compliance.
 * - Peptides / Vials: Physician supervision, sterile SubQ reconstitution, 2-8°C cold chain, RP-HPLC release.
 */
export default function ProductRegulatoryWarningsSection({
  product,
  lang = 'en',
  isCosmeticProduct = false,
  isDiagnosticKit = false,
  isSolventProduct = false,
  isCorporateService = false,
  supplierName = 'Atlas Synthesis Partner'
}) {
  const isEs = lang === 'es';

  // ─────────────────────────────────────────────────────────────
  // 1. COSMETIC / TOPICAL CARE (Colway, Shampoos, Conditioners)
  // ─────────────────────────────────────────────────────────────
  if (isCosmeticProduct) {
    return (
      <section 
        id="regulatory-warnings" 
        className="pds-section-card"
        style={{
          border: '1px solid #99f6e4',
          background: 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(13, 148, 136, 0.06)'
        }}
      >
        <div 
          className="pds-section-header" 
          style={{ 
            background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ShieldCheck size={22} color="#5eead4" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#99f6e4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isEs ? 'SEGURIDAD COSMÉTICA & GOBERNANZA DERMATOLÓGICA' : 'COSMETIC SAFETY & DERMATOLOGICAL GOVERNANCE'}
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {isEs ? 'Reglamento Cosmético Europeo (CE) Nº 1223/2009' : 'EU Cosmetics Regulation (EC) No 1223/2009'}
              </h3>
            </div>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(94, 234, 212, 0.3)',
            borderRadius: '99px',
            padding: '4px 12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#ccfbf1'
          }}>
            <Sparkles size={13} color="#5eead4" />
            <span>{isEs ? 'Registro CPNP Activo' : 'Active CPNP Registration'}</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.86rem', color: '#134e4a', lineHeight: 1.6, fontWeight: 500 }}>
            {isEs 
              ? 'Formulado y envasado bajo estándares europeos de buenas prácticas de fabricación cosmética (ISO 22716). Producto para el cuidado y revitalización del cuero cabelludo y tallo capilar sin principios medicamentosos de prescripción ni esteroides.'
              : 'Formulated and packaged in compliance with European Cosmetic Good Manufacturing Practices (ISO 22716). Indicated for scalp and hair shaft revitalization, free from prescription drug agents and hormonal corticosteroids.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Warning 1: External Use & Eye Contact */}
            <div style={{ background: '#ffffff', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Droplets size={16} color="#0d9488" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Uso Exclusivamente Tópico' : 'For External Topical Use Only'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Aplicar únicamente sobre piel intacta y cuero cabelludo. Evitar el contacto directo con ojos y mucosas. En caso de contacto accidental, aclarar inmediatamente con abundante agua templada.'
                  : 'Apply solely to intact scalp and hair surfaces. Avoid direct contact with eyes and mucous membranes. If accidental contact occurs, rinse thoroughly with copious warm water.'}
              </p>
            </div>

            {/* Warning 2: Patch Testing */}
            <div style={{ background: '#ffffff', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={16} color="#0d9488" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Test de Tolerancia Cutánea' : 'Dermatological Patch Testing'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Testado dermatológicamente. En pieles atópicas o con historial de alergias de contacto, se recomienda realizar un patch test en el antebrazo 24–48 h antes del primer uso. Suspender ante irritación.'
                  : 'Dermatologically evaluated. In individuals with atopic tendency or known contact allergies, an occlusive patch test on the inner forearm is advised 24–48 hours prior to initial application.'}
              </p>
            </div>

            {/* Warning 3: Storage & PAO */}
            <div style={{ background: '#ffffff', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock size={16} color="#0d9488" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Conservación & PAO (12 Meses)' : 'Storage & PAO (12 Months)'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Conservar entre 15°C y 25°C, protegido de la radiación solar directa. Periodo tras apertura recomendado (PAO): 12 meses. Mantener el envase cerrado y fuera del alcance de los niños.'
                  : 'Store between 15°C and 25°C away from direct sunlight and heat sources. Period After Opening (PAO): 12 months. Keep bottle tightly closed and out of reach of young children.'}
              </p>
            </div>

            {/* Warning 4: Clean Formulation Safeguards */}
            <div style={{ background: '#ffffff', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={16} color="#0d9488" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Garantía de Pureza & Trazabilidad' : 'Clean Formula & Batch Traceability'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Libre de parabenos agresivos, sulfatos irritantes (SLS/SLES) y colorantes sintéticos. Cada lote cuenta con trazabilidad europea directa mediante código QR en el envase.'
                  : 'Free from aggressive parabens, harsh SLS/SLES sulfates, and synthetic dyes. Every production lot provides verifiable batch tracking accessible via packaging QR code.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DIAGNOSTIC TESTS (Bloodo Capillary DBS / Biomarkers)
  // ─────────────────────────────────────────────────────────────
  if (isDiagnosticKit) {
    return (
      <section 
        id="regulatory-warnings" 
        className="pds-section-card"
        style={{
          border: '1px solid #bae6fd',
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.06)'
        }}
      >
        <div 
          className="pds-section-header" 
          style={{ 
            background: 'linear-gradient(135deg, #082f49 0%, #0369a1 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ShieldCheck size={22} color="#7dd3fc" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bae6fd', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isEs ? 'AVISO REGULATORIO DE DIAGNÓSTICO IN VITRO (CE-IVDR)' : 'IN VITRO DIAGNOSTIC REGULATORY ADVISORY (CE-IVDR)'}
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {isEs ? 'Reglamento Europeo (UE) 2017/746 sobre Productos Sanitarios para Diagnóstico In Vitro' : 'Regulation (EU) 2017/746 on In Vitro Diagnostic Medical Devices'}
              </h3>
            </div>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(125, 211, 252, 0.3)',
            borderRadius: '99px',
            padding: '4px 12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#e0f2fe'
          }}>
            <Building2 size={13} color="#7dd3fc" />
            <span>ISO 15189 LifeLab1</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.86rem', color: '#0369a1', lineHeight: 1.6, fontWeight: 500 }}>
            {isEs 
              ? 'Dispositivo de diagnóstico in vitro (IVD) con marcado CE. Los resultados analíticos cuantitativos son emitidos por laboratorios clínicos acreditados y están destinados a respaldar la evaluación clínica realizada por un profesional sanitario colegiado.'
              : 'CE-IVD marked in vitro diagnostic medical device. Quantitative analytical reports are generated by accredited clinical reference laboratories and are intended to assist registered healthcare professionals in clinical decision-making.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Warning 1: Clinical Guidance, Not Final Diagnosis */}
            <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Info size={16} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Interpretación Médica Requerida' : 'Physician Consultation Required'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Este análisis proporciona biomarcadores cuantitativos de precisión pero no sustituye el juicio médico integral, anamnesis ni exploraciones diagnósticas complementarias.'
                  : 'This assay delivers precision quantitative biomarker data but does not substitute for comprehensive physician consultation, clinical history, or specialized clinical workup.'}
              </p>
            </div>

            {/* Warning 2: DBS Collection & Asepsis */}
            <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Droplets size={16} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Muestreo Capilar Aséptico (DBS)' : 'Aseptic Capillary Sampling'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Utilizar exclusivamente la lanceta retráctil estéril monouso. Limpiar la zona con toallita alcohólica, desechar la primera gota y llenar los círculos sin tocar el papel filtro.'
                  : 'Use only single-use sterile retractable lancets. Sanitize skin, wipe away the first blood droplet, and allow successive droplets to soak Whatman 903 circles without touching the paper.'}
              </p>
            </div>

            {/* Warning 3: 3-Hour Drying Protocol */}
            <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock size={16} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Secado Obligatorio (Mínimo 3 Horas)' : 'Mandatory 3-Hour Air Drying'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'La tarjeta Whatman 903 debe secar en posición horizontal al aire libre durante un mínimo de 3 h antes de guardarla en la bolsa desecante. Muestras húmedas serán invalidadas.'
                  : 'Allow the Whatman 903 collection card to dry flat at room temperature for at least 3 hours before inserting into the foil desiccant pouch. Moist samples will be rejected.'}
              </p>
            </div>

            {/* Warning 4: Accredited Central Laboratory */}
            <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Building2 size={16} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Cadena de Custodia Acreditada' : 'Accredited Chain of Custody'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Procesamiento en LifeLab1 (Vilnius, Lituania) bajo ISO 15189 y metodología CE-IVDR. Entrega de informe seguro en 3–5 días laborables mediante portal digital encriptado.'
                  : 'Processed by LifeLab1 (Vilnius, Lithuania) under ISO 15189 accreditation and CE-IVDR certified protocols. Secure encrypted delivery within 3–5 business days.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STERILE SOLVENTS / BACTERIOSTATIC WATER
  // ─────────────────────────────────────────────────────────────
  if (isSolventProduct) {
    return (
      <section 
        id="regulatory-warnings" 
        className="pds-section-card"
        style={{
          border: '1px solid #cbd5e1',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
      >
        <div 
          className="pds-section-header" 
          style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplets size={22} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isEs ? 'SEGURIDAD DE RECONSTITUCIÓN & CONSERVACIÓN ESTÉRIL' : 'RECONSTITUTION SAFETY & STERILITY PARAMETERS'}
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {isEs ? 'Agua Bacteriostática para Inyección (BAC Water) — Farmacopea Europea' : 'Bacteriostatic Water for Injection (BAC Water) — European Pharmacopoeia'}
              </h3>
            </div>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '99px',
            padding: '4px 12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#e2e8f0'
          }}>
            <span>0.9% Benzyl Alcohol</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldAlert size={16} color="#d97706" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Conservante Alcohol Bencílico 0.9%' : '0.9% Benzyl Alcohol Preservative'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Contiene alcohol bencílico como agente bacteriostático. No apto para administración intratecal, epidural ni para uso en neonatos o lactantes.'
                  : 'Formulated with 0.9% benzyl alcohol as antimicrobial agent. Not for intrathecal, epidural, or neonatal administration.'}
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock size={16} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Límite de Uso Multidosis (28 Días)' : '28-Day Multi-Dose Limit'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Desechar el vial transcurridos 28 días desde la primera punción del tapón. Desinfectar el septo de goma con alcohol isopropílico antes de cada extracción.'
                  : 'Discard remaining contents 28 days following initial rubber septum puncture. Sanitize septum with 70% isopropyl alcohol prior to each aspiration.'}
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Thermometer size={16} color="#0d9488" />
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Condiciones de Almacenamiento' : 'Temperature Governance'}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Conservar a 15°C–25°C antes de su apertura. Tras la primera perforación, conservar en refrigeración entre 2°C y 8°C protegido de la luz.'
                  : 'Store at 15°C–25°C prior to opening. Following initial puncture, maintain refrigerated at 2°C–8°C away from direct light.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CORPORATE SERVICES (Spain / UAE Residency & Legal Setup)
  // ─────────────────────────────────────────────────────────────
  if (isCorporateService) {
    return (
      <section 
        id="regulatory-warnings" 
        className="pds-section-card"
        style={{
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
      >
        <div 
          className="pds-section-header" 
          style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={22} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isEs ? 'GOBERNANZA JURÍDICA & CUMPLIMIENTO INSTITUCIONAL' : 'INSTITUTIONAL LEGAL COMPLIANCE & GOVERNANCE'}
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {isEs ? 'Marco Legal Ley 14/2013 & Directivas Mercantiles Europeas' : 'Spanish Law 14/2013 & European Corporate Directives'}
              </h3>
            </div>
          </div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
            {isEs 
              ? 'Los servicios corporativos y de residencia son tramitados conforme a la normativa legal vigente aplicable por abogados y gestores colegiados. Atlas Health actúa como integrador tecnológico y operativo institucional, no constituyendo esta ficha asesoramiento fiscal individualizado.'
              : 'Corporate acquisition and residency programs are processed in strict compliance with current statutory frameworks by licensed legal counsels. Atlas Health functions as an institutional technology and operational platform.'}
          </p>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. THERAPEUTIC PEPTIDES / STERILE VIALS (Default)
  // ─────────────────────────────────────────────────────────────
  return (
    <section 
      id="regulatory-warnings" 
      className="pds-section-card"
      style={{
        border: '1px solid #fecaca',
        background: 'linear-gradient(180deg, #ffffff 0%, #fef2f2 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(220, 38, 38, 0.05)'
      }}
    >
      <div 
        className="pds-section-header" 
        style={{ 
          background: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <ShieldAlert size={22} color="#fca5a5" />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fecaca', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isEs ? 'GOBERNANZA CLÍNICA & MARCO DE DISPENSACIÓN MÉDICA' : 'CLINICAL GOVERNANCE & MEDICAL DISPENSING FRAMEWORK'}
            </div>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              {isEs ? 'Estándar Analítico Farmacopeico & Supervisión Médica' : 'Pharmacopeial Grade Standard & Prescriber Governance'}
            </h3>
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(254, 202, 202, 0.3)',
          borderRadius: '99px',
          padding: '4px 12px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#fee2e2'
        }}>
          <ShieldAlert size={13} color="#fca5a5" />
          <span>{isEs ? 'Revisión Facultativa Obligatoria' : 'Prescriber Review Required'}</span>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.6, fontWeight: 500 }}>
          {isEs 
            ? 'Compuesto polipeptídico de alta pureza analítica destinado a protocolos clínicos dirigidos por profesionales médicos facultativos e investigación biofarmacéutica. No destinado a automedicación.'
            : 'Biologically active polypeptide intended for physician-directed protocol implementation and clinical research. Strictly not formulated for unguided self-medication.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Warning 1: Prescriber Supervision */}
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldAlert size={16} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Prescripción & Supervisión Médica' : 'Prescription & Medical Oversight'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
              {isEs 
                ? 'La administración, ajuste de dosis y seguimiento clínico deben realizarse bajo la supervisión de un médico o especialista colegiado tras evaluación de marcadores de base.'
                : 'Administration, dosing titration, and clinical monitoring must be conducted under the direct supervision of a licensed physician following baseline lab workup.'}
            </p>
          </div>

          {/* Warning 2: Cold Chain & Asepsis */}
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Thermometer size={16} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Reconstitución Aséptica & Cadena 2–8°C' : 'Aseptic Reconstitution & 2–8°C Chain'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
              {isEs 
                ? 'Reconstituir con solvente bacteriostático estéril en condiciones higiénicas estrictas. Mantener en refrigeración constante (2°C–8°C) y consumir antes de 28–30 días.'
                : 'Reconstitute using sterile bacteriostatic solvent under strict hygienic technique. Maintain constant cold-chain refrigeration (2°C–8°C) and consume within 28–30 days.'}
            </p>
          </div>

          {/* Warning 3: Key Contraindications */}
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertTriangle size={16} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Contraindicaciones Mayores' : 'Major Contraindications'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
              {isEs 
                ? 'Contraindicado en neoplasias activas o antecedentes oncológicos dependientes de receptores, embarazo, lactancia o insuficiencia hepática/renal severa no compensada.'
                : 'Contraindicated in active malignancy, receptor-dependent oncological history, pregnancy, lactation, or severe uncompensated hepatic/renal dysfunction.'}
            </p>
          </div>

          {/* Warning 4: Batch Release Verification */}
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Beaker size={16} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Verificación Analítica de Lote' : 'Batch Release Analytical Verification'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
              {isEs 
                ? 'Pureza certificada ≥ 99.0% por RP-HPLC de doble columna y masa molecular comprobada por LC-MS con control estricto de endotoxinas (<0.25 EU/mg) por {supplierName}.'
                : 'Certified ≥ 99.0% purity via dual-column RP-HPLC with LC-MS identity confirmation and strict endotoxin control (<0.25 EU/mg) sourced through {supplierName}.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
