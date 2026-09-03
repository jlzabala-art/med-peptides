"use client";

import React from 'react';
import ProductDetailRouter from '../components/product/ProductDetailRouter';

/**
 * ProductDetail Template
 * 
 * This component acts as the page-level wrapper for the B2C Product Detail Page.
 * It passes all its props down to the core ProductDetailRouter component.
 */
export default function ProductDetail(props) {
  return (
    <div className="product-detail-page-wrapper">
      <ProductDetailRouter {...props} isQuickView={false} />
    </div>
  );
}