 
import React, { useState } from 'react';
import HomeView from './HomeView';

/**
 * HomeTemplate — route-level shell for the Home Page (Home 2.0).
 * Data fetching is delegated to individual sections (FeaturedProtocols, KeyPeptides).
 * HomeTemplate owns the global searchQuery state shared across sections.
 */
export default function HomeTemplate({ isProfessional }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <HomeView
      isProfessional={isProfessional}
      products={[]}
      onSelectCategory={() => {}}
      onSelectProduct={() => {}}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}
