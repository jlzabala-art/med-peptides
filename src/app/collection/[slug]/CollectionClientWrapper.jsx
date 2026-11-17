"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CollectionTemplate from '../../../templates/CollectionTemplate';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopProvider';
import { useCart } from '../../../context/CartProvider';
import { useUIStore } from '../../../stores/uiStore';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

const BLOCK1_CATALOG_ITEMS = [
  { slug: 'peptides', label: 'Peptides', href: '/collection/peptides' },
  { slug: 'proto', label: 'Protocols', href: '/proto' },
  { slug: 'fillers', label: 'Fillers', href: '/collection/fillers' },
  { slug: '24genomics', label: '24Genomics', href: '/collection/24genomics' },
  { slug: 'colway', label: 'Colway', href: '/collection/colway' },
  { slug: 'bloodo', label: 'Bloodo', href: '/collection/bloodo' },
  { slug: 'hormones', label: 'Hormones (Pharmapolis)', href: '/collection/hormones' },
  { slug: 'hair-treatments', label: 'Hair Treatments', href: '/collection/hair-treatments' },
  { slug: 'teletest', label: 'TeleTest', href: '/collection/teletest' },
  { slug: 'eterna', label: 'ETERNA', href: '/collection/eterna' },
];

export default function CollectionClientWrapper({ serverParams, referralRef = null, initialProducts, serverCategoryCounts = null }) {
  const params = useParams();
  const slug = serverParams?.slug || params?.slug;

  const { isProfessional, isAdmin } = useAuth();
  const { region, setRegion, setCompareList } = useShop();
  const { cart, updateCart } = useCart();
  const { activeModal, setActiveModal } = useUIStore();
  
  // Persist referral in localStorage for seamless attribution
  useEffect(() => {
    if (referralRef && typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_wholesaler_ref', referralRef);
      } catch {
        // Safe fallback
      }
    }
  }, [referralRef]);

  // Products from server
  const [products] = useState(initialProducts || []);

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id || p.name === product.name);
      if (exists) return prev.filter(p => p.id !== product.id && p.name !== product.name);
      if (prev.length >= 3) {
        toast("You can only compare up to 3 products at a time.");
        return prev;
      }
      return [...prev, product];
    });
    setActiveModal('compare');
  };

  return (
    <>
      {isAdmin && (
        <div
          className="no-print"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #dadce0',
            padding: '0 16px',
          }}
        >
          <div
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              minHeight: '38px',
              overflowX: 'auto',
              padding: '4px 0',
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginRight: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              Block 1 · Catalogs:
            </span>
            {BLOCK1_CATALOG_ITEMS.map((item) => {
              const isActive = String(slug || '').toLowerCase() === item.slug;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#1967d2' : '#5f6368',
                    background: isActive ? '#e8f0fe' : 'transparent',
                    border: isActive ? '1px solid #d2e3fc' : '1px solid transparent',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <CollectionTemplate 
        slug={slug}
        region={region}
        isProfessional={isProfessional}
        isAdmin={isAdmin}
        cart={cart}
        updateCart={updateCart}
        setRegion={setRegion}
        toggleCompare={toggleCompare}
        isCartOpen={activeModal === 'cart'}
        setIsCartOpen={(val) => setActiveModal(val ? 'cart' : null)}
        setPendingQuote={null}
        onOpenSearch={() => setActiveModal('search')}
        products={products}
        serverCategoryCounts={serverCategoryCounts}
        EXCHANGE_RATES={{}} 
      />
    </>
  );
}
