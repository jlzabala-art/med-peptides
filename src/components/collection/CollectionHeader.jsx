 
import React from 'react';
import { Search, Sparkles } from 'lucide-react';

/**
 * Shared header for all collections (Peptides, Supplements, Protocols).
 * Enforces consistent typography, spacing, and search bar placement.
 */
export default function CollectionHeader({ 
  title, 
  subtitle, 
  searchQuery, 
  onSearchChange,
  searchPlaceholder = "Search...",
  actions = null
}) {
  return (
    <div className="col-header">
      <div className="col-header-top">
        <div>
          <h1 className="col-header-title">{title}</h1>
          {subtitle && <p className="col-header-subtitle">{subtitle}</p>}
        </div>
        
        <div className="col-header-actions">
          <div className="col-search-wrapper">
            <Search className="col-search-icon" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="col-search-input"
            />
          </div>
          {actions && (
            <div className="col-header-extra-actions">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
