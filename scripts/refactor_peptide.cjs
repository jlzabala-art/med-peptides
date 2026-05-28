const fs = require('fs');

let content = fs.readFileSync('src/templates/PeptideCollectionPage.jsx', 'utf8');

// 1. Añadir importaciones
content = content.replace(
  `import '../styles/peptide_collection.css';`,
  `import '../styles/peptide_collection.css';\nimport '../styles/collection_shared.css';\nimport CollectionHeader from '../components/collection/CollectionHeader';\nimport GoalCard from '../components/collection/GoalCard';\nimport CollectionSidebar, { SidebarSection } from '../components/collection/CollectionSidebar';\nimport FilterDrawer from '../components/collection/FilterDrawer';\nimport SharedChip from '../components/collection/SharedChip';`
);

// 2. Reemplazar la sección topbar y el cat-selector por CollectionHeader y GoalCard Grid
// En lugar de regex complejas, reemplazaremos el return completo de PeptideCollectionPage.
// Buscamos "return (" en la línea 555 y reemplazamos hasta el fin de la función.
const returnStartIndex = content.indexOf('  return (\n    <div className="pc-page">');

if (returnStartIndex > -1) {
  const replacement = `  return (
    <div className="pc-page">
      <CollectionHeader 
        title="Peptide Catalog"
        subtitle={loading ? 'Loading research-grade peptides...' : \`Browse \${allPeptides.length} research-grade peptides\`}
        searchQuery={activeFilters.search}
        onSearchChange={(val) => { setPage(1); setActiveFilters(prev => ({ ...prev, search: val })); }}
        searchPlaceholder="Search peptides by name or biological goal..."
        actions={
          <div className="pc-view-toggle">
            <button
              id="pc-view-grid"
              className={\`pc-view-btn\${viewMode === 'grid' ? ' active' : ''}\`}
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              id="pc-view-list"
              className={\`pc-view-btn\${viewMode === 'list' ? ' active' : ''}\`}
              aria-label="List view"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        }
      />

      <div className="col-layout">
        {/* SIDEBAR */}
        {loading ? <SidebarSkeleton /> : (
          <CollectionSidebar>
            {categoryOptions.length > 0 && (
              <SidebarSection title="Biological Goals">
                {categoryOptions.map(([cat, count]) => (
                  <SharedChip 
                    key={cat}
                    label={\`\${cat} (\${count})\`}
                    isActive={activeFilters.category === cat}
                    onClick={() => toggleCategory(cat)}
                  />
                ))}
              </SidebarSection>
            )}
            
            {formOptions.length > 0 && (
              <SidebarSection title="Administration Form">
                {formOptions.map(([form, count]) => (
                  <SharedChip 
                    key={form}
                    label={\`\${form} (\${count})\`}
                    isActive={activeFilters.forms.includes(form)}
                    onClick={() => toggleFilter('forms', form)}
                  />
                ))}
              </SidebarSection>
            )}

            {tagOptions.length > 0 && (
              <SidebarSection title="Research Tags">
                {tagOptions.map(([tag, count]) => (
                  <SharedChip 
                    key={tag}
                    label={\`\${formatTagName(tag)} (\${count})\`}
                    isActive={activeFilters.tags.includes(tag)}
                    onClick={() => toggleFilter('tags', tag)}
                  />
                ))}
              </SidebarSection>
            )}
            
            {hasActiveFilters && (
              <button className="pc-clear-link" onClick={clearAllFilters} style={{ marginTop: '1rem' }}>
                Clear all filters
              </button>
            )}
          </CollectionSidebar>
        )}

        {/* MAIN CONTENT */}
        <main className="col-main">
          
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="pc-active-filters" style={{ marginBottom: '2rem' }}>
              {activeFilters.category && (
                <button className="pc-active-pill" onClick={() => toggleCategory(activeFilters.category)}>
                  {activeFilters.category} <X size={12} />
                </button>
              )}
              {activeFilters.forms.map(form => (
                <button key={form} className="pc-active-pill" onClick={() => toggleFilter('forms', form)}>
                  {form} <X size={12} />
                </button>
              )}
              {activeFilters.tags.map(tag => (
                <button key={tag} className="pc-active-pill" onClick={() => toggleFilter('tags', tag)}>
                  {formatTagName(tag)} <X size={12} />
                </button>
              )}
              {activeFilters.search && (
                <button className="pc-active-pill" onClick={() => { setPage(1); setActiveFilters(prev => ({ ...prev, search: '' })); }}>
                  "{activeFilters.search}" <X size={12} />
                </button>
              )}
              <button className="pc-active-pill pc-active-pill--clear" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          )}

          {/* Biological Goals Grid (Only show if no category is selected) */}
          {!activeFilters.category && categoryOptions.length > 0 && !activeFilters.search && (
            <div className="col-goal-grid">
              {categoryOptions.map(([cat, count]) => {
                const getIcon = (c) => {
                  const cl = c.toLowerCase();
                  if (cl.includes('metabolic')) return Zap;
                  if (cl.includes('recovery'))  return Activity;
                  if (cl.includes('longevity')) return Sparkles;
                  if (cl.includes('cognitive')) return Brain;
                  if (cl.includes('hormonal'))  return Droplets;
                  if (cl.includes('sleep'))     return Moon;
                  if (cl.includes('immune'))    return Shield;
                  return FlaskConical;
                };
                
                // Extraer el color desde CATEGORY_COLOR local (copiado del original)
                const getCategoryColor = (c) => {
                  const CATEGORY_COLOR = {
                    'Metabolic & Weight':      '#16A34A',
                    'Recovery & Repair':       '#EC4899',
                    'Longevity & Anti-Aging':  '#6D28D9',
                    'Cognitive & Mood':        '#0891B2',
                    'Hormonal Optimization':   '#EA580C',
                    'Sleep & Circadian':       '#4F46E5',
                    'Immune Support':          '#059669',
                    'Research Supplies':       '#DB2777',
                    'Other Research Peptides': '#0096CC',
                  };
                  const key = Object.keys(CATEGORY_COLOR).find(k => c.toLowerCase().includes(k.split(' ')[0].toLowerCase()));
                  return key ? CATEGORY_COLOR[key] : '#0096CC';
                };

                return (
                  <GoalCard 
                    key={cat}
                    title={cat}
                    count={count}
                    icon={getIcon(cat)}
                    color={getCategoryColor(cat)}
                    onClick={() => toggleCategory(cat)}
                    isActive={activeFilters.category === cat}
                  />
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="pc-result-count">
              {loading ? '...' : \`\${filteredPeptides.length} peptides\`}
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                className="pc-sort-select"
                value={activeFilters.sort}
                onChange={e => { setPage(1); setActiveFilters(prev => ({ ...prev, sort: e.target.value })); }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                className="pc-mobile-filter-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={15} />
                <span className="pc-filter-badge-mobile">Filters</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="pc-empty">
              <FlaskConical size={40} className="pc-empty-icon" />
              <p className="pc-empty-title">Could not load peptides</p>
              <p className="pc-empty-sub">{error}</p>
            </div>
          )}

          {!error && (
            <>
              <div className={\`pc-grid\${viewMode === 'list' ? ' list-view' : ''}\`}>
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                  : displayPeptides.map(p => (
                      <PeptideCard
                        key={p.id}
                        peptide={p}
                        listView={viewMode === 'list'}
                        onClick={() => handleCardClick(p)}
                      />
                    ))
                }
              </div>

              {!loading && filteredPeptides.length === 0 && (
                <div className="pc-empty">
                  <FlaskConical size={40} className="pc-empty-icon" />
                  <p className="pc-empty-title">No peptides found</p>
                  <p className="pc-empty-sub">Try adjusting your filters or search term.</p>
                  <button className="pc-load-more-btn" style={{ marginTop: '0.5rem' }} onClick={clearAllFilters}>
                    Clear filters
                  </button>
                </div>
              )}

              {!loading && hasMore && (() => {
                const remaining = filteredPeptides.length - displayPeptides.length;
                if (remaining <= 0) return null;
                const label = remaining === 1 ? 'Load 1 More Peptide' : \`Load \${remaining} More Peptides\`;
                return (
                  <div className="pc-load-more-wrap">
                    <p className="pc-progress-text">
                      Showing {displayPeptides.length} of {filteredPeptides.length} peptides
                    </p>
                    <button
                      id="pc-load-more"
                      className="pc-load-more-btn"
                      onClick={() => setPage(p => p + 1)}
                    >
                      {label}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })()}

              {!loading && !hasMore && filteredPeptides.length > 0 && (
                <p className="pc-progress-text" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                  All {filteredPeptides.length} peptides loaded
                </p>
              )}
            </>
          )}
        </main>
      </div>

      <FilterDrawer 
        isOpen={showMobileFilters} 
        onClose={() => setShowMobileFilters(false)}
        title="Biological Goals & Filters"
      >
        {categoryOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Category</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categoryOptions.map(([cat, count]) => (
                <SharedChip 
                  key={cat}
                  label={\`\${cat} (\${count})\`}
                  isActive={activeFilters.category === cat}
                  onClick={() => toggleCategory(cat)}
                />
              ))}
            </div>
          </div>
        )}

        {formOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Form</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formOptions.map(([form, count]) => (
                <SharedChip 
                  key={form}
                  label={\`\${form} (\${count})\`}
                  isActive={activeFilters.forms.includes(form)}
                  onClick={() => toggleFilter('forms', form)}
                />
              ))}
            </div>
          </div>
        )}

        {tagOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={\`\${formatTagName(tag)} (\${count})\`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleFilter('tags', tag)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pc-modal-footer" style={{ marginTop: 'auto' }}>
          <button className="pc-modal-apply" onClick={() => setShowMobileFilters(false)}>
            Show {filteredPeptides.length} peptides
          </button>
        </div>
      </FilterDrawer>
    </div>
  );
}

// Retain the CategorySelector code just in case, but we don't render it.
/* ── CategorySelector (Primary Filter) ────────────────── */
function CategorySelector({ options, activeCategory, onToggle }) {
  const getIcon = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('metabolic')) return <Zap size={24} className="pc-cat-icon" />;
    if (c.includes('recovery'))  return <Activity size={24} className="pc-cat-icon" />;
    if (c.includes('longevity')) return <Sparkles size={24} className="pc-cat-icon" />;
    if (c.includes('cognitive')) return <Brain size={24} className="pc-cat-icon" />;
    if (c.includes('hormonal'))  return <Droplets size={24} className="pc-cat-icon" />;
    if (c.includes('sleep'))     return <Moon size={24} className="pc-cat-icon" />;
    if (c.includes('immune'))    return <Shield size={24} className="pc-cat-icon" />;
    return <FlaskConical size={24} className="pc-cat-icon" />;
  };

  const getColor = (cat) => {
    const CATEGORY_COLOR = {
      'Metabolic & Weight':      '#16A34A', // green-600
      'Recovery & Repair':       '#EC4899', // pink-600
      'Longevity & Anti-Aging':  '#6D28D9', // violet-700
      'Cognitive & Mood':        '#0891B2', // cyan-600
      'Hormonal Optimization':   '#EA580C', // orange-600
      'Sleep & Circadian':       '#4F46E5', // indigo-600
      'Immune Support':          '#059669', // emerald-600
      'Research Supplies':       '#DB2777', // pink-600 (admin)
      'Other Research Peptides': '#0096CC', // blue
    };
    const key = Object.keys(CATEGORY_COLOR).find(k => cat.toLowerCase().includes(k.split(' ')[0].toLowerCase()));
    return key ? CATEGORY_COLOR[key] : '#0096CC';
  };

  return (
    <div className="pc-cat-grid">
      {options.map(([cat, count]) => (
        <div
          key={cat}
          className={\`pc-cat-card \${activeCategory === cat ? 'active' : ''}\`}
          style={{ '--cat-color': getColor(cat) }}
          onClick={() => onToggle(cat)}
        >
          <div className="pc-cat-card-icon">{getIcon(cat)}</div>
          <span className="pc-cat-card-label">{cat}</span>
          <span className="pc-cat-card-count">{count}</span>
        </div>
      ))}
    </div>
  );
}
`;

  // Remover lo que sigue de returnStartIndex
  let finalContent = content.substring(0, returnStartIndex) + replacement;

  // Evitar componente duplicado CategorySelector en original:
  const catSelectorStart = finalContent.lastIndexOf('/* ── CategorySelector');
  if (catSelectorStart > -1) {
      finalContent = finalContent.substring(0, catSelectorStart);
  }

  fs.writeFileSync('src/templates/PeptideCollectionPage.jsx', finalContent, 'utf8');
  console.log("Refactoring complete");
} else {
  console.error("Could not find the return statement");
}
