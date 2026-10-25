"use client";

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import FAQDiscoveryView from './FAQDiscoveryView';
import * as fb from '../firebase';
const db = fb?.db;
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

/**
 * FAQTemplate serves as the route-level data provider for the FAQ section.
 * URL Patterns: /faq, /faq/:topic
 */
export default function FAQTemplate({ initialProducts = [] }) {
  const params = useParams();
  const topic = params?.topic;
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return;

    let isMounted = true;
    async function loadFaqData() {
      try {
        if (!db) return;
        // Strict limit to prevent unpaginated client bulk read (Golden Rule #1)
        const q = query(collection(db, 'products'), where('isActive', '==', true), limit(30));
        const snap = await getDocs(q);
        if (isMounted) {
          setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (err) {
        console.error("FAQTemplate Error:", err);
      }
    }
    loadFaqData();
    return () => { isMounted = false; };
  }, [initialProducts]);

  return (
    <FAQDiscoveryView 
      onBack={() => router.back()}
      onSelectProduct={(name) => {
        const target = products.find(p => p.name === name || p.displayName === name);
        if (target?.slug) {
          router.push(`/p/${target.slug}`);
        } else if (name) {
          const fallbackSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          router.push(`/p/${fallbackSlug}`);
        }
      }}
      products={products}
      defaultTopic={topic}
    />
  );
}
