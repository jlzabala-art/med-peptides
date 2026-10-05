"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  FlaskConical,
  Dna,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Droplet,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Layers,
  Check,
} from 'lucide-react';
import { searchAlgoliaProducts } from '@/services/algoliaSearch';
import { getAllProducts } from '@/repositories/productRepository';
import { triggerHaptic } from '@/utils/haptics';

// ── Google Cloud Clinical Category Classification ───────────────────────────
function getProductCategoryMeta(product) {
  const cat = (product.category || product.itemType || '').toLowerCase();
  const name = (product.canonicalName || product.name || product.displayName || '').toLowerCase();

  // 1. Diluents, bases, compounding solutions
  if (
    name.includes('bacteriostatic') ||
    name.includes('water') ||
    cat.includes('compounding') ||
    cat.includes('diluent') ||
    cat.includes('supply')
  ) {
    return {
      id: 'diluents',
      label: 'Compounding Bases & Diluents',
      labelEs: 'Bases de Formulación y Diluyentes',
      icon: Droplet,
      iconColor: '#0891b2',
      badgeBg: '#ecfeff',
      badgeBorder: '#a5f3fc',
      badgeColor: '#0e7490',
      order: 3,
    };
  }

  // 2. Raw materials & Bulk APIs (Powders, excipients)
  if (
    cat.includes('raw_material') ||
    cat.includes('api') ||
    name.includes('(bulk api)') ||
    name.includes('powder')
  ) {
    return {
      id: 'raw_materials',
      label: 'Active APIs & Raw Materials',
      labelEs: 'Principios Activos y Materias Primas',
      icon: FlaskConical,
      iconColor: '#7c3aed',
      badgeBg: '#f5f3ff',
      badgeBorder: '#ddd6fe',
      badgeColor: '#6d28d9',
      order: 2,
    };
  }

  // 3. Aesthetics & Cosmeceuticals
  if (
    cat.includes('aesthetic') ||
    cat.includes('nutricosmetic') ||
    cat.includes('dermatology') ||
    cat.includes('trichology') ||
    cat.includes('cosmetic')
  ) {
    return {
      id: 'aesthetic',
      label: 'Aesthetic & Cosmeceuticals',
      labelEs: 'Inyectables Estéticos y Cosmecéutica',
      icon: Sparkles,
      iconColor: '#db2777',
      badgeBg: '#fdf2f8',
      badgeBorder: '#fbcfe8',
      badgeColor: '#be185d',
      order: 4,
    };
  }

  // 4. Endocrinology, Hormones & Clinical Solutions
  if (
    cat.includes('bhrt') ||
    cat.includes('hormone') ||
    cat.includes('supplement') ||
    cat.includes('iv') ||
    cat.includes('infusion') ||
    cat.includes('genomic')
  ) {
    return {
      id: 'specialized',
      label: 'Endocrinology & Clinical Solutions',
      labelEs: 'Endocrinología y Soluciones Clínicas',
      icon: Dna,
      iconColor: '#ea580c',
      badgeBg: '#fff7ed',
      badgeBorder: '#fed7aa',
      badgeColor: '#c2410c',
      order: 5,
    };
  }

  // 5. Default: Clinical Peptides & Biologics (Primary Tier)
  return {
    id: 'peptides',
    label: 'Clinical Peptides & Biologics',
    labelEs: 'Péptidos Clínicos y Biológicos',
    icon: FlaskConical,
    iconColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    badgeColor: '#0369a1',
    order: 1,
  };
}

// Format clean readable subtitle instead of raw snake_case
function formatProductSubtitle(item, isSpanish) {
  if (item.targetReceptorAxis) return item.targetReceptorAxis;
  if (item.clinicalIndication) return item.clinicalIndication;
  if (item.indication) return item.indication;
  if (item.format || item.presentation) {
    return `${item.format || item.presentation} · ${isSpanish ? 'Grado Clínico' : 'Clinical Grade'}`;
  }
  const cat = (item.category || '').toLowerCase();
  if (cat === 'raw_material') return isSpanish ? 'Principio Activo a Granel (API)' : 'Bulk Active Pharmaceutical Ingredient (API)';
  if (cat === 'compounding_material') return isSpanish ? 'Excipiente Estéril de Compounding' : 'Sterile Compounding Excipient';
  if (cat === 'peptide') return isSpanish ? 'Péptido Liofilizado de Investigación' : 'Lyophilized Research & Clinical Peptide';
  return item.category || (isSpanish ? 'Formulación Clínica' : 'Clinical Formulation');
}

export default function DatasheetQuickSearchModal({
  isOpen,
  onClose,
  currentSupplier = 'Lotusland',
  currentSlug = '',
  lang = 'en',
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [initialCatalog, setInitialCatalog] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isSpanish = lang === 'es';

  // Normalize supplier string for matching
  const cleanCurrentSupplier = useMemo(() => {
    return (currentSupplier || '').toLowerCase().replace(/[\s-_]/g, '');
  }, [currentSupplier]);

  // Load initial fallback catalog (100 products) from local cache repository
  useEffect(() => {
    let isMounted = true;
    getAllProducts({ limit: 100 })
      .then((prods) => {
        if (isMounted && Array.isArray(prods)) {
          setInitialCatalog(prods);
        }
      })
      .catch((err) => {
        console.warn('[DatasheetQuickSearchModal] Preload catalog warning:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const performSearch = useCallback(
    async (queryText) => {
      setLoading(true);
      try {
        const term = (queryText || '').trim();
        let rawProducts = [];

        if (term.length >= 2) {
          // 1. Ultra-fast direct Algolia product search (<15ms)
          const hits = await searchAlgoliaProducts(term, {
            hitsPerPage: 40,
            supplier: currentSupplier,
          });
          if (hits && hits.length > 0) {
            rawProducts = hits;
          }
        }

        // 2. Fallback or merge with cached repository if Algolia yielded 0
        if (rawProducts.length === 0) {
          const lower = term.toLowerCase();
          if (term.length > 0) {
            rawProducts = initialCatalog.filter((p) => {
              const name = (p.name || p.canonicalName || p.displayName || '').toLowerCase();
              const category = (p.category || '').toLowerCase();
              const target = (p.targetReceptorAxis || p.indication || '').toLowerCase();
              const supplier = (p.supplierName || p.sourceSupplier || p.supplier || '').toLowerCase();
              return (
                name.includes(lower) ||
                category.includes(lower) ||
                target.includes(lower) ||
                supplier.includes(lower)
              );
            });
          } else {
            rawProducts = initialCatalog;
          }
        }

        // Filter by supplier if specified
        const targetSup = cleanCurrentSupplier || 'lotusland';
        const finalResults = rawProducts.filter((p) => {
          const sup = (p.supplierName || p.sourceSupplier || p.supplier || '').toLowerCase().replace(/[\s-_]/g, '');
          if (!sup) return true;
          return sup.includes(targetSup) || (targetSup.includes('lotus') && sup.includes('lotus'));
        });

        // Deduplicate by slug / id
        const seen = new Set();
        const unique = [];
        for (const item of finalResults) {
          const key = item.slug || item.id || item.name;
          if (key && !seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        }

        setResults(unique);
        setSelectedIndex(0);

        // When searching with query, auto-expand categories with hits
        if (term.length > 0) {
          const autoExpanded = {};
          unique.forEach((item) => {
            const meta = getProductCategoryMeta(item);
            autoExpanded[meta.id] = true;
          });
          setExpandedCategories(autoExpanded);
        } else {
          // Reset to collapsed by default when query is cleared
          setExpandedCategories({});
        }
      } catch (err) {
        console.warn('[DatasheetQuickSearchModal] Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [cleanCurrentSupplier, currentSupplier, initialCatalog]
  );

  // Debounced search handler for sub-second responsive typing
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 120);
  };

  // Open & Focus Management
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setExpandedCategories({});
      performSearch('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [isOpen, performSearch]);

  // Group items by category and sort ALPHABETICALLY (A-Z) inside each category
  const categorizedGroups = useMemo(() => {
    if (!results || results.length === 0) return [];

    const map = new Map();

    results.forEach((item) => {
      const meta = getProductCategoryMeta(item);
      if (!map.has(meta.id)) {
        map.set(meta.id, {
          ...meta,
          items: [],
        });
      }
      map.get(meta.id).items.push(item);
    });

    // Sort items within each category strictly ALPHABETICALLY (A-Z)
    map.forEach((grp) => {
      grp.items.sort((a, b) => {
        const nameA = (a.canonicalName || a.name || a.displayName || '').toLowerCase();
        const nameB = (b.canonicalName || b.name || b.displayName || '').toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });
    });

    // Sort categories by predefined clinical hierarchy
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [results]);

  // Toggle Category Collapsed / Expanded
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleExpandAll = () => {
    const next = {};
    categorizedGroups.forEach((g) => {
      next[g.id] = true;
    });
    setExpandedCategories(next);
  };

  const handleCollapseAll = () => {
    setExpandedCategories({});
  };

  // Flatten currently visible items for seamless keyboard navigation (ArrowUp, ArrowDown, Enter)
  const flattenedVisibleItems = useMemo(() => {
    const list = [];
    const isSearching = searchTerm.trim().length > 0;
    categorizedGroups.forEach((grp) => {
      const isExpanded = isSearching ? expandedCategories[grp.id] !== false : !!expandedCategories[grp.id];
      if (isExpanded) {
        grp.items.forEach((item) => {
          list.push(item);
        });
      }
    });
    return list;
  }, [categorizedGroups, expandedCategories, searchTerm]);

  // Keyboard Navigation: Esc, ArrowUp, ArrowDown, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flattenedVisibleItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flattenedVisibleItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flattenedVisibleItems[selectedIndex]) {
          handleSelectProduct(flattenedVisibleItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flattenedVisibleItems, selectedIndex, onClose]);

  const handleSelectProduct = (product) => {
    triggerHaptic('selection');
    const targetSlug = product.slug || product.id;
    if (targetSlug) {
      onClose();
      const queryParams = new URLSearchParams();
      if (currentSupplier) {
        queryParams.set('supplier', currentSupplier.toLowerCase());
      }
      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      router.push(`/p/${encodeURIComponent(targetSlug)}${qs}`);
    }
  };

  if (!isOpen) return null;

  const isSearching = searchTerm.trim().length > 0;
  let globalItemIndex = 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.60)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 16px 16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '76vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Cloud Header Bar */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ffffff',
          }}
        >
          <Search size={18} style={{ color: '#003666', flexShrink: 0 }} />

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              isSpanish
                ? 'Buscar ficha técnica de péptido... (ej. BPC-157, Tirzepatide, NAD+)'
                : 'Search peptide datasheets... (e.g. BPC-157, Tirzepatide, NAD+)'
            }
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.94rem',
              fontWeight: 600,
              color: '#0f172a',
            }}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                performSearch('');
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}

          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              letterSpacing: '0.5px',
            }}
          >
            ESC
          </div>
        </div>

        {/* Category Controls Strip */}
        {categorizedGroups.length > 0 && !loading && (
          <div
            style={{
              padding: '6px 14px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Layers size={13} color="#003666" />
              <span>
                {categorizedGroups.length} {isSpanish ? 'Categorías' : 'Categories'} • {results.length}{' '}
                {isSpanish ? 'Compuestos' : 'Compounds'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExpandAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#003666',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 700,
                  fontSize: '0.70rem',
                }}
              >
                {isSpanish ? 'Desplegar Todo' : 'Expand All'}
              </button>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600,
                  fontSize: '0.70rem',
                }}
              >
                {isSpanish ? 'Plegar Todo' : 'Collapse All'}
              </button>
            </div>
          </div>
        )}

        {/* Results Container */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {loading ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  border: '2px solid #e2e8f0',
                  borderTopColor: '#003666',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '8px',
                }}
              />
              <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
                {isSpanish ? 'Consultando índice científico Algolia...' : 'Querying Algolia clinical index...'}
              </div>
            </div>
          ) : categorizedGroups.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <FlaskConical size={28} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {isSpanish ? 'No se encontraron resultados' : 'No matching compounds found'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {isSpanish
                  ? 'Prueba con otro término como BPC-157, Tirzepatide, NAD+ o GHK-Cu'
                  : 'Try searching for BPC-157, Tirzepatide, NAD+, or GHK-Cu'}
              </div>
            </div>
          ) : (
            categorizedGroups.map((grp) => {
              const isExpanded = isSearching ? expandedCategories[grp.id] !== false : !!expandedCategories[grp.id];
              const IconComp = grp.icon || FlaskConical;
              const title = isSpanish ? grp.labelEs : grp.label;

              return (
                <div
                  key={grp.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isExpanded ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: isExpanded ? '0 2px 8px rgba(0, 54, 102, 0.05)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Category Header Bar (~40px) */}
                  <div
                    onClick={() => toggleCategory(grp.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isExpanded ? '#f0f7ff' : '#f8fafc',
                      borderBottom: isExpanded ? '1px solid #e0f2fe' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: grp.badgeBg,
                          border: `1px solid ${grp.badgeBorder}`,
                          color: grp.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComp size={13} />
                      </div>

                      <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
                        {title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '12px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                        }}
                      >
                        {grp.items.length} {isSpanish ? 'compuestos' : 'compounds'}
                      </span>

                      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>

                  {/* Items List (Visible only when category is expanded) */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {grp.items.map((item) => {
                        const currentIndex = globalItemIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        const isCurrent = item.slug === currentSlug;
                        const name = item.canonicalName || item.name || item.displayName || 'Compound';
                        const subtitle = formatProductSubtitle(item, isSpanish);
                        const purity = item.purity || '≥99.0% RP-HPLC';

                        return (
                          <div
                            key={item.id || item.slug || currentIndex}
                            onClick={() => handleSelectProduct(item)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                              borderLeft: isSelected ? '3px solid #003666' : '3px solid transparent',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              transition: 'all 0.1s ease',
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: '0.84rem',
                                    fontWeight: 800,
                                    color: isSelected ? '#003666' : '#0f172a',
                                  }}
                                >
                                  {name}
                                </span>

                                {isCurrent && (
                                  <span
                                    style={{
                                      fontSize: '0.64rem',
                                      fontWeight: 800,
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      background: '#e2e8f0',
                                      color: '#475569',
                                    }}
                                  >
                                    {isSpanish ? 'Actual' : 'Current'}
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#64748b',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  marginTop: '2px',
                                }}
                              >
                                {subtitle}
                              </div>
                            </div>

                            {/* Purity & Arrow */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  color: '#16a34a',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <ShieldCheck size={11} />
                                <span>{purity}</span>
                              </span>

                              <ArrowRight
                                size={13}
                                style={{
                                  color: isSelected ? '#003666' : '#cbd5e1',
                                  transform: isSelected ? 'translateX(2px)' : 'none',
                                  transition: 'transform 0.15s ease',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Google Cloud Footer Hints */}
        <div
          style={{
            padding: '8px 16px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.70rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>
              <strong style={{ color: '#334155' }}>↑↓</strong> {isSpanish ? 'Navegar' : 'Navigate'}
            </span>
            <span>
              <strong style={{ color: '#334155' }}>↵</strong> {isSpanish ? 'Abrir ficha' : 'Open datasheet'}
            </span>
            <span>
              <strong style={{ color: '#334155' }}>ESC</strong> {isSpanish ? 'Cerrar' : 'Close'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#003666', fontWeight: 800 }}>
            <Sparkles size={11} />
            <span>Atlas Algolia Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
