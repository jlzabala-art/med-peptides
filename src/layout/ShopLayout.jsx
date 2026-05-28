/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ResearchDrawer from '../components/shared/ResearchDrawer';

export default function ShopLayout({
  scrolled,
  region,
  onOpenRegion,
  cartCount,
  onOpenCart,
  onOpenSearch,
  activeModal,
  setActiveModal,
  isHome,
  onGoHome,
  onSelectProduct,
  onSelectCategory,
  products
}) {
  const location = useLocation();

  return (
    <>
      <Header 
        scrolled={scrolled} 
        region={region}
        onOpenRegion={onOpenRegion}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenSearch={onOpenSearch}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        isHome={isHome}
        onGoHome={onGoHome}
        onSelectProduct={onSelectProduct}
        onSelectCategory={onSelectCategory}
        products={products}
      />
      
      <div className={`view-container ${(!isHome) ? 'with-header-padding' : ''}`}>
        <Outlet />
      </div>

      <Footer onSelectCategory={onSelectCategory} />
      
      {/* Global Research Drawer */}
      <ResearchDrawer />
    </>
  );
}
