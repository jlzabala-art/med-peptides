import React, { useMemo, useState } from 'react';
import styles from '../../templates/Catalog.module.css';
import { trackEvent } from '../../hooks/useAnalytics';
import { resolveAndFormatPrice } from '../../utils/resolvePrice';

// Icons
import Activity from "lucide-react/dist/esm/icons/activity";
import Moon from "lucide-react/dist/esm/icons/moon";
import Zap from "lucide-react/dist/esm/icons/zap";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Brain from "lucide-react/dist/esm/icons/brain";
import Check from "lucide-react/dist/esm/icons/check";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Bot from "lucide-react/dist/esm/icons/bot";

const ICONS_MAP = {
  "Recovery & Repair": Activity,
  "Cognitive & Mood": Brain,
  "Sleep & Circadian": Moon,
  "Metabolic & Weight": Zap,
  "Longevity & Anti-Aging": Sparkles,
  "Hormonal Optimization": Droplets,
  "Immune Support": ShieldCheck,
  "Research Supplies": Beaker,
  "Other Research Peptides": FlaskConical
};

function normalizeStrength(s) {
  if (!s || typeof s !== 'string') return null;
  const low = s.toLowerCase();
  if (low.includes('vial/kit') || low.includes('kit') || s === 'Standard') return null;
  const match = s.match(/^[\s]*([0-9]+(?:\.[0-9]+)?)\s*(mg|mcg|iu|g)\b/i);
  if (match) return `${match[1]} ${match[2].toLowerCase()} / vial`;
  if (/\d/.test(s) && s.includes('/')) return s.trim();
  return null;
}

export default function ProductGridCard({
  product,
  products,
  isProfessional,
  cart,
  onAddToCart,
  onSelectProduct,
  handleOpenPubMed
}) {
  const [selectedStrengthIdx, setSelectedStrengthIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const CategoryIcon = ICONS_MAP[product.category] || FlaskConical;
  const canAddToCart = !!onAddToCart && product.category !== 'Research Supplies';

  // Build deduplicated, normalised strengths list
  const strengths = useMemo(() => {
    const rawStrengths = product.allStrengths?.length
      ? product.allStrengths
      : [product.dosage || product.strength].filter(Boolean);
    const seen = new Set();
    return rawStrengths
      .map(normalizeStrength)
      .filter(Boolean)
      .filter(label => {
        const key = label.replace(/\s+/g, '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [product.allStrengths, product.dosage, product.strength]);

  // Build variant list sorted by numeric dosage
  const productVariants = useMemo(() => {
    if (!products || product.category === 'Research Supplies') return [];
    return products
      .filter(p => p.name === product.name && p.category === product.category && p.isActive !== false)
      .sort((a, b) => {
        const na = parseFloat((a.dosage || a.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        const nb = parseFloat((b.dosage || b.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        return na - nb;
      });
  }, [products, product.name, product.category]);

  const priceLabel = useMemo(() => {
    if (!products || product.category === 'Research Supplies') return null;
    if (productVariants.length === 0) return null;
    const idx = Math.min(selectedStrengthIdx, productVariants.length - 1);
    const variant = productVariants[idx];
    const { resolved } = resolveAndFormatPrice(variant);
    if (resolved.perUnit != null) return `$${resolved.perUnit.toFixed(0)} USD`;
    return null;
  }, [productVariants, selectedStrengthIdx, products, product.category]);

  const selectedVariant = productVariants[Math.min(selectedStrengthIdx, productVariants.length - 1)] || null;
  const itemKey = selectedVariant
    ? (selectedVariant.dosage ? `${selectedVariant.name} (${selectedVariant.dosage})` : selectedVariant.name)
    : product.name;
  const currentQty = cart?.[itemKey] || 0;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!onAddToCart) return;
    const target = selectedVariant || product;
    onAddToCart(target, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);

    trackEvent('purchase_intent', {
      peptide_name: target.name,
      protocol_id: 'grid_card'
    });
  };

  const handleCardClick = () => {
    trackEvent('purchase_intent', {
      intent_type: 'view_profile',
      peptide_name: product.name
    });
    onSelectProduct(product.name || product); // Backward compat with strings or objects
  };

  return (
    <div className={styles.productCard}>
      {/* Header */}
      <div className={styles.cardHeader} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div>
          <h3 className={styles.cardTitle}>{product.displayName || product.name}</h3>
          <div className={styles.cardSubtitle}>CAS: {product.cas || 'N/A'}</div>
        </div>
        <div className={styles.cardIconBox}>
          <CategoryIcon size={20} />
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <p className={styles.cardDesc}>{product.desc}</p>

        {strengths.length > 0 && (
          <div style={{ marginTop: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className={styles.concentrationLabel}>Concentration</div>
            <div className={styles.concentrationPills}>
              {strengths.slice(0, 5).map((s, idx) => (
                <button
                  key={idx}
                  className={`${styles.cPill} ${selectedStrengthIdx === idx ? styles.active : ''}`}
                  onClick={() => setSelectedStrengthIdx(idx)}
                >
                  {s}
                </button>
              ))}
              {strengths.length > 5 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                  +{strengths.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        {priceLabel && (
          <div className={styles.priceLabel}>
            {priceLabel}
            {strengths.length > 1 && <span className={styles.priceUnit}>/ vial</span>}
          </div>
        )}

        <div className={styles.actionGrid}>
          <button 
            className={styles.btnAI}
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent('open-clinical-ai', {
                  detail: { query: `Tell me about the clinical applications of ${product.displayName || product.name}.`, autoSend: true },
                })
              );
            }}
          >
            <Bot size={14} /> ClinicAI
          </button>
          
          <button 
            className={styles.btnSecondary}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPubMed(product);
            }}
          >
            <BookOpen size={14} /> PubMed
          </button>

          {canAddToCart && (
            <button
              className={`${styles.btnCart} ${justAdded ? styles.added : ''}`}
              onClick={handleAddClick}
            >
              {justAdded ? (
                <><Check size={14} /> Added</>
              ) : (
                <><ShoppingCart size={14} /> Add to Order {currentQty > 0 ? `(${currentQty})` : ''}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
