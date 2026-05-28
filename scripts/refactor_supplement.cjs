const fs = require('fs');

let content = fs.readFileSync('src/templates/SupplementCollectionPage.jsx', 'utf8');

// 1. Añadir importaciones y css
content = content.replace(
  `import '../styles/peptide_collection.css'; // reuse existing styles`,
  `import '../styles/peptide_collection.css';\nimport '../styles/collection_shared.css';\nimport CollectionHeader from '../components/collection/CollectionHeader';\nimport GoalCard from '../components/collection/GoalCard';\nimport CollectionSidebar, { SidebarSection } from '../components/collection/CollectionSidebar';\nimport FilterDrawer from '../components/collection/FilterDrawer';\nimport SharedChip from '../components/collection/SharedChip';`
);

// 2. Modificar la función `normalizeProduct`
// Cambiar el uso de cat a "goal"
content = content.replace(
  `  const cat = CATEGORY_COLOR[s.category] ? s.category : 'Other';`,
  `  // Normalize goals (using primary goal or first goal)
  const primaryGoal = Array.isArray(s.goals) && s.goals.length > 0 ? s.goals[0] : (s.category || 'Other');`
);
content = content.replace(
  `  const color = getCategoryColor(cat);`,
  `  // TODO: Use ecosystem colors
  const color = getCategoryColor(primaryGoal);`
);
content = content.replace(
  `  const tags = rawTags.length ? rawTags.slice(0, 3) : [cat.split('&')[0].trim()];`,
  `  const tags = rawTags.length ? rawTags.slice(0, 3) : [primaryGoal.split('&')[0].trim()];`
);
content = content.replace(
  `    role:        s.objective || s.desc?.slice(0, 60) || cat,`,
  `    role:        s.objective || s.desc?.slice(0, 60) || primaryGoal,`
);
content = content.replace(
  `    category:    cat,`,
  `    category:    primaryGoal, // Keep for backward compatibility of card`
);


// 3. Modificar el return de SupplementCollectionPage
const returnStartIndex = content.indexOf('  return (\n    <div className="pc-page">');

if (returnStartIndex > -1) {
  const replacement = `  return (
    <div className="pc-page">
      <CollectionHeader 
        title="Supplement Catalog"
        subtitle={loading ? 'Loading supplements...' : \`Browse \${allSupplements.length} active supplements\`}
        searchQuery={activeFilters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search supplements by name or goal..."
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

          {tagOptions.length > 0 && (
            <SidebarSection title="Specific Tags">
              {tagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={\`\${tag} (\${count})\`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
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
              {activeFilters.tags.map(tag => (
                <button key={tag} className="pc-active-pill" onClick={() => toggleTag(tag)}>
                  {tag} <X size={12} />
                </button>
              ))}
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
                  return Leaf;
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
              {loading ? '...' : \`\${filteredSupplements.length} supplements\`}
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                className="pc-sort-select"
                value={activeFilters.sort}
                onChange={e => { setPage(1); setActiveFilters(prev => ({ ...prev, sort: e.target.value })); }}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="popular">Most Popular</option>
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

          <div className={\`pc-grid\${viewMode === 'list' ? ' list-view' : ''}\`}>
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : displaySupplements.map(p => (
                  <SupplementCard
                    key={p.id}
                    item={p}
                    listView={viewMode === 'list'}
                    onClick={() => handleCardClick(p)}
                  />
                ))
            }
          </div>

          {!loading && filteredSupplements.length === 0 && (
            <div className="pc-empty">
              <Leaf size={40} className="pc-empty-icon" />
              <p className="pc-empty-title">No supplements found</p>
              <p className="pc-empty-sub">Try adjusting your filters or search term.</p>
              <button className="pc-load-more-btn" style={{ marginTop: '0.5rem' }} onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && hasMore && (() => {
            const remaining = filteredSupplements.length - displaySupplements.length;
            const label = remaining === 1 ? 'Load 1 More' : \`Load \${remaining} More\`;
            return (
              <div className="pc-load-more-wrap">
                <p className="pc-progress-text">
                  Showing {displaySupplements.length} of {filteredSupplements.length} supplements
                </p>
                <button id="supplement-load-more" className="pc-load-more-btn" onClick={() => setPage(p => p + 1)}>
                  {label} <ArrowRight size={16} />
                </button>
              </div>
            );
          })()}

          {!loading && !hasMore && filteredSupplements.length > 0 && (
            <p className="pc-progress-text" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
              All {filteredSupplements.length} supplements loaded
            </p>
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

        {tagOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={\`\${tag} (\${count})\`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pc-modal-footer" style={{ marginTop: 'auto' }}>
          <button className="pc-modal-apply" onClick={() => setShowMobileFilters(false)}>
            Show {filteredSupplements.length} supplements
          </button>
        </div>
      </FilterDrawer>

    </div>
  );
}
`;

  // Remover lo que sigue de returnStartIndex hasta el final de la funcion SupplementCollectionPage (la ultima llave antes de SkeletonCard)
  // El texto original a reemplazar:
  const functionEndIndex = content.indexOf('/* ── SkeletonCard ── */');
  
  if (functionEndIndex > -1) {
    let finalContent = content.substring(0, returnStartIndex) + replacement + '\n\n' + content.substring(functionEndIndex);
    fs.writeFileSync('src/templates/SupplementCollectionPage.jsx', finalContent, 'utf8');
    console.log("Refactoring supplements complete");
  } else {
    console.error("Could not find SkeletonCard to truncate");
  }
} else {
  console.error("Could not find the return statement");
}
