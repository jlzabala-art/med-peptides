"use client";

import React, { useState, useEffect } from 'react';
import { initializeData } from '../data/v2/index';

export function CatalogProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const [catalogRes, productsRes, supplementsRes] = await Promise.all([
          fetch('/data/catalog.v2.json'),
          fetch('/data/products.v2.json'),
          fetch('/data/supplements.v2.json')
        ]);

        if (!catalogRes.ok) throw new Error('Failed to load catalog');

        const catalog = await catalogRes.json();
        const products = await productsRes.json();
        const supplements = await supplementsRes.json();

        initializeData({ catalog, products, supplements });
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading catalog data:', err);
        setError(err);
      }
    }

    fetchCatalog();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        <p>Error loading product catalog. Please refresh the page.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
