"use client";

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import FAQDiscoveryView from './FAQDiscoveryView';
import * as fb from '../firebase';
const db = fb?.db;
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * FAQTemplate serves as the route-level data provider for the FAQ section.
 * URL Patterns: /faq, /faq/:topic
 */
export default function FAQTemplate() {
  const { topic } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadFaqData() {
      try {
        const q = query(collection(db, 'products'), where('isActive', '==', true));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("FAQTemplate Error:", err);
      }
    }
    loadFaqData();
  }, []);

  return (
    <FAQDiscoveryView 
      onBack={() => router.push(-1)}
      onSelectProduct={(name) => {
        const target = products.find(p => p.name === name);
        if (target?.slug) router.push(`/product/${target.slug}`);
      }}
      products={products}
      // pass the topic if needed to preselect / filter
      defaultTopic={topic}
    />
  );
}
