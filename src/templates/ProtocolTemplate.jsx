import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ObjectiveDetailView from './ObjectiveDetailView';

/**
 * ProtocolTemplate serves as the route-level data provider for Protocol Pages (Objectives).
 * URL Pattern: /protocol/:slug
 */
export default function ProtocolTemplate({ region, isProfessional, cart, updateCart, setRegion, products, allFaqs, allMappings }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const objectiveName = slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Protocol';

  return (
    <ObjectiveDetailView 
      objectiveId={objectiveName}
      products={products || []}
      isProfessional={isProfessional}
      onBack={() => navigate(-1)}
      onSelectProduct={(name) => {
        const target = (products || []).find(p => p.name === name);
        if (target?.slug) navigate(`/product/${target.slug}`);
      }}
      allFaqs={allFaqs}
      allMappings={allMappings}
    />
  );
}
