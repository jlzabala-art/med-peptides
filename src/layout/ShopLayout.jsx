/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ResearchDrawer from '../components/shared/ResearchDrawer';
import PageTransition from '../components/PageTransition';
import BottomNav from './BottomNav';
import { useUIStore } from '../stores/uiStore';
import { useCart } from '../context/CartProvider';
import { useNavigate } from 'react-router-dom';

export default function ShopLayout({
  onGoHome,
  onSelectProduct,
  onSelectCategory,
  products
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveModal } = useUIStore();
  const { cartCount } = useCart();

  const handleOpenSearch = () => setActiveModal('search');
  const handleOpenCart = () => setActiveModal('cart');
  const handleOpenProducts = () => navigate('/collection/peptides');

  return (
    <>
      <Header 
        onGoHome={onGoHome}
        onSelectProduct={onSelectProduct}
        onSelectCategory={onSelectCategory}
        products={products}
      />
      
      <div className={`view-container ${(location.pathname !== '/') ? 'with-header-padding' : ''}`}>
        <PageTransition locationKey={location.pathname}>
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
