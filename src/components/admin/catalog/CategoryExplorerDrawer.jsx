import X from "lucide-react/dist/esm/icons/x";
import Search from "lucide-react/dist/esm/icons/search";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Check from "lucide-react/dist/esm/icons/check";
import Star from "lucide-react/dist/esm/icons/star";
import Clock from "lucide-react/dist/esm/icons/clock";
import React, { useState, useMemo } from 'react';







import RightWorkspacePanel from './RightWorkspacePanel';

const CATEGORY_TREE = [
  {
    id: 'all_products',
    label: 'All Products',
    children: []
  },
  {
    id: 'peptides',
    label: 'Peptides',
    children: [
      { id: 'api_peptides', label: 'API Peptides' },
      { id: 'finished_peptides', label: 'Finished Peptides' },
      { id: 'research_peptides', label: 'Research Peptides' }
    ]
  },
  {
    id: 'longevity',
    label: 'Longevity',
    children: [
      { id: 'anti_aging', label: 'Anti-Aging' },
      { id: 'biomarkers', label: 'Biomarkers' },
      { id: 'genomics', label: 'Genomics' }
    ]
  },
  {
    id: 'hormonal_optimization',
    label: 'Hormonal Optimization',
    children: []
  },
  {
    id: 'metabolic_weight',
    label: 'Metabolic & Weight',
    children: []
  },
  {
    id: 'cognitive_mood',
    label: 'Cognitive & Mood',
    children: []
  },
  {
    id: 'immune_support',
    label: 'Immune Support',
    children: []
  },
  {
    id: 'testing',
    label: 'Testing',
    children: []
  },
  {
    id: 'raw_materials',
    label: 'Raw Materials',
    children: []
  },
  {
    id: 'medical_devices',
    label: 'Medical Devices',
    children: []
  },
  {
    id: 'services',
    label: 'Services',
    children: []
  }
];

export default function CategoryExplorerDrawer({ 
  isOpen, 
  onClose, 
  activeCategories = [], 
  onCategoryChange,
  products = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['peptides', 'longevity']));
  // Example persistence for recents/favorites can be added via localStorage or left in memory
  const [recentCategories, setRecentCategories] = useState(['API Peptides', 'Hormonal Optimization']);
  const [favoriteCategories, setFavoriteCategories] = useState(['Finished Peptides']);

  // Calculate static or dynamic counts
  const getCount = (label) => {
    if (label === 'All Products') return products.length;
    return products.filter(p => p.category === label).length || 0;
  };

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (label) => {
    const isSelected = activeCategories.includes(label);
    let newCategories = [];
    if (label === 'All Products') {
      newCategories = []; // Selecting all clears others
    } else {
      if (isSelected) {
        newCategories = activeCategories.filter(c => c !== label);
      } else {
        newCategories = [...activeCategories.filter(c => c !== 'All Products'), label];
      }
    }
    onCategoryChange(newCategories);
  };

  const isMobile = window.innerWidth < 768;

  if (!isOpen) return null;

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = activeCategories.includes(node.label) || (node.label === 'All Products' && activeCategories.length === 0);
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingChildren = hasChildren && node.children.some(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchQuery && !matchesSearch && !hasMatchingChildren) {
      return null;
    }

    return (
      <div key={node.id}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `0.5rem 1rem 0.5rem ${1 + depth * 1.5}rem`,
            cursor: 'pointer',
            background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
            borderLeft: isSelected ? '3px solid var(--color-primary, #6366f1)' : '3px solid transparent',
            transition: 'background 0.2s ease',
          }}
          onClick={() => handleSelect(node.label)}
          onMouseOver={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
          }}
          onMouseOut={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'transparent';
          }}
        >
          {hasChildren ? (
            <div 
              style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          ) : (
            <div style={{ width: '16px', marginRight: '0.5rem' }} />
          )}

          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: '2px solid',
            borderColor: isSelected ? 'var(--color-primary, #6366f1)' : 'rgba(226, 232, 240, 0.8)',
            background: isSelected ? 'var(--color-primary, #6366f1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem'
          }}>
            {isSelected && <Check size={12} color="white" strokeWidth={3} />}
          </div>

          <span style={{ 
            flex: 1, 
            fontSize: '0.95rem', 
            fontWeight: isSelected ? 600 : 500,
            color: isSelected ? 'var(--color-primary, #6366f1)' : 'var(--text-main, #1e293b)'
          }}>
            {node.label}
          </span>
          <span style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted, #64748b)',
            background: 'rgba(0,0,0,0.04)',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {getCount(node.label)}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <RightWorkspacePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Categories"
      headerActions={
        activeCategories.length > 0 && (
          <button
            onClick={() => onCategoryChange([])}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer'
            }}
          >
            Clear all
          </button>
        )
      }
      footer={
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.8rem',
            background: 'var(--color-primary, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
          }}
        >
          Show {activeCategories.length > 0 ? `${activeCategories.length} Categories` : 'All Products'}
        </button>
      }
    >
      {/* Search */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(226, 232, 240, 0.4)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-subtle, #f8fafc)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '12px',
          padding: '0.5rem 1rem'
        }}>
          <Search size={16} color="var(--text-muted, #64748b)" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Scrollable Content (RightWorkspacePanel handles overflow) */}
      <div style={{ paddingBottom: '2rem' }}>
        {/* Favorites & Recents (Show only if no search) */}
        {!searchQuery && (
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
            {favoriteCategories.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Star size={14} /> Favorites
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {favoriteCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleSelect(cat)}
                      style={{
                        background: activeCategories.includes(cat) ? 'rgba(99,102,241,0.1)' : 'white',
                        border: '1px solid',
                        borderColor: activeCategories.includes(cat) ? 'var(--color-primary, #6366f1)' : 'rgba(226, 232, 240, 0.8)',
                        color: activeCategories.includes(cat) ? 'var(--color-primary, #6366f1)' : 'var(--text-main, #1e293b)',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {recentCategories.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Clock size={14} /> Recently Used
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {recentCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleSelect(cat)}
                      style={{
                        background: activeCategories.includes(cat) ? 'rgba(99,102,241,0.1)' : 'white',
                        border: '1px solid',
                        borderColor: activeCategories.includes(cat) ? 'var(--color-primary, #6366f1)' : 'rgba(226, 232, 240, 0.8)',
                        color: activeCategories.includes(cat) ? 'var(--color-primary, #6366f1)' : 'var(--text-main, #1e293b)',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '0.5rem 0' }}>
          {CATEGORY_TREE.map(node => renderNode(node))}
        </div>

      </div>
    </RightWorkspacePanel>
  );
}