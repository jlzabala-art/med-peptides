 
import { useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Skeleton from '../components/common/Skeleton';
import { usePageMeta } from '../hooks/usePageMeta';
import { getAnalytics, logEvent } from 'firebase/analytics';
import app from '../firebase';

/**
 * ProductTemplate
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical template for Product Detail Pages (PDP).
 * Dynamically resolves the specific product from the library via slug.
 */
export default function ProductTemplate({ 
  products, 
  region, 
  isProfessional, 
  isAdmin, 
  cart, 
  onAddToCart,
  toggleCompare,
  compareList,
  allFaqs
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Resolve active product from the global products array (Blueprints)
  const product = useMemo(() => {
    if (!products || products.length === 0) return null;
    const targetSlug = (slug || '').toLowerCase().trim();

    for (const p of products) {
      // Strategy A: Direct name-based slug match (e.g., "bpc-157")
      const nameSlug = p.name ? p.name.toLowerCase().replace(/\s+/g, '-').trim() : '';
      if (nameSlug && nameSlug === targetSlug) {
        return p;
      }

      // Strategy B: Top-level document ID match (e.g., "bpc-157-5mg-vial")
      const pId = (p.id || '').toLowerCase().trim();
      if (pId && pId === targetSlug) {
        return p;
      }

      // Strategy C: Top-level slug property match
      const pSlugProp = (p.slug || '').toLowerCase().trim();
      if (pSlugProp && pSlugProp === targetSlug) {
        return p;
      }

      // Strategy D: Variant document ID match (e.g., "bpc-157-10mg-vial")
      // Sort variants identical to the PDP sorting order to ensure matching index
      const sortedVariants = [...(p.variants || [])].sort((a, b) => {
        const numA = parseFloat((a.dosage || a.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat((b.dosage || b.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
      });

      const matchedVarIdx = sortedVariants.findIndex(v => {
        const vDocId = (v._docId || '').toLowerCase().trim();
        const vId = (v.id || '').toLowerCase().trim();
        return (vDocId && vDocId === targetSlug) || (vId && vId === targetSlug);
      });

      if (matchedVarIdx !== -1) {
        return {
          ...p,
          _preselectedVariantIndex: matchedVarIdx
        };
      }
    }
    return null;
  }, [products, slug]);

  // 2. SEO & Analytics
  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      try {
        const analytics = getAnalytics(app);
        logEvent(analytics, 'view_item', {
          items: [{
            item_id: product.id || product.name,
            item_name: product.name,
            item_category: product.category
          }]
        });
      } catch (err) {
        console.warn('Analytics error on PDP load:', err);
      }
    }
  }, [product]);

  const structuredData = useMemo(() => {
    if (!product) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description?.substring(0, 160) || `Research ${product.name} at Med-Peptides. Premium analytical materials for laboratory research.`,
      "image": product.image || product.images?.[0]?.url,
      "brand": { "@type": "Brand", "name": "Med-Peptides" },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD",
        "price": product.price || "0.00"
      }
    };
  }, [product]);

  usePageMeta({
    title:       product?.name || undefined,
    description: product?.name
      ? (product?.description?.substring(0, 160) || `Research ${product.name} at Med-Peptides. Premium analytical materials for laboratory research.`)
      : undefined,
    path:        `/product/${slug}`,
    image:       product?.image || product?.images?.[0]?.url,
    structuredData
  });

  // Loading State with Skeletons
  if (!products || products.length === 0) {
    return (
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <Skeleton width="60px" height="20px" />
          <Skeleton width="100px" height="20px" />
          <Skeleton width="150px" height="20px" />
        </div>
        <div className="grid-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="500px" borderRadius="var(--radius-xl)" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Skeleton width="80px" height="80px" borderRadius="var(--radius-md)" />
              <Skeleton width="80px" height="80px" borderRadius="var(--radius-md)" />
              <Skeleton width="80px" height="80px" borderRadius="var(--radius-md)" />
            </div>
          </div>
          <div>
            <Skeleton width="120px" height="24px" style={{ marginBottom: '1rem', borderRadius: '20px' }} />
            <Skeleton width="60%" height="48px" style={{ marginBottom: '1.5rem' }} />
            <Skeleton width="100%" height="24px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="90%" height="24px" style={{ marginBottom: '2.5rem' }} />
            
            <div style={{ marginBottom: '2.5rem' }}>
              <Skeleton width="150px" height="20px" style={{ marginBottom: '1rem' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Skeleton width="100px" height="40px" borderRadius="var(--radius-md)" />
                <Skeleton width="100px" height="40px" borderRadius="var(--radius-md)" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Skeleton width="200px" height="56px" borderRadius="var(--radius-md)" />
              <Skeleton width="56px" height="56px" borderRadius="var(--radius-md)" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="container">Product Not Found</div>;

  const breadcrumbItems = [
    { label: 'Peptides', path: '/catalog' },
    { label: product.category || 'Research', path: product.category ? `/collection/${product.category.toLowerCase().replace(/ /g, '-')}` : '/catalog' },
    { label: product.name }
  ];

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs items={breadcrumbItems} />
      
      <ProductDetail 
        product={product} 
        products={products}
        region={region}
        isProfessional={isProfessional}
        isAdmin={isAdmin}
        cart={cart}
        onAddToCart={onAddToCart}
        toggleCompare={toggleCompare}
        compareList={compareList}
        onBack={() => navigate(-1)}
        onSelectCategory={(cat) => navigate(`/collection/${cat.toLowerCase().replace(/ /g, '-')}`)}
        onSelectProduct={(name) => {
          const target = products.find(p => p.name === name);
          if (target) {
            // Analytics: Track selection
            try {
              const analytics = getAnalytics(app);
              logEvent(analytics, 'peptide_view', {
                peptide_name: target.name,
                protocol_id: location.state?.protocol_id || 'none'
              });
            } catch (err) {
              console.warn('Analytics error:', err);
            }

            const targetSlug = target.name
              ? target.name.toLowerCase().replace(/\s+/g, '-')
              : (target.slug || target.id || target.name);
            navigate(`/product/${targetSlug}`, { state: location.state });
          }
        }}
        onSelectObjective={(obj) => navigate(`/protocol/${obj.toLowerCase().replace(/ /g, '-')}`)}
        allFaqs={allFaqs}
      />
    </div>
  );
}
