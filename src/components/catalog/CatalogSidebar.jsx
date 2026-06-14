import React from 'react';
import styles from '../../templates/Catalog.module.css';

// Icons
import Activity from "lucide-react/dist/esm/icons/activity";
import Moon from "lucide-react/dist/esm/icons/moon";
import Zap from "lucide-react/dist/esm/icons/zap";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Brain from "lucide-react/dist/esm/icons/brain";

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
  isProfessional
}) {
  return (
    <>
      {/* Mobile Pills Nav */}
      <nav className={styles.mobileNav} aria-label="Mobile category navigation">
        <button
          className={`${styles.navPill} ${activeCategory === null ? styles.active : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          All Pathways
        </button>
        {categories.map(category => {
          const productCount = groupedProducts[category]?.length || 0;
          if (productCount === 0 && !isProfessional) return null;
          
          const IconComp = ICONS_MAP[category] || FlaskConical;
          const shortLabel = category.split(' ')[0];

          return (
            <button
              key={category}
              className={`${styles.navPill} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              <IconComp size={16} />
              {shortLabel}
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Research Pathways</h3>
        <div className={styles.sidebarList}>
          <button
            className={`${styles.sidebarItem} ${activeCategory === null ? styles.active : ''}`}
            onClick={() => onSelectCategory(null)}
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
                className={`${styles.sidebarItem} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => onSelectCategory(category)}
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
