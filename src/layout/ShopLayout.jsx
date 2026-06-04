/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ResearchDrawer from '../components/shared/ResearchDrawer';

export default function ShopLayout({
  onGoHome,
  onSelectProduct,
  onSelectCategory,
  products
}) {
  const location = useLocation();

  return (
    <>
      <Header 
        onGoHome={onGoHome}
        onSelectProduct={onSelectProduct}
        onSelectCategory={onSelectCategory}
        products={products}
      />
      
      <div className={`view-container ${(location.pathname !== '/') ? 'with-header-padding' : ''}`}>
        <Outlet />
      </div>

      <Footer onSelectCategory={onSelectCategory} />
      
      {/* Global Research Drawer */}
      <ResearchDrawer />
    </>
  );
}
