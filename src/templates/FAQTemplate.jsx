 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FAQDiscoveryView from './FAQDiscoveryView';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * FAQTemplate serves as the route-level data provider for the FAQ section.
 * URL Patterns: /faq, /faq/:topic
 */
export default function FAQTemplate() {
  const { topic } = useParams();
  const navigate = useNavigate();
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
      onBack={() => navigate(-1)}
      onSelectProduct={(name) => {
        const target = products.find(p => p.name === name);
        if (target?.slug) navigate(`/product/${target.slug}`);
      }}
      products={products}
      // pass the topic if needed to preselect / filter
      defaultTopic={topic}
    />
  );
}
