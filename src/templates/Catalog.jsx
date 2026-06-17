import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { trackEvent } from '../hooks/useAnalytics';
import { configService } from '../services/configService';
import { productCategories as _fallbackCategories } from '../data/productConstants';
import { usePageMeta } from '../hooks/usePageMeta';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useHeaderContext } from '../context/HeaderContext';

// New Architecture Components
import styles from './Catalog.module.css';
import CatalogSidebar from '../components/catalog/CatalogSidebar';
import ProductGridCard from '../components/catalog/ProductGridCard';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import FAQModal from '../components/discovery/FAQModal';
import SymptomMatchmakerWidget from '../components/public/SymptomMatchmakerWidget';
import { getFAQForProduct } from '../utils/discoveryEngine';

const Catalog = React.memo(function Catalog({ 
  region, setRegion, 
  isProfessional, 
  cart, setCart, updateCart,
  isCartOpen, setIsCartOpen,
  setPendingQuote,
  onSelectCategory,
  onSelectProduct,
  onOpenSearch,
  initialCategory,
  EXCHANGE_RATES,
  products,
}) {
  const { setHeader, clearHeader } = useHeaderContext();

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
            "item": "https://Atlas Health-app-27a3a.web.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Research Catalog",
            "item": "https://Atlas Health-app-27a3a.web.app/catalog"
          }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Research Peptide Catalog",
        "description": "Comprehensive catalog of high-purity research peptides for scientific investigation.",
        "itemListElement": (products || []).slice(0, 50).map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `https://Atlas Health-app-27a3a.web.app/product/${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}`
        }))
      }
    ]
  }), [products]);

  usePageMeta({
    title: 'High-Purity Research Peptide Catalog | Atlas Health',
    description: 'Explore our complete catalog of research-grade peptides organized by research pathway — verified purity, multiple formats, and global shipping.',
    canonicalUrl: 'https://Atlas Health-app-27a3a.web.app/catalog',
    structuredData
  });

  const [activeCategory, setActiveCategory] = useState(initialCategory || null);
  const [productCategories, setProductCategories] = useState(_fallbackCategories);

  // Load product categories from Firestore
  useEffect(() => {
    configService.getProductCategories()
      .then(cats => { if (cats?.length) setProductCategories(cats); })
      .catch(() => {});
  }, []);

  // Modals state
  const [activeFAQProduct, setActiveFAQProduct] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const handleBulkAddToCart = useCallback((stack) => {
    stack.forEach(item => {
      const p = products.find(prod => prod.name.includes('BPC') || prod.name.includes('CJC'));
      if(p) updateCart(p, 'add');
    });
  }, [products, updateCart]);

  const [activePubMedProduct, setActivePubMedProduct] = useState(null);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const groupedProducts = useMemo(() => {
    const groups = {};
    products.forEach(p => {
      const cat = p.category;
      if (!groups[cat]) groups[cat] = {};

      const familyName = p.displayName || p.name;
      if (!groups[cat][familyName]) {
        const rawStrengths = p.variants?.length
          ? p.variants.map(v => v.strength || v.dosage).filter(Boolean)
          : [p.strength || p.dosage].filter(Boolean);

        groups[cat][familyName] = {
          ...p,
          allStrengths: [...new Set(rawStrengths)],
        };
      }
    });

    const result = {};
    Object.keys(groups).forEach(cat => {
      result[cat] = Object.values(groups[cat]);
    });
    return result;
  }, [products]);

  const handleOpenFAQ = useCallback(async (product) => {
    setActiveFAQProduct(product);
    setFaqItems([]);
    setShowFAQModal(true);
    try {
      const resolved = getFAQForProduct(product.name|| [], product.id, isProfessional, 8);
      setFaqItems(resolved);
    } catch (err) {
      console.error('FAQ fetch error:', err);
    }
  }, [ isProfessional]);

  const handleOpenPubMed = useCallback((product) => {
    setActivePubMedProduct(product);
    setShowPubMedPanel(true);
  }, []);

  const breadcrumbItems = useMemo(() => [
    { label: 'Catalog' }
  ], []);

  // Determine what products to show
  const productsToDisplay = useMemo(() => {
    if (activeCategory) {
      return groupedProducts[activeCategory] || [];
    }
    // If no category selected, show all (or grouped by category)
    // For simplicity in the new layout, we flat map all grouped products
    const all = [];
    productCategories.forEach(cat => {
      const prods = groupedProducts[cat] || [];
      if (prods.length > 0) {
        all.push(...prods);
      }
    });
    return all;
  }, [activeCategory, groupedProducts, productCategories]);

  return (
    <section id="products" className="section section-light template-root" style={{ paddingTop: 'clamp(2rem, 5vw, 4rem)' }}>
      <div className="container" style={{ position: 'relative' }}>
        <div style={{ 
           filter: !region ? 'blur(12px) grayscale(50%)' : 'none', 
           opacity: !region ? 0.4 : 1, 
           pointerEvents: !region ? 'none' : 'auto', 
           transition: 'all 0.6s ease'
        }}>

          <Breadcrumbs items={breadcrumbItems} />

          <div className={styles.catalogHeader}>
            <h1 className={styles.catalogTitle}>Research Catalog</h1>
            <p className={styles.catalogSubtitle}>
              Explore our complete inventory of high-purity research reagents, organized by scientific pathway. 
              Utilize the sidebar to filter by focus area.
            </p>
          </div>

          {/* New Desktop Layout: Sidebar + Grid */}
          <div className={styles.catalogContainer}>
            <div className={styles.layoutWrapper}>
              
              <CatalogSidebar 
                categories={productCategories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                groupedProducts={groupedProducts}
                isProfessional={isProfessional}
              />

              <div className={styles.productGrid}>
                {productsToDisplay.map((p, pIdx) => (
                  <ProductGridCard 
                    key={`${p.name}-${pIdx}`}
                    product={p}
                    products={products}
                    isProfessional={isProfessional}
                    cart={cart}
                    onAddToCart={updateCart}
                    onSelectProduct={onSelectProduct}
                    handleOpenPubMed={handleOpenPubMed}
                  />
                ))}
                {productsToDisplay.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                    No products found in this category.
                  </div>
                )}
              </div>

            </div>
          </div>

          <PubMedPreviewPanel 
            isOpen={showPubMedPanel}
            onClose={() => setShowPubMedPanel(false)}
            product={activePubMedProduct}
          />
          
          <SymptomMatchmakerWidget onAddToCart={handleBulkAddToCart} />

          <FAQModal
            isOpen={showFAQModal}
            onClose={() => setShowFAQModal(false)}
            faqItems={faqItems}
            product={activeFAQProduct}
            relatedProducts={products}
            onProductClick={(p) => onSelectProduct(p.name)}
          />

        </div>
      </div>
    </section>
  );
});

export default Catalog;
