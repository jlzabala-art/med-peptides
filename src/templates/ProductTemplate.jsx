import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetail from './ProductDetail';

/**
 * ProductTemplate serves as the route-level data provider for the Product Detail Page.
 * URL Pattern: /product/:slug
 */
export default function ProductTemplate({ region, isProfessional, isAdmin, cart, onAddToCart, products, allFaqs, allMappings }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);

  // Scroll to top only when the URL slug changes (user navigated to a new product)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  // Resolve the product from the catalog whenever slug or products list changes.
  // NOTE: Do NOT call scrollTo here — products updates from Firestore live-subscription
  // would fire this repeatedly while the user is reading the page.
  useEffect(() => {
    if (!slug || !products || products.length === 0) return;
    
    // Find product by slug or by normalized name
    // Robust Search: match by slug, id, name, or normalized ID (to handle - vs _)
    const searchSlug = slug.toLowerCase();
    const foundProduct = products.find(p => 
      p.slug === slug || 
      p.id === slug ||
      p.id?.toLowerCase() === searchSlug ||
      p.id?.toLowerCase().replace(/_/g, '-') === searchSlug.replace(/_/g, '-') ||
      (p.name && p.name.toLowerCase().replace(/\s+/g, '-') === searchSlug) ||
      (p.name && p.name.toLowerCase().includes(searchSlug.replace(/-/g, ' '))) ||
      (searchSlug.includes(p.name?.toLowerCase().replace(/\s+/g, '-')))
    );

    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      console.warn(`Product not found for slug: ${slug}`);
    }
  }, [slug, products]);

  if (!products || products.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!product) return <div>Product Not Found</div>;

  return (
    <ProductDetail 
      product={product} 
      products={products}
      region={region}
      isProfessional={isProfessional}
      isAdmin={isAdmin}
      cart={cart}
      onAddToCart={onAddToCart}
      onBack={() => navigate(-1)}
      onSelectCategory={(cat) => navigate(`/collection/${cat.toLowerCase().replace(/ /g, '-')}`)}
      onSelectProduct={(name) => {
        const target = products.find(p => p.name === name);
        if (target?.slug) navigate(`/product/${target.slug}`);
        else if (target?.name) {
          const targetSlug = target.name.toLowerCase().replace(/\s+/g, '-');
          navigate(`/product/${targetSlug}`);
        }
      }}
      onSelectObjective={(obj) => navigate(`/protocol/${obj.toLowerCase().replace(/ /g, '-')}`)}
      allFaqs={allFaqs}
      allMappings={allMappings}
    />
  );
}
