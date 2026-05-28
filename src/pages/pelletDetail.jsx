import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPelletById } from '../lib/firestoreHelpers';
import PelletCard from '../components/PelletCard';
import { Helmet } from 'react-helmet-async';
import '../styles/pelletDetail.css';

export default function PelletDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pellet, setPellet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPelletById(id);
        setPellet(data);
      } catch (e) {
        console.error('Failed to load pellet', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="pellet-detail-loading">Loading…</div>;
  if (!pellet) return <div className="pellet-not-found">Pellet not found.</div>;

  return (
    <>
      <Helmet>
        <title>{pellet.name} – Hormone Pellet</title>
        <meta name="description" content={pellet.objective || 'Hormone pellet product details'} />
      </Helmet>
      <div className="pellet-detail-page">
        <PelletCard product={pellet} onViewDetails={() => {}} />
        <div className="pellet-extra-info">
          <h2>Details</h2>
          <p><strong>Dosage:</strong> {pellet.dosage}</p>
          <p><strong>Objective:</strong> {pellet.objective}</p>
          {/* Add more fields as needed */}
        </div>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to List</button>
      </div>
    </>
  );
}
