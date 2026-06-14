import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Home from "lucide-react/dist/esm/icons/home";
import React from 'react';
import { Link } from 'react-router-dom';



/**
 * Premium Breadcrumbs Component
 * Designed with a clean, medical-pharmaceutical aesthetic.
 * @param {Array} items - List of objects { label, path }
 */
const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="breadcrumbs-nav"
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.25rem 0',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        opacity: 0.65,
      }}
    >
      <style>{`
        .breadcrumbs-nav::-webkit-scrollbar { display: none; }
        .breadcrumb-item {
          display: flex;
          align-items: center;
          color: rgba(255,255,255,0.7);
          font-size: 0.72rem;
          font-weight: 400;
          transition: color 0.15s ease;
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          color: rgba(255,255,255,1);
        }
        .breadcrumb-current {
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }
        .breadcrumb-separator {
          margin: 0 0.4rem;
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
      `}</style>

      <Link to="/" className="breadcrumb-item breadcrumb-link">
        <Home size={12} />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={11} className="breadcrumb-separator" />
          {item.path ? (
            <Link 
              to={item.path} 
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