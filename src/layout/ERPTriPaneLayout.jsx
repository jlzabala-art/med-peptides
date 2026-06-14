import React, { useState, useEffect } from 'react';

/**
 * ERPTriPaneLayout
 * 
 * Standardized 3-pane layout for Ultimate ERP modules (Sales Orders, Quotations, Invoices).
 * Automatically handles mobile view switching.
 * 
 * @param {ReactNode} topHeader - The persistent top bar (e.g. FinancialKPIHeader, or Global action bar). Optional.
 * @param {ReactNode} leftPane - The list view pane.
 * @param {ReactNode} centerPane - The main detail workspace or dashboard.
 * @param {ReactNode} rightPane - The action center or intelligence hub.
 * @param {ReactNode} mobileView - The mobile optimized view component.
 * @param {string} leftPaneWidth - Customizable width for the left list pane.
 */
export default function ERPTriPaneLayout({ 
  topHeader, 
  leftPane, 
  centerPane, 
  rightPane,
  mobileView,
  leftPaneWidth = '360px'
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile && mobileView) {
    return mobileView;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Optional Top Header (KPIs, Global Actions) */}
      {topHeader && (
        <div style={{ flexShrink: 0, zIndex: 20 }}>
          {topHeader}
        </div>
      )}

      {/* Main 3-Pane Structure */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Compact, Sticky */}
        <div style={{ 
          width: leftPaneWidth, flexShrink: 0, borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
          position: 'sticky', top: 0, height: '100%', overflowY: 'auto'
        }}>
          {leftPane}
        </div>

        {/* Center Panel: Main Workspace or Dashboard */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {centerPane}
        </div>

        {/* Right Panel: Collections & AI Center */}
        <div style={{ 
          width: '320px', flexShrink: 0, borderLeft: '1px solid #e2e8f0', backgroundColor: '#ffffff',
          position: 'sticky', top: 0, height: '100%', overflowY: 'auto'
        }}>
          {rightPane}
        </div>
        
      </div>
    </div>
  );
}
