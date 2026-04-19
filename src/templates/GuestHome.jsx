import Hero from '../sections/Hero';

import PowerSearch from '../sections/PowerSearch';
import TrustStrip from '../sections/TrustStrip';
import UserSegmentEntry from '../sections/UserSegmentEntry';
import PathwayNavigation from '../sections/PathwayNavigation';
import ProtocolHighlight from '../sections/ProtocolHighlight';
import TrendingPeptides from '../sections/TrendingPeptides';
import NovelAcquisitions from '../sections/NovelAcquisitions';
import InstitutionalSolutions from '../sections/InstitutionalSolutions';
import CustomSynthesisBanner from '../sections/CustomSynthesisBanner';
import EducationHub from '../sections/AcademyBanner';
import GlobalLogistics from '../sections/GlobalLogistics';
import PlatformCapabilities from '../sections/PlatformCapabilities';
import ContactCTA from '../sections/ContactCTA';

export default function GuestHome({ onSelectCategory, onSelectProduct, onOpenSearch, activeProducts, searchQuery, setSearchQuery, isProfessional, userProfile }) {
  return (
    <div className="guest-home">
      {/* 1. Primary Entry & Hero */}
      <Hero onNavigate={onSelectCategory} mode={isProfessional ? 'professional' : 'guest'} />



      {/* 3. Unified Clinical Search */}
      <PowerSearch onOpenSearch={onOpenSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 4. Operational Summary Strip */}
      <TrustStrip />

      {/* 5. Practitioner & Researcher Access */}
      <UserSegmentEntry onNavigate={onSelectCategory} />

      {/* 6. Research Focus / Application Areas */}
      <PathwayNavigation onSelectCategory={onSelectCategory} />

      {/* 7. Protocol Builder Feature Highlight */}
      <ProtocolHighlight />

      {/* 8. Product Discovery: Trending & New Arrivals */}
      <TrendingPeptides onSelectProduct={onSelectProduct} onSelectCategory={onSelectCategory} />
      <NovelAcquisitions onSelectCategory={onSelectCategory} onSelectProduct={onSelectProduct} />

      {/* 9. Institutional Solutions (visible to logged-in professional users) */}
      <InstitutionalSolutions isProfessional={isProfessional} onSelectCategory={onSelectCategory} />

      {/* 10. Custom Synthesis Banner */}
      <CustomSynthesisBanner onNavigate={onSelectCategory} />

      {/* 11. Education Hub */}
      <EducationHub onNavigate={onSelectCategory} />

      {/* 12. Global Infrastructure */}
      <GlobalLogistics />

      {/* 13. Supporting Capabilities */}
      <PlatformCapabilities />

      {/* 14. Final Conversion */}
      <ContactCTA />
    </div>
  );
}
