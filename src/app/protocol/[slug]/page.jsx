"use client";

import React from 'react';
import ProtocolTemplate from '../../../templates/ProtocolTemplate';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopProvider';
import { useCart } from '../../../context/CartProvider';
import { useParams } from 'next/navigation';

export default function NextProtocolPage({ params: serverParams }) {
  const params = useParams();
  const slug = serverParams?.slug || params?.slug;

  const { isProfessional, isAdmin } = useAuth();
  const { products, region, setRegion } = useShop();
  const { cart, updateCart } = useCart();

  return (
    <ProtocolTemplate 
      slug={slug}
      region={region}
      isProfessional={isProfessional}
      isAdmin={isAdmin}
      cart={cart}
      updateCart={updateCart}
      setRegion={setRegion}
      products={products}
      allFaqs={[]}
    />
  );
}
