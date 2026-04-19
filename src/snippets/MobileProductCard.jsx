import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { HelpCircle, BookOpen, ChevronRight, Activity, Beaker, Zap, Sparkles, ShoppingCart, Check } from 'lucide-react';
import { getFAQForProduct } from '../utils/discoveryEngine';
import FAQModal from '../components/discovery/FAQModal';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';

const CATEGORY_ICONS = {
  'Healing': Activity,
  'Weight': Zap,
  'Anti-Aging': Sparkles,
  'Cognitive': Beaker,
  'Muscle': Zap,
  'Hormonal': Sparkles,
  'Research': Beaker,
  'Other': Beaker,
};

function getCategoryIcon(category) {
  const key = Object.keys(CATEGORY_ICONS).find(k => category?.includes(k));
  return CATEGORY_ICONS[key] || Beaker;
}

/* Touch-feedback style injected once per card */
const TOUCH_STYLE = `
  .mpc-btn { transition: transform 0.1s ease, opacity 0.1s ease; }
  .mpc-btn:active { transform: scale(0.96); opacity: 0.85; }
`;

// Normalise a raw strength string → clean "X unit / vial" label, or null to discard
function normalizeStrength(s) {
  if (!s || typeof s !== 'string') return null;
  const low = s.toLowerCase();
  if (low.includes('vial/kit') || low.includes('kit') || s === 'Standard') return null;
  const match = s.match(/^[\s]*([0-9]+(?:\.[0-9]+)?)\s*(mg|mcg|iu|g)\b/i);
  if (match) return `${match[1]} ${match[2].toLowerCase()} / vial`;
  if (/\d/.test(s) && s.includes('/')) return s.trim();
  return null;
}

const MobileProductCard = React.memo(function MobileProductCard({
  product,
  onSelectProduct,
  isProfessional,
  products,
  allFaqs,
  allMappings,
  cart,
  onAddToCart,
}) {
  const [activeFAQProduct, setActiveFAQProduct] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [activePubMedProduct, setActivePubMedProduct] = useState(null);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [iconLoaded, setIconLoaded] = useState(false);
  // Strength selector state
  const [selectedStrengthIdx, setSelectedStrengthIdx] = useState(0);
  // Added-to-cart flash
  const [justAdded, setJustAdded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => { setIconLoaded(true); }, []);

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

  // Build variant list sorted by numeric dosage (mirrors ProductDetail logic)
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

  // Price for the currently selected strength
  const priceLabel = useMemo(() => {
    if (!products || product.category === 'Research Supplies') return null;
    if (productVariants.length === 0) return null;
    const idx = Math.min(selectedStrengthIdx, productVariants.length - 1);
    const variant = productVariants[idx];
    const price = parseFloat(variant?.perVialPriceUSD || variant?.proVialPrice || variant?.guestVialPrice);
    if (!isNaN(price) && price > 0) return `$${price.toFixed(0)} USD`;
    return null;
  }, [productVariants, selectedStrengthIdx, products, product.category]);

  // Cart quantity for selected variant
  const selectedVariant = productVariants[Math.min(selectedStrengthIdx, productVariants.length - 1)] || null;
  const itemKey = selectedVariant
    ? (selectedVariant.dosage ? `${selectedVariant.name} (${selectedVariant.dosage})` : selectedVariant.name)
    : product.name;
  const currentQty = cart?.[itemKey] || 0;

  const handleOpenFAQ = useCallback(async (p) => {
    setActiveFAQProduct(p);
    const faqs = getFAQForProduct(p.name, allFaqs || [], allMappings || [], isProfessional);
    setFaqItems(faqs);
    setShowFAQModal(true);
  }, [allFaqs, allMappings, isProfessional]);

  const handleOpenPubMed = useCallback((p) => {
    setActivePubMedProduct(p);
    setShowPubMedPanel(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!onAddToCart) return;
    onAddToCart(selectedVariant || product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }, [onAddToCart, selectedVariant, product]);

  // Navigate to full product detail
  const handleViewDetails = useCallback(() => {
    onSelectProduct(product.name);
  }, [onSelectProduct, product.name]);

  const CategoryIcon = getCategoryIcon(product.category);
  const canAddToCart = !!onAddToCart && product.category !== 'Research Supplies';

  return (
    <div ref={cardRef} style={{
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{TOUCH_STYLE}</style>
      <div style={{ padding: '1rem' }}>

        {/* Header: name + icon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '0.5rem',
          alignItems: 'flex-start',
          marginBottom: '0.75rem'
        }}>
          <div onClick={handleViewDetails} style={{ cursor: 'pointer', minWidth: 0 }}>
            <h3 style={{
              fontWeight: 800,
              color: 'var(--primary)',
              fontSize: '1rem',
              margin: 0,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {product.displayName || product.name}
            </h3>
            {product.scientificName && (
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginTop: '0.1rem',
                opacity: 0.7,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {product.scientificName}
              </div>
            )}
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              CAS: {product.cas || 'N/A'}
            </div>
          </div>

          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0,163,224,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0,
          }}>
            {iconLoaded && <CategoryIcon size={18} />}
          </div>
        </div>

        {/* Description — 2 lines max */}
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          margin: '0 0 0.75rem 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.desc}
        </p>

        {/* Strength selector pills — interactive, updates price */}
        {strengths.length > 0 && (
          <div style={{ marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Concentration
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {strengths.slice(0, 5).map((s, idx) => (
                <button
                  key={idx}
                  className="mpc-btn"
                  onClick={() => setSelectedStrengthIdx(idx)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    backgroundColor: selectedStrengthIdx === idx ? 'var(--primary)' : '#f1f5f9',
                    color: selectedStrengthIdx === idx ? 'white' : 'var(--text-main)',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    border: selectedStrengthIdx === idx ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
              {strengths.length > 5 && (
                <span style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  +{strengths.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price for selected strength */}
        {priceLabel && (
          <div style={{
            marginBottom: '0.75rem',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {priceLabel}
            {strengths.length > 1 && (
              <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.15rem' }}>
                / vial
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            className="mpc-btn"
            onClick={() => handleOpenFAQ(product)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.4rem', padding: '0.6rem 0.5rem', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'white',
              color: 'var(--text-main)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
            }}
          >
            <HelpCircle size={14} /> FAQ
          </button>
          <button
            className="mpc-btn"
            onClick={() => handleOpenPubMed(product)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.4rem', padding: '0.6rem 0.5rem', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'white',
              color: 'var(--text-main)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
            }}
          >
            <BookOpen size={14} /> PubMed
          </button>

          {/* Add to cart — "Añadir al encargo" */}
          {canAddToCart && (
            <button
              className="mpc-btn"
              onClick={handleAddToCart}
              style={{
                gridColumn: 'span 2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.4rem', padding: '0.65rem', borderRadius: '8px',
                border: 'none',
                background: justAdded ? '#10b981' : 'rgba(0,163,224,0.12)',
                color: justAdded ? 'white' : 'var(--primary)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              {justAdded
                ? <><Check size={15} /> Added to Order</>
                : <><ShoppingCart size={15} /> Add to Order{currentQty > 0 ? ` (${currentQty})` : ''}</>
              }
            </button>
          )}

          {/* View full profile */}
          <button
            className="mpc-btn"
            onClick={handleViewDetails}
            style={{
              gridColumn: 'span 2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.4rem', padding: '0.7rem', borderRadius: '8px',
              border: 'none', background: 'var(--primary)', color: 'white',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
            }}
          >
            View Full Profile <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <FAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        faqItems={faqItems}
        product={activeFAQProduct}
        relatedProducts={products}
        onProductClick={(p) => onSelectProduct(p.name)}
      />

      <PubMedPreviewPanel
        isOpen={showPubMedPanel}
        onClose={() => setShowPubMedPanel(false)}
        product={activePubMedProduct}
      />
    </div>
  );
});

export default MobileProductCard;
