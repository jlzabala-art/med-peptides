const fs = require('fs');

let content = fs.readFileSync('src/templates/ProtocolCollectionPage.jsx', 'utf8');

// 1. Imports
content = content.replace(
  `import '../styles/protocol_collection.css';`,
  `import '../styles/protocol_collection.css';\nimport '../styles/collection_shared.css';\nimport CollectionHeader from '../components/collection/CollectionHeader';\nimport GoalCard from '../components/collection/GoalCard';\nimport CollectionSidebar, { SidebarSection } from '../components/collection/CollectionSidebar';\nimport FilterDrawer from '../components/collection/FilterDrawer';\nimport SharedChip from '../components/collection/SharedChip';`
);

// 2. Component Return replacement
const returnStartIndex = content.indexOf('  return (\n    <div className="prc-root">');

if (returnStartIndex > -1) {
  const replacement = `  return (
    <div className="pc-page">
      <CollectionHeader 
        title="Protocol Library"
        subtitle={loading ? 'Loading protocols...' : \`Browse \${allProtocols.length} clinical protocols\`}
        searchQuery={activeFilters.search}
        onSearchChange={e => { setPage(1); setActiveFilters(prev => ({ ...prev, search: e.target.value })); }}
        searchPlaceholder="Search protocols by clinical focus..."
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
          {complexityOptions.length > 0 && (
            <SidebarSection title="Complexity">
              {complexityOptions.map(([key, count]) => {
                const cfg = COMPLEXITY_CONFIG[key] || { label: key, cssClass: key };
                return (
                  <SharedChip 
                    key={key}
                    label={\`\${cfg.label} (\${count})\`}
                    isActive={activeFilters.complexity.includes(key)}
                    onClick={() => toggleFilter('complexity', key)}
                  />
                );
              })}
            </SidebarSection>
          )}

          {compoundOptions.length > 0 && (
            <SidebarSection title="Compounds">
              {compoundOptions.map(([name, count]) => (
                <SharedChip 
                  key={name}
                  label={\`\${formatTagName(name)} (\${count})\`}
                  isActive={activeFilters.compound.includes(name)}
                  onClick={() => toggleFilter('compound', name)}
                />
              ))}
            </SidebarSection>
          )}

          {activeFilters.goal && secondaryTagOptions.length > 0 && (
            <SidebarSection title="Refine Tags">
              {secondaryTagOptions.map(([tag, count]) => (
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

        {/* MAIN CONTENT */}
        <main className="col-main">
          
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="pc-active-filters" style={{ marginBottom: '2rem' }}>
              {activeFilters.goal && (
                <button className="pc-active-pill" onClick={() => toggleGoal(activeFilters.goal)}>
                  {getGoalLabel(activeFilters.goal)} <X size={12} />
                </button>
              )}
              {activeFilters.tags.map(t => (
                <button key={t} className="pc-active-pill" onClick={() => toggleFilter('tags', t)}>
                  {formatTagName(t)} <X size={12} />
                </button>
              ))}
              {activeFilters.complexity.map(c => (
                <button key={c} className="pc-active-pill" onClick={() => toggleFilter('complexity', c)}>
                  {COMPLEXITY_CONFIG[c]?.label ?? c} <X size={12} />
                </button>
              ))}
              {activeFilters.compound.map(c => (
                <button key={c} className="pc-active-pill" onClick={() => toggleFilter('compound', c)}>
                  {formatTagName(c)} <X size={12} />
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

          {/* Biological Goals Grid (Only show if no goal is selected) */}
          {!activeFilters.goal && goalOptions.length > 0 && !activeFilters.search && (
            <div className="col-goal-grid">
              {goalOptions.map(([key, count]) => {
                const getIcon = (k) => {
                  if (k === 'metabolic_weight') return Activity;
                  if (k === 'recovery_repair') return Zap;
                  if (k === 'cognitive_mood') return Brain;
                  if (k === 'sleep_circadian') return Moon;
                  if (k === 'longevity_anti_aging') return Sparkles;
                  if (k === 'hormonal_optimization') return Droplets;
                  if (k === 'immune_support') return Shield;
                  return FlaskConical;
                };
                
                return (
                  <GoalCard 
                    key={key}
                    title={getGoalLabel(key)}
                    count={count}
                    icon={getIcon(key)}
                    color={getGoalColor(key)}
                    onClick={() => toggleGoal(key)}
                    isActive={activeFilters.goal === key}
                  />
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="pc-result-count">
              {loading ? '...' : \`\${filteredProtocols.length} protocols\`}
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

          {error ? (
            <div className="pc-empty">
              <FlaskConical size={48} className="pc-empty-icon" />
              <p className="pc-empty-title">Error loading protocols</p>
              <p className="pc-empty-sub">{error}</p>
              <button className="pc-load-more-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className={\`prc-grid prc-grid--\${viewMode}\`}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProtocols.length === 0 ? (
            <div className="pc-empty">
              <FlaskConical size={48} className="pc-empty-icon" />
              <p className="pc-empty-title">No protocols match your filters</p>
              <p className="pc-empty-sub">Try adjusting your search or clearing some filters.</p>
              {hasActiveFilters && (
                <button className="pc-load-more-btn" style={{ marginTop: '0.5rem' }} onClick={clearAllFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={\`prc-grid prc-grid--\${viewMode}\`}>
                {displayProtocols.map(protocol => (
                  <ProtocolCard
                    key={protocol.id || protocol.slug}
                    protocol={protocol}
                    viewMode={viewMode}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="pc-load-more-wrap">
                  <p className="pc-progress-text">
                    Showing {displayProtocols.length} of {filteredProtocols.length} protocols
                  </p>
                  <button
                    className="pc-load-more-btn"
                    onClick={() => setPage(p => p + 1)}
                  >
                    Load more protocols <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {!hasMore && filteredProtocols.length > 0 && (
                <p className="pc-progress-text" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                  All {filteredProtocols.length} protocols loaded
                </p>
              )}
            </>
          )}

        </main>
      </div>

      <FilterDrawer 
        isOpen={showMobileFilters} 
        onClose={() => setShowMobileFilters(false)}
        title="Protocol Filters"
      >
        {complexityOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Complexity</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {complexityOptions.map(([key, count]) => {
                const cfg = COMPLEXITY_CONFIG[key] || { label: key, cssClass: key };
                return (
                  <SharedChip 
                    key={key}
                    label={\`\${cfg.label} (\${count})\`}
                    isActive={activeFilters.complexity.includes(key)}
                    onClick={() => toggleFilter('complexity', key)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {compoundOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Compounds</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {compoundOptions.map(([name, count]) => (
                <SharedChip 
                  key={name}
                  label={\`\${formatTagName(name)} (\${count})\`}
                  isActive={activeFilters.compound.includes(name)}
                  onClick={() => toggleFilter('compound', name)}
                />
              ))}
            </div>
          </div>
        )}

        {activeFilters.goal && secondaryTagOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Refine Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {secondaryTagOptions.map(([tag, count]) => (
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
            Show {filteredProtocols.length} protocols
          </button>
        </div>
      </FilterDrawer>

    </div>
  );
}
`;

  // Remover lo que sigue de returnStartIndex hasta el final de la funcion SupplementCollectionPage (la ultima llave antes de /* ── Sub-components)
  const functionEndIndex = content.indexOf('/* ─────────────────────────────────────────────────────────────\n   FASE 3b — Sub-components');
  
  if (functionEndIndex > -1) {
    let finalContent = content.substring(0, returnStartIndex) + replacement + '\n\n' + content.substring(functionEndIndex);
    fs.writeFileSync('src/templates/ProtocolCollectionPage.jsx', finalContent, 'utf8');
    console.log("Refactoring protocols complete");
  } else {
    console.error("Could not find FASE 3b to truncate");
  }
} else {
  console.error("Could not find the return statement");
}
