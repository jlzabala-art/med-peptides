"use client";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
 
import React from 'react';
import { Outlet } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ResearchDrawer from '../components/shared/ResearchDrawer';
import PageTransition from '../components/PageTransition';
import BottomNav from './BottomNav';
import { useUIStore } from '../stores/uiStore';
import { useCart } from '../context/CartProvider';


export default function ShopLayout({
  onGoHome,
  onSelectProduct,
  onSelectCategory,
  products
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveModal } = useUIStore();
  const { cartCount } = useCart();

  const handleOpenSearch = () => setActiveModal('search');
  const handleOpenCart = () => setActiveModal('cart');
  const handleOpenProducts = () => router.push('/collection/peptides');

  return (
    <>
      <Header 
        onGoHome={onGoHome}
        onSelectProduct={onSelectProduct}
        onSelectCategory={onSelectCategory}
        products={products}
      />
      
      <div className={`view-container ${(pathname !== '/') ? 'with-header-padding' : ''}`}>
        <PageTransition locationKey={pathname}>
          <Outlet />
        </PageTransition>
      </div>

      <Footer onSelectCategory={onSelectCategory} />
      
      {/* Global Research Drawer */}
      <ResearchDrawer />

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        onGoHome={onGoHome}
        onOpenSearch={handleOpenSearch}
        onOpenCart={handleOpenCart}
        onOpenProducts={handleOpenProducts}
        cartCount={cartCount}
      />
    </>
  );
}
