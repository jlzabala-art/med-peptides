import GuestHome from './GuestHome';

/**
 * HomeView — single homepage for all users (guest + professional).
 * No conditional rendering by user type on the homepage.
 */
export default function HomeView({
  onSelectCategory,
  onSelectProduct,
  onOpenSearch,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <GuestHome
      onSelectCategory={onSelectCategory}
      onSelectProduct={onSelectProduct}
      onOpenSearch={onOpenSearch}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}
