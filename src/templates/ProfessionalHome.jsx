import React from 'react';
import Hero from '../sections/Hero';
import PowerSearch from '../sections/PowerSearch';
import TrustStrip from '../sections/TrustStrip';
import TrendingPeptides from '../sections/TrendingPeptides';
import TrendingProtocols from '../sections/TrendingProtocols';
import NovelAcquisitions from '../sections/NovelAcquisitions';
import PathwayNavigation from '../sections/PathwayNavigation';
import ProtocolHighlight from '../sections/ProtocolHighlight';
import InstitutionalSolutions from '../sections/InstitutionalSolutions';
import ProfessionalDashboard from '../sections/ProfessionalDashboard';
import GlobalLogistics from '../sections/GlobalLogistics';
import PlatformCapabilitiesPro from '../sections/PlatformCapabilitiesPro';
import ContactCTA from '../sections/ContactCTA';

export default function ProfessionalHome({
  userProfile,
  onOpenSearch,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
  onSelectProduct,
}) {
  return (
    <div className="professional-home">
      <Hero onNavigate={onSelectCategory} />
      <PowerSearch
        onOpenSearch={onOpenSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <TrustStrip />
      <TrendingPeptides onSelectProduct={onSelectProduct} onSelectCategory={onSelectCategory} />
      <TrendingProtocols />
      <NovelAcquisitions onSelectCategory={onSelectCategory} onSelectProduct={onSelectProduct} />
      <PathwayNavigation onSelectCategory={onSelectCategory} />
      <ProtocolHighlight />
      <InstitutionalSolutions isProfessional={true} onSelectCategory={onSelectCategory} />

      {/* Operational dashboard — self-contained section */}
      <ProfessionalDashboard
        userProfile={userProfile}
        onOpenSearch={onOpenSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <GlobalLogistics />
      <PlatformCapabilitiesPro />
      <ContactCTA />
    </div>
  );
}
