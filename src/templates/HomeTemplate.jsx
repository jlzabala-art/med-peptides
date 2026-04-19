import React, { useState, useEffect } from 'react';
import HomeView from './HomeView';
import { db } from '../firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';

/**
 * HomeTemplate serves as the route-level data provider for the Home Page.
 * It is responsible for fetching initial required data (featured products, etc.)
 */
export default function HomeTemplate({ isProfessional }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Example standalone fetch for Home Page
        const q = query(collection(db, 'products'), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (err) {
        console.error("HomeTemplate Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  return (
    <HomeView 
      isProfessional={isProfessional} 
      products={products}
      onSelectCategory={() => {}}
      onSelectProduct={() => {}}
    />
  );
}
