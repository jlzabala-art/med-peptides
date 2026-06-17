import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import X from 'lucide-react/dist/esm/icons/x';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Building from 'lucide-react/dist/esm/icons/building';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

import VariantOverviewTable from './tabs/VariantOverviewTable';
import VariantCommercialTable from './tabs/VariantCommercialTable';
import VariantInventoryTable from './tabs/VariantInventoryTable';
import VariantSupplierTable from './tabs/VariantSupplierTable';
import VariantRegulatoryTable from './tabs/VariantRegulatoryTable';
import VariantAnalyticsTable from './tabs/VariantAnalyticsTable';

export default function UnifiedItemWorkspaceDrawer({ product, onClose, onAction, selectedIds = [], onSelectionChange }) {
  const [activeSection, setActiveSection] = useState('overview');
  const scrollContainerRef = useRef(null);
  
  const sections = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'commercial', label: 'Commercial', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: PackageOpen },
    { id: 'suppliers', label: 'Suppliers', icon: Building },
    { id: 'regulatory', label: 'Regulatory', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 }
  ];


  // Implement ScrollSpy
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      let currentSection = sections[0].id;
      
      for (const section of sections) {
        const el = document.getElementById(`section-${section.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the section's top is near the top of the viewport
          if (rect.top <= 200) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      scrollContainerRef.current.scrollBy({
        top: elTop - containerTop - 20, // offset for sticky header
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            width: '90%',
            maxWidth: '1200px',
            background: '#f8fafc',
            height: '100%',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem 2rem', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.4rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px' }}>
                  {product.category || 'Product'}
                </span>
                {product.status === 'active' && <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.4rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px' }}>Active</span>}
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{product.name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>{product.variants?.length || 0} Variants • Last updated {new Date().toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>

          {/* Sticky Navigation */}
          <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 2rem', display: 'flex', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{
                  padding: '1rem 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: activeSection === s.id ? '#2563eb' : '#64748b',
                  borderBottom: activeSection === s.id ? '2px solid #2563eb' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Scrollable Workspace */}
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* AI Recommendation Context Block */}
            <div style={{ background: 'linear-gradient(to right, #e0e7ff, #ede9fe)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #c7d2fe', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '8px', color: '#4f46e5' }}><Sparkles size={20} /></div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#312e81', margin: '0 0 0.2rem 0' }}>AI Workspace Insights</h4>
                <p style={{ fontSize: '0.8rem', color: '#4338ca', margin: 0, lineHeight: 1.4 }}>
                  This product has variants running low on stock and no backup supplier assigned. Consider generating an RFQ to secure alternative sourcing before stockout.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <button className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#4f46e5', color: '#fff', border: 'none' }}>Generate RFQ</button>
                  <button className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#fff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>Find Backup Suppliers</button>
                </div>
              </div>
            </div>

            <section id="section-overview" style={sectionStyle}>
              <SectionHeader icon={LayoutDashboard} title="Overview" />
              <VariantOverviewTable variants={product.variants} parentProduct={product} onAction={onAction} />
            </section>

            <section id="section-commercial" style={sectionStyle}>
              <SectionHeader icon={DollarSign} title="Commercial Status" />
              <VariantCommercialTable variants={product.variants} parentProduct={product} onAction={onAction} />
            </section>

            <section id="section-inventory" style={sectionStyle}>
              <SectionHeader icon={PackageOpen} title="Inventory Status" />
              <VariantInventoryTable variants={product.variants} parentProduct={product} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
            </section>

            <section id="section-suppliers" style={sectionStyle}>
              <SectionHeader icon={Building} title="Supplier Assignment" />
              <VariantSupplierTable variants={product.variants} parentProduct={product} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
            </section>

            <section id="section-regulatory" style={sectionStyle}>
              <SectionHeader icon={ShieldCheck} title="Regulatory Compliance" />
              <VariantRegulatoryTable variants={product.variants} parentProduct={product} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
            </section>

            <section id="section-analytics" style={sectionStyle}>
              <SectionHeader icon={BarChart2} title="Analytics & Trends" />
              <VariantAnalyticsTable variants={product.variants} parentProduct={product} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
            </section>
            
            {/* Spacer for bottom scrolling padding */}
            <div style={{ height: '400px' }}></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const sectionStyle = {
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  overflowX: 'auto'
};

const SectionHeader = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ padding: '0.4rem', background: '#f8fafc', borderRadius: '6px', color: '#64748b' }}>
      <Icon size={18} />
    </div>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h3>
  </div>
);
