"use client";

import React, { useState } from 'react';
import ProductTemplate from '../../../templates/ProductTemplate';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopProvider';
import { useCart } from '../../../context/CartProvider';
import { useUIStore } from '../../../stores/uiStore';
import { useParams } from 'next/navigation';

export default function ProductClientWrapper({ serverParams, initialProduct }) {
  const params = useParams();
  const slug = serverParams?.slug || params?.slug;

  const { isProfessional, isAdmin } = useAuth();
  const { region, compareList, setCompareList } = useShop();
  const { cart, updateCart } = useCart();
  const { setActiveModal } = useUIStore();
  
  // Create an array because ProductTemplate expects `products` array 
  // (to find the product by slug, or we can just pass [initialProduct])
  const [products] = useState(initialProduct ? [initialProduct] : []);

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id || p.name === product.name);
      if (exists) return prev.filter(p => p.id !== product.id && p.name !== product.name);
      if (prev.length >= 3) {
        alert("You can only compare up to 3 products at a time.");
        return prev;
      }
      return [...prev, product];
    });
    setActiveModal('compare');
  };

  return (
    <ProductTemplate 
      slug={slug}
      products={products}
      initialProduct={initialProduct}
      region={region}
      isProfessional={isProfessional}
      isAdmin={isAdmin}
      cart={cart}
      onAddToCart={updateCart}
      toggleCompare={toggleCompare}
      compareList={compareList}
      allFaqs={[]} 
    />
  );
}
