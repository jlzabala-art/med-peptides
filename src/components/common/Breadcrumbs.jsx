import Link from 'next/link';
import React from 'react';
import { ChevronRight, Home } from '@/lib/icons';



/**
 * Premium Breadcrumbs Component
 * Designed with a clean, medical-pharmaceutical aesthetic.
 * Conforms to GCP UI standards & accessible color contrast.
 * @param {Array} items - List of objects { label, path }
 * @param {string} theme - 'light' | 'dark' (defaults to 'light')
 */
const Breadcrumbs = ({ items, theme = 'light' }) => {
  if (!items || items.length === 0) return null;

  const isDark = theme === 'dark';

  return (
    <nav
      className={`breadcrumbs-nav breadcrumbs-${theme}`}
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.25rem 0',
        marginBottom: '0.75rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        .breadcrumbs-nav::-webkit-scrollbar { display: none; }
        .breadcrumbs-light .breadcrumb-item {
          display: flex;
          align-items: center;
          color: #64748b;
          font-size: 0.74rem;
          font-weight: 500;
          transition: color 0.15s ease;
          text-decoration: none;
        }
        .breadcrumbs-light .breadcrumb-link:hover {
          color: #003666;
        }
        .breadcrumbs-light .breadcrumb-current {
          color: #0f172a;
          font-weight: 650;
        }
        .breadcrumbs-light .breadcrumb-separator {
          margin: 0 0.35rem;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .breadcrumbs-dark .breadcrumb-item {
          display: flex;
          align-items: center;
          color: rgba(255,255,255,0.7);
          font-size: 0.74rem;
          font-weight: 400;
          transition: color 0.15s ease;
          text-decoration: none;
        }
        .breadcrumbs-dark .breadcrumb-link:hover {
          color: #ffffff;
        }
        .breadcrumbs-dark .breadcrumb-current {
          color: rgba(255,255,255,0.95);
          font-weight: 600;
        }
        .breadcrumbs-dark .breadcrumb-separator {
          margin: 0 0.35rem;
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
        }
      `}</style>

      <Link href="/" className="breadcrumb-item breadcrumb-link">
        <Home size={12} />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={11} className="breadcrumb-separator" />
          {item.path ? (
            <Link 
              href={item.path} 
              className="breadcrumb-item breadcrumb-link"
            >
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-item breadcrumb-current" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;