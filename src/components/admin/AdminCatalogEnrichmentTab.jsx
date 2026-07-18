import React from 'react';
import CatalogIntelligenceHub from './catalog-enrichment/CatalogIntelligenceHub';

export default function AdminCatalogEnrichmentTab({ isSubTab = false }) {
  return <CatalogIntelligenceHub isSubTab={isSubTab} />;
}
