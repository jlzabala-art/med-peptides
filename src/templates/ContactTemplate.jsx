 
import React, { memo, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Contact from './Contact';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * ContactTemplate - Antigravity Version
 * Refactored for high performance and mobile UX.
 * - Memoized to prevent re-renders from global state.
 * - Automatic scroll management on mount.
 * - Secure navigation with fallback.
 */
const ContactTemplate = memo(({
  cart,
  region,
  isProfessional,
  products,
  pendingQuote,
  setPendingQuote
}) => {
  const navigate = useNavigate();

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
            "name": "Contact Us",
            "item": "https://Atlas Health-app-27a3a.web.app/contact"
          }
        ]
      },
      {
        "@type": "ContactPage",
        "name": "Contact Atlas Health",
        "description": "Contact our team for research support, institutional inquiries, and order assistance.",
        "url": "https://Atlas Health-app-27a3a.web.app/contact"
      }
    ]
  }), []);

  usePageMeta({
    title: 'Contact Us | Research Support & Inquiries | Atlas Health',
    description: 'Get in touch with Atlas Health for technical support, institutional inquiries, or order assistance regarding our research-grade peptides.',
    canonicalUrl: 'https://Atlas Health-app-27a3a.web.app/contact',
    structuredData
  });

  // PHASE 1: Mobile UX - Ensure initial reading position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // PHASE 2: Secure Navigation
  // Prevents the user from getting trapped if there is no previous history on mobile
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog'); // Safe fallback to catalog
    }
  }, [navigate]);

  return (
    <Contact
      onBack={handleBack}
      cart={cart}
      region={region}
      isProfessional={isProfessional}
      products={products}
      pendingQuote={pendingQuote}
      setPendingQuote={setPendingQuote}
    />
  );
});

// Assign display name for debugging (React.memo best practices)
ContactTemplate.displayName = 'ContactTemplate';

export default ContactTemplate;
