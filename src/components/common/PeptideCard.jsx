/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState, memo } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * PeptideCard — componente compartido para TrendingPeptides y NovelAcquisitions.
 * Props:
 *   name          {string}    — nombre del péptido (también sirve para la imagen)
 *   slug          {string}    — para navegación
 *   tag           {string}    — etiqueta badge superior
 *   desc          {string}    — descripción
 *   dosage        {string}    — dosage info single string (e.g. "0.5–2 mg/week")
 *   dosageElement {ReactNode} — override: render this instead of the plain dosage string (for multi-variant pills)
 *   footerIcon    {ReactNode} — icono del footer (Zap, Sparkles, etc.)
 *   footerText    {string}    — texto junto al icono footer
 *   mobileCTA     {string}    — mobile button text (e.g. "View Details")
 *   onClick       {Function}  — click handler
 */
function PeptideCard({ name, slug, tag, desc, dosage, dosageElement, footerIcon, footerText, mobileCTA = 'View Details', onClick }) {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  // Animate on viewport entry
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const imagePath = `/assets/vials/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

  return (
    <div
      ref={cardRef}
      className={`peptide-card hvr-lift${visible ? ' peptide-card--visible' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details of ${name}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Tag badge */}
      <div className="peptide-card__tag">{tag}</div>

      {/* Vial image */}
      <img
        src={imagePath}
        alt={`Vial de ${name}`}
        className="peptide-card__img"
        loading="lazy"
        decoding="async"
        width={140}
        height={140}
        onError={(e) => { e.currentTarget.src = '/assets/vials/generic-vial.png'; }}
      />

      {/* Body */}
      <div className="peptide-card__body">
        <h3 className="peptide-card__title">{name}</h3>

        {/* dosageElement takes priority; fall back to plain dosage string */}
        {dosageElement ? (
          <div className="peptide-card__dosage">
            <span className="peptide-card__dosage-label">Dosage</span>
            {dosageElement}
          </div>
        ) : dosage ? (
          <div className="peptide-card__dosage">
            <span className="peptide-card__dosage-label">Dosage</span>
            <span className="peptide-card__dosage-value">{dosage}</span>
          </div>
        ) : null}

        <p className="peptide-card__desc">{desc}</p>

        {footerText && (
          <div className="peptide-card__footer">
            {footerIcon}
            {footerText}
          </div>
        )}
      </div>

      {/* Mobile CTA — visible only on mobile via CSS */}
      <div className="peptide-card__mobile-cta">
        {mobileCTA} <ArrowRight size={14} />
      </div>
    </div>
  );
}

export default memo(PeptideCard);
