import GuestHome from './GuestHome';
import { useAuth } from '../context/AuthContext';

export default function HomeView({ onSelectCategory, onSelectProduct, isProfessional, products = [], onOpenSearch, searchQuery, setSearchQuery }) {
  const { userProfile } = useAuth();
  const activeProductsCount = products.filter(p => p.isActive !== false).length;

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out forwards', backgroundColor: 'var(--background)' }}>
      <GuestHome 
        userProfile={userProfile}
        isProfessional={isProfessional}
        onSelectCategory={onSelectCategory}
        onSelectProduct={onSelectProduct}
        onOpenSearch={onOpenSearch}
        activeProducts={activeProductsCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
