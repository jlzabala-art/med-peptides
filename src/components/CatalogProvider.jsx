"use client";

/**
 * CatalogProvider.jsx
 *
 * Initialises the in-memory v2 catalog (data/v2/index.js) from Firestore,
 * applying the dual-layer cache strategy (RAM → localStorage → Firestore).
 *
 * Source of truth: Firestore `products` and `supplements` collections.
 * Local JSON files (/data/*.v2.json) are NO LONGER used at runtime;
 * they exist only as a seeding reference for `scripts/`.
 *
 * Performance: getActiveProducts() uses a 30-min cache, getActiveSupplements()
 * uses a 24-h cache. Cold starts will see a single Firestore round-trip that
 * populates both caches for all subsequent renders.
 */

import React, { useState, useEffect } from 'react';
import { getActiveProducts } from '../repositories/productRepository';
import { getActiveSupplements } from '../repositories/supplementRepository';
import { initializeData } from '../data/v2/index';

export function CatalogProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initCatalog() {
      try {
        // Fetch products and supplements in parallel from Firestore
        // (both functions apply their own memory + localStorage cache)
        const [products, supplements] = await Promise.all([
          getActiveProducts(),
          getActiveSupplements(),
        ]);

        // Build the combined catalog array expected by data/v2/index.js
        const catalog = [...products, ...supplements];

        initializeData({ catalog, products, supplements });
        setIsLoaded(true);
      } catch (err) {
        console.error('[CatalogProvider] Error loading catalog from Firestore:', err);
        setError(err);
      }
    }

    initCatalog();
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <p>Error loading product catalog. Please refresh the page.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #e2e8f0', borderTopColor: '#4285f4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return <>{children}</>;
}
