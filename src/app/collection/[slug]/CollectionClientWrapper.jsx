"use client";

import React, { useEffect, useState } from 'react';
import CollectionTemplate from '../../../templates/CollectionTemplate';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopProvider';
import { useCart } from '../../../context/CartProvider';
import { useUIStore } from '../../../stores/uiStore';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CollectionClientWrapper({ serverParams, referralRef = null, initialProducts }) {
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
      EXCHANGE_RATES={{}} 
    />
  );
}
