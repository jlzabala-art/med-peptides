import X from "lucide-react/dist/esm/icons/x";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Info from "lucide-react/dist/esm/icons/info";
import React, { useEffect } from 'react';



import { Link } from 'react-router-dom';
import './ProductDetailDrawer.css';

export default function ProductDetailDrawer({ product, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="product-drawer-backdrop" onClick={onClose} />
      {/* Drawer */}
      <div className="product-drawer">
        <div className="product-drawer__header">
          <div className="product-drawer__header-left">
            <h2 className="product-drawer__title">{product.name}</h2>
            {product.role && (
              <span 
                className="product-drawer__role" 
                style={{ color: product.color || 'var(--color-primary)', backgroundColor: `${product.color || 'var(--color-primary)'}15` }}
              >
                {product.role}
              </span>
            )}
          </div>
          <button className="product-drawer__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="product-drawer__content">
          <div className="product-drawer__section">
            <h3 className="product-drawer__section-title">Description</h3>
            <p className="product-drawer__text">
              {product.description || "No detailed description available for this compound."}
            </p>
          </div>

          <div className="product-drawer__section">
            <h3 className="product-drawer__section-title">Protocol Specifics</h3>
            <div className="product-drawer__specifics">
              <div className="product-drawer__specific-item">
                <span className="product-drawer__specific-label">Dosage:</span>
                <span className="product-drawer__specific-value">{product.dosage || "Not specified"}</span>
              </div>
              <div className="product-drawer__specific-item">
                <span className="product-drawer__specific-label">Frequency:</span>
                <span className="product-drawer__specific-value">{product.frequency || "Not specified"}</span>
              </div>
            </div>
          </div>
          <div className="product-drawer__info-box">
            <Info size={16} className="product-drawer__info-icon" />
            <p>
              This compound is part of your current protocol. For comprehensive clinical research, mechanism of action, and deep-dive literature, visit the full compound page.
            </p>
          </div>
        </div>

        <div className="product-drawer__footer">
          <Link to={`/peptides/${product.slug}`} className="product-drawer__full-link" onClick={onClose}>
            View Full Product Details <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}