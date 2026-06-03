 
import React, { useEffect } from 'react';

/**
 * SEOManager handles dynamic injection of JSON-LD structured data
 * and meta description updates per product/view.
 */
const SEOManager = ({ 
  selectedProduct, 
  selectedCategory, 
  showCatalog,
  selectedObjective,
  faqs,
  breadcrumbs: customBreadcrumbs
}) => {
  useEffect(() => {
    // 1. Manage Meta Description
    let description = "Atlas Health offers premium research peptides and advanced clinical protocols for institutional and laboratory research.";
    let title = "Atlas Health | Premium Research Peptides & Clinical Protocols";
    let image = `${window.location.origin}/og-image.png`; // Fallback image
    let url = window.location.href;
    let type = "website";
    
    // Dynamic breadcrumbs detection based on current path and provided state
    let breadcrumbList = customBreadcrumbs || [];
    if (breadcrumbList.length === 0) {
      breadcrumbList.push({ name: 'Home', item: window.location.origin });
      
      const path = window.location.pathname;
      
      if (selectedProduct || path.startsWith('/product/')) {
        breadcrumbList.push({ name: 'Catalog', item: `${window.location.origin}/catalog` });
        if (selectedProduct?.category) {
          breadcrumbList.push({ name: selectedProduct.category, item: `${window.location.origin}/collection/${selectedProduct.category.toLowerCase().replace(/ /g, '-')}` });
        }
        const productName = selectedProduct?.name || path.split('/').pop().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        breadcrumbList.push({ name: productName, item: url });
      } else if (selectedCategory || path.startsWith('/collection/')) {
        breadcrumbList.push({ name: 'Catalog', item: `${window.location.origin}/catalog` });
        const catName = selectedCategory || path.split('/').pop().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        breadcrumbList.push({ name: catName, item: url });
      } else if (selectedObjective || path.startsWith('/protocol/')) {
        breadcrumbList.push({ name: 'Protocols', item: `${window.location.origin}/protocol-finder` });
        const objName = selectedObjective || path.split('/').pop().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        breadcrumbList.push({ name: objName, item: url });
      } else if (path === '/faq') {
        breadcrumbList.push({ name: 'FAQ', item: url });
      } else if (path === '/catalog') {
        breadcrumbList.push({ name: 'Catalog', item: url });
      } else if (path === '/contact') {
        breadcrumbList.push({ name: 'Contact', item: url });
      } else if (path === '/about') {
        breadcrumbList.push({ name: 'About Us', item: url });
      } else if (path === '/quality') {
        breadcrumbList.push({ name: 'Quality Control', item: url });
      }
    }

    if (selectedProduct) {
      title = `${selectedProduct.name} | High-Purity Research Peptide | Atlas Health`;
      description = `High-purity ${selectedProduct.name} research peptide. Analysis: ${selectedProduct.purity || '99%+'}. Molecular weight: ${selectedProduct.molecular_weight || 'N/A'}. Available for institutional research at Atlas Health.`;
      image = selectedProduct.image_url || image;
      type = "product";
    } else if (selectedCategory) {
      title = `${selectedCategory} Peptides | Institutional Research Collection | Atlas Health`;
      description = `Explore our ${selectedCategory} research peptide collection. Institutional-grade compounds for advanced laboratory studies.`;
    } else if (selectedObjective) {
      title = `${selectedObjective} Protocols | Advanced Research BLUEPRINTS | Atlas Health`;
      description = `Research protocols and pathways for ${selectedObjective}. Advanced clinical blueprints for institutional investigation.`;
    }

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update Page Title
    document.title = title;

    // Helper to manage OpenGraph/Twitter tags
    const updateMetaTag = (name, content, attr = 'property') => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. OpenGraph Tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'Atlas Health');

    // 3. Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image, 'name');

    // 4. Manage JSON-LD (Schema.org)
    const clearScripts = () => {
      const scripts = document.querySelectorAll('script[data-schema]');
      scripts.forEach(s => s.remove());
    };
    clearScripts();

    const addSchema = (data, id) => {
      const script = document.createElement('script');
      script.setAttribute('data-schema', id);
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // Organization Schema
    addSchema({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Atlas Health",
      "url": window.location.origin,
      "logo": `${window.location.origin}/atlas-health-logo.png`,
      "description": "Premium Research Peptides & Clinical Protocols",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "business@atlas-health.com",
        "contactType": "customer service"
      }
    }, 'org');

    // Product Schema
    if (selectedProduct) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": selectedProduct.name,
        "description": selectedProduct.description || description,
        "image": selectedProduct.image_url,
        "brand": { "@type": "Brand", "name": "Atlas Health" },
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "priceCurrency": "USD",
          "price": selectedProduct.price || "0.00"
        }
      }, 'product');
    }

    // FAQ Schema
    if (faqs && faqs.length > 0) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }, 'faq');
    }

    // Breadcrumb Schema
    if (breadcrumbList.length > 1) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbList.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.item
        }))
      }, 'breadcrumbs');
    }

  }, [selectedProduct, selectedCategory, showCatalog, selectedObjective, faqs, customBreadcrumbs]);

  return null;
};

export default SEOManager;
