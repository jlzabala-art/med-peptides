"use client";

 
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useProductBySlug } from '../hooks/data/useProductBySlug';
import { useParams, useRouter, usePathname } from 'next/navigation';
import ProductDetail from './ProductDetail';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Skeleton from '../components/common/Skeleton';
import { usePageMeta } from '../hooks/usePageMeta';
import { useRoleAccess } from '../hooks/useRoleAccess';
import app from '../firebase';

/**
 * ProductTemplate
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical template for Product Detail Pages (PDP).
 * Dynamically resolves the specific product from the library via slug.
 */
export default function ProductTemplate({ 
  products, 
  initialProduct,
  processedHierarchy,
  region, 
  isProfessional, 
  cart, 
  onAddToCart,
  toggleCompare,
  compareList,
  allFaqs,
  slug: propSlug
}) {
  const params = useParams();
  // If propSlug is provided (Next.js server component passes it), use it.
  // Otherwise, use params.slug from Next.js client hook.
  const slug = propSlug || params?.slug; 
  const router = useRouter();
  const pathname = usePathname();

  const [activeProduct, setActiveProduct] = useState(initialProduct || null);
  const { is } = useRoleAccess();
  const isAdmin = is('admin');

  const { product: fetchedProduct, isLoading: productLoadingFetch, error } = useProductBySlug(slug, {
    initialData: initialProduct,
    enabled: !initialProduct,
  });
  
  const product = initialProduct || fetchedProduct;
  const productLoading = !initialProduct && productLoadingFetch;

  // 2. SEO & Analytics
  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      if (typeof window !== 'undefined') {
        import('firebase/analytics').then(({ getAnalytics, logEvent, isSupported }) => {
          isSupported().then((supported) => {
            if (supported && app) {
              try {
                const analytics = getAnalytics(app);
                logEvent(analytics, 'view_item', {
                  items: [{
                    item_id: product.id || product.name,
                    item_name: product.name,
                    item_category: product.category
                  }]
                });
              } catch (e) {
                console.warn('[Analytics] Log event failed:', e);
              }
            }
          }).catch(() => {});
        }).catch(() => {});
      }
    }
  }, [product]);

  const structuredData = useMemo(() => {
    if (!product) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description?.substring(0, 160) || `Research ${product.name} at Atlas Health. Premium analytical materials for laboratory research.`,
      "image": product.image || product.images?.[0]?.url,
      "brand": { "@type": "Brand", "name": "Atlas Health" },
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
      ? (product?.description?.substring(0, 160) || `Research ${product.name} at Atlas Health. Premium analytical materials for laboratory research.`)
      : undefined,
    path:        `/product/${slug}`,
    image:       product?.image || product?.images?.[0]?.url,
    structuredData
  });

  // Loading State with Skeletons
  if (productLoading) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <Breadcrumbs items={breadcrumbItems} />

        {/* 🔬 Mode Switcher: Overview ⟷ Technical Datasheet */}
        {slug && (
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f8fafc', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '2px' }}>
            <span style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', background: '#ffffff', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
              🛍️ Overview
            </span>
            <Link
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', color: '#0284c7', textDecoration: 'none', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              🔬 Technical Datasheet (HPLC) ↗
            </Link>
          </div>
        )}
      </div>
      
      <ProductDetail 
        product={product} 
        products={products}
        region={region}
        isProfessional={isProfessional}
        cart={cart}
        onAddToCart={onAddToCart}
        toggleCompare={toggleCompare}
        compareList={compareList}
        allFaqs={allFaqs}
        processedHierarchy={processedHierarchy}
        onBack={() => router.back()}
        onSelectCategory={(cat) => router.push(`/collection/${cat.toLowerCase().replace(/ /g, '-')}`)}
        onSelectProduct={(name) => {
          const target = products?.find(p => p.name === name);
          if (target) {
            const targetSlug = target.name
              ? target.name.toLowerCase().replace(/\s+/g, '-')
              : (target.slug || target.id || target.name);
            router.push(`/product/${targetSlug}`);
          }
        }}
        onSelectObjective={(obj) => router.push(`/protocol/${obj.toLowerCase().replace(/ /g, '-')}`)}
        allFaqs={allFaqs}
      />
    </div>
  );
}
