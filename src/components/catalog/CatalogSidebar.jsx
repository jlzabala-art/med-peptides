import React from 'react';
import styles from '../../templates/Catalog.module.css';
import { Activity, Moon, Zap, Sparkles, Droplets, ShieldCheck, Beaker, FlaskConical, Brain, Shield, CheckCircle2 } from '@/lib/icons';

const ICONS_MAP = {
  "Recovery & Repair": Activity,
  "Cognitive & Mood": Brain,
  "Sleep & Circadian": Moon,
  "Metabolic & Weight": Zap,
  "Longevity & Anti-Aging": Sparkles,
  "Hormonal Optimization": Droplets,
  "Immune Support": ShieldCheck,
  "Research Supplies": Beaker,
  "Other Research Peptides": FlaskConical
};

export default function CatalogSidebar({
  categories,
  activeCategory,
  onSelectCategory,
  groupedProducts,
  isProfessional,
  fdaStatusFilter = null,
  onSelectFdaStatus
}) {
  const fdaFilterOptions = [
    { id: 'fda_pcac_503a_recommended', label: 'FDA 503A Recommended (6)', icon: '🛡️' },
    { id: 'fda_approved', label: 'FDA Approved Active', icon: '✅' },
    { id: 'clinical_investigational', label: 'Phase 3 IND Trials', icon: '🔬' }
  ];

  return (
    <>
      {/* Mobile Pills Nav */}
      <nav className={styles.mobileNav} aria-label="Mobile category navigation">
        <button
          className={`${styles.navPill} ${activeCategory === null && fdaStatusFilter === null ? styles.active : ''}`}
          onClick={() => {
            onSelectCategory(null);
            onSelectFdaStatus?.(null);
          }}
        >
          All Pathways
        </button>

        {/* FDA Mobile Quick Pills */}
        {fdaFilterOptions.map(opt => (
          <button
            key={opt.id}
            className={`${styles.navPill} ${fdaStatusFilter === opt.id ? styles.active : ''}`}
            onClick={() => {
              onSelectCategory(null);
              onSelectFdaStatus?.(fdaStatusFilter === opt.id ? null : opt.id);
            }}
            style={fdaStatusFilter === opt.id ? { backgroundColor: '#1d4ed8', color: '#ffffff' } : { borderColor: '#93c5fd', color: '#1d4ed8' }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}

        {categories.map(category => {
          const productCount = groupedProducts[category]?.length || 0;
          if (productCount === 0 && !isProfessional) return null;
          
          const IconComp = ICONS_MAP[category] || FlaskConical;
          const shortLabel = category.split(' ')[0];

          return (
            <button
              key={category}
              className={`${styles.navPill} ${activeCategory === category && fdaStatusFilter === null ? styles.active : ''}`}
              onClick={() => {
                onSelectFdaStatus?.(null);
                onSelectCategory(category);
              }}
            >
              <IconComp size={16} />
              {shortLabel}
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        {/* FDA Regulatory Status Filter Group */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 className={styles.sidebarTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8' }}>
            🛡️ FDA Regulatory Status
          </h3>
          <div className={styles.sidebarList}>
            {fdaFilterOptions.map(opt => {
              const isSelected = fdaStatusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  className={`${styles.sidebarItem} ${isSelected ? styles.active : ''}`}
                  onClick={() => {
                    onSelectCategory(null);
                    onSelectFdaStatus?.(isSelected ? null : opt.id);
                  }}
                  style={isSelected ? { backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1d4ed8' } : {}}
                >
                  <div className={styles.sidebarItemIcon}>
                    <span>{opt.icon}</span>
                    <span style={{ fontWeight: isSelected ? 800 : 600 }}>{opt.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <h3 className={styles.sidebarTitle}>Research Pathways</h3>
        <div className={styles.sidebarList}>
          <button
            className={`${styles.sidebarItem} ${activeCategory === null && fdaStatusFilter === null ? styles.active : ''}`}
            onClick={() => {
              onSelectCategory(null);
              onSelectFdaStatus?.(null);
            }}
          >
            <div className={styles.sidebarItemIcon}>
              <FlaskConical size={18} />
              <span>All Pathways</span>
            </div>
          </button>
          
          {categories.map(category => {
            const productCount = groupedProducts[category]?.length || 0;
            if (productCount === 0 && !isProfessional) return null;

            const IconComp = ICONS_MAP[category] || FlaskConical;

            return (
              <button
                key={category}
                className={`${styles.sidebarItem} ${activeCategory === category && fdaStatusFilter === null ? styles.active : ''}`}
                onClick={() => {
                  onSelectFdaStatus?.(null);
                  onSelectCategory(category);
                }}
              >
                <div className={styles.sidebarItemIcon}>
                  <IconComp size={18} />
                  <span>{category}</span>
                </div>
                <span className={styles.sidebarBadge}>{productCount}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
