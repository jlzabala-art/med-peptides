"use client";

import React, { useState } from 'react';
import StandardDrawer from '../../ui/StandardDrawer';
import { 
  Stethoscope, 
  FilePlus, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Activity, 
  Thermometer, 
  Layers, 
  Info,
  Check
} from '@/lib/icons';
import { resolveVariantPrice } from '../../../utils/resolvePrice';
import { useDrawer } from '../../../context/DrawerContext';
import notifier from '../../../services/NotificationService';
import styles from './ClinicalProductSheetDrawer.module.css';

export default function ClinicalProductSheetDrawer({
  isOpen,
  onClose,
  product,
  displayCurrency = 'USD',
}) {
  const { openDrawer } = useDrawer();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  if (!isOpen || !product) return null;

  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{
        id: product.id,
        name: product.name || 'Standard Presentation',
        strength: product.strength || product.dosage || 'Standard',
        pricing: product.pricing || null,
        unit_price: product.unit_price || product.price || 0,
      }];

  const currentVariant = variants[selectedVariantIndex] || variants[0];

  // Resolve authorized Clinic Price (Cost + Clinic Markup policy)
  const resolved = resolveVariantPrice(currentVariant, {
    tier: 'clinic',
    targetCurrency: displayCurrency,
  });

  const clinicPriceFormatted = resolved?.formatted
    ? resolved.formatted
    : (resolved?.amount != null ? `$${Number(resolved.amount).toFixed(2)}` : (product.price ? `$${Number(product.price).toFixed(2)}` : 'Inquire for Quote'));

  // Clinical indications & protocol guidelines
  const indications = product.indications || product.clinical_indications || [
    product.category ? `${product.category} therapy & cellular restoration` : 'Cellular regeneration and peptide modulation',
    'Physician-supervised clinical protocol administration',
    product.primary_goal || 'Targeted biomarker optimization and tissue recovery'
  ];

  const administrationRoute = currentVariant.route || product.route || product.administrationRoute || 'Subcutaneous (SC)';
  const recommendedDose = currentVariant.recommendedDose || product.dosage || product.strength || 'As clinically directed';
  const reconstitutionGuide = product.reconstitution || product.reconstitution_guide || 'Reconstitute with 2.0 mL bacteriostatic water. Swirl gently without shaking.';
  const storageCondition = product.storage || product.storageCondition || 'Store lyophilized powder at 2°C to 8°C. Protect from light. Once reconstituted, refrigerate and use within 28 days.';

  const handlePrescribe = () => {
    onClose();
    if (typeof openDrawer === 'function') {
      openDrawer('rx-builder', 'new', {
        initialProduct: {
          id: product.id,
          name: product.name,
          variantId: currentVariant.id,
          strength: currentVariant.strength || product.strength,
          route: administrationRoute,
          unitPrice: resolved?.amount || product.unit_price || 0,
        },
        sourceModule: 'doctor-catalog',
      });
      notifier.success(`Loaded "${product.name}" into Rx Builder`);
    }
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name || 'Clinical Product Monograph'}
      subtitle={`Formulary ID: ${product.id?.slice(0, 10)} • Approved Clinical Specification`}
      width="640px"
    >
      <div className={styles.container}>
        {/* Top Clinical Badge Banner */}
        <div className={styles.topBadgeRow}>
          <span className={styles.categoryBadge}>
            <Sparkles size={13} /> {product.category || 'Peptide Therapy'}
          </span>
          <span className={styles.gmpBadge}>
            <ShieldCheck size={13} /> GMP Compounded
          </span>
          <span className={styles.sterileBadge}>
            <CheckCircle size={13} /> Sterile Tested
          </span>
        </div>

        {/* Hero Section: Product Title & Clinic Price Card */}
        <div className={styles.heroSection}>
          <div className={styles.titleArea}>
            <h2 className={styles.productTitle}>{product.name}</h2>
            {product.synonyms && (
              <p className={styles.synonymsText}>Also known as: {product.synonyms}</p>
            )}
            <div className={styles.molecularSpecs}>
              {product.cas && <span>CAS: {product.cas}</span>}
              {product.molecular_weight && <span>MW: {product.molecular_weight} g/mol</span>}
              {product.purity && <span>Purity: &ge;{product.purity}%</span>}
            </div>
          </div>

          {/* Clean Doctor Clinic Price Box */}
          <div className={styles.clinicPriceCard}>
            <div className={styles.priceLabelRow}>
              <span className={styles.priceLabel}>Clinic Price</span>
              <span className={styles.authorizedTag}>Doctor Tier</span>
            </div>
            <div className={styles.priceAmount}>
              {clinicPriceFormatted}
            </div>
            <div className={styles.priceNote}>
              Per vial / package • Direct Physician Price
            </div>
            <button
              onClick={handlePrescribe}
              className={styles.prescribeButton}
            >
              <FilePlus size={15} /> Prescribe in Rx Builder
            </button>
          </div>
        </div>

        {/* Variant Presentation Selector (if multiple exist) */}
        {variants.length > 1 && (
          <div className={styles.variantSelectorSection}>
            <label className={styles.sectionLabel}>
              <Layers size={14} /> Available Strengths & Presentations:
            </label>
            <div className={styles.variantPills}>
              {variants.map((v, idx) => (
                <button
                  key={v.id || idx}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`${styles.variantPill} ${idx === selectedVariantIndex ? styles.variantPillActive : ''}`}
                >
                  <span className={styles.pillStrength}>{v.strength || v.dosage || `Option ${idx + 1}`}</span>
                  {v.name && <span className={styles.pillName}>{v.name}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Indications */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <Stethoscope size={16} color="#0d9488" />
            <h3 className={styles.cardTitle}>Clinical Indications & Targeted Use</h3>
          </div>
          <ul className={styles.indicationsList}>
            {Array.isArray(indications) ? indications.map((ind, i) => (
              <li key={i} className={styles.indicationItem}>
                <Check size={14} className={styles.indicationCheck} />
                <span>{ind}</span>
              </li>
            )) : (
              <li className={styles.indicationItem}>
                <Check size={14} className={styles.indicationCheck} />
                <span>{indications}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Protocol & Administration Details */}
        <div className={styles.gridTwoCols}>
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Activity size={15} color="#0284c7" />
              <h4 className={styles.miniCardTitle}>Route of Administration</h4>
            </div>
            <p className={styles.infoValue}>{administrationRoute}</p>
            <span className={styles.infoSubtext}>Typical regimen: {recommendedDose}</span>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Clock size={15} color="#0d9488" />
              <h4 className={styles.miniCardTitle}>Cycle Duration</h4>
            </div>
            <p className={styles.infoValue}>{product.duration || '4 - 12 Weeks'}</p>
            <span className={styles.infoSubtext}>According to protocol titration</span>
          </div>
        </div>

        {/* Reconstitution & Preparation Guide */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <Info size={16} color="#475569" />
            <h3 className={styles.cardTitle}>Reconstitution & Preparation</h3>
          </div>
          <div className={styles.guidelineBox}>
            <p className={styles.guidelineText}>{reconstitutionGuide}</p>
          </div>
        </div>

        {/* Cold Chain & Storage Guidelines */}
        <div className={styles.storageCard}>
          <div className={styles.storageIconWrapper}>
            <Thermometer size={18} color="#0369a1" />
          </div>
          <div className={styles.storageContent}>
            <h4 className={styles.storageTitle}>Storage & Cold Chain Protocol</h4>
            <p className={styles.storageText}>{storageCondition}</p>
          </div>
        </div>

        {/* Prescribe Action Bar at bottom */}
        <div className={styles.bottomBar}>
          <div>
            <span className={styles.bottomPriceLabel}>Authorized Price:</span>
            <span className={styles.bottomPriceVal}>{clinicPriceFormatted}</span>
          </div>
          <button
            onClick={handlePrescribe}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            <FilePlus size={16} /> Prescribe Now
          </button>
        </div>
      </div>
    </StandardDrawer>
  );
}
