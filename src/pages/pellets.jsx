import React, { useEffect, useState } from 'react';
import { getHormonePellets } from '../lib/firestoreHelpers';
import PelletCard from '../components/PelletCard';
import '../styles/pellets.css';

export default function PelletsPage() {
  const [pellets, setPellets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getHormonePellets();
        setPellets(data);
      } catch (e) {
        console.error('Failed to load hormone pellets', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="pellets-loading">Loading hormone pellets…</div>;

  return (
    <div className="pellets-grid">
      {pellets.map(p => (
        <PelletCard key={p.id} product={p} />
      ))}
    </div>
  );
}
