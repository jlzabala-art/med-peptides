"use client";

import React, { useEffect, useState } from 'react';
import CollectionTemplate from '../../../templates/CollectionTemplate';
import CatalogPricingBridgeBar from '@/components/shared/CatalogPricingBridgeBar';
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
      <CatalogPricingBridgeBar activeMode="catalog" slug={slug} />
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
