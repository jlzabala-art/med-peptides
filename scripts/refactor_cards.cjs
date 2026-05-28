const fs = require('fs');

function refactorPeptides() {
  let content = fs.readFileSync('src/templates/PeptideCollectionPage.jsx', 'utf8');
  
  // Add import
  if (!content.includes('ProductCard')) {
    content = content.replace(
      `import SharedChip from '../components/collection/SharedChip';`,
      `import SharedChip from '../components/collection/SharedChip';\nimport ProductCard, { SkeletonCard } from '../components/collection/ProductCard';`
    );
  }

  // Update grid
  content = content.replace(
    /className=\{\`pc-grid\$\{viewMode === 'list' \? ' list-view' : ''\}\`\}/g,
    `className={\`col-grid \${viewMode === 'list' ? 'list-view' : ''}\`}`
  );

  // Replace PeptideCard usage
  content = content.replace(
    /<PeptideCard[\s\S]*?onClick=\{\(\) => handleCardClick\(p\)\}[\s\S]*?\/>/g,
    `<ProductCard
                        key={p.id}
                        title={p.name}
                        subtitle={p.role}
                        tags={p.tags}
                        color={p.color}
                        badge={p.isPopular ? { text: 'Popular', type: 'popular' } : p.isNew ? { text: 'New', type: 'new' } : null}
                        footerLeft={p.dosage}
                        viewMode={viewMode}
                        onClick={() => handleCardClick(p)}
                      />`
  );

  // Remove SkeletonCard and PeptideCard components
  const skeletonIndex = content.indexOf('function SkeletonCard');
  if (skeletonIndex > -1) {
    // Assuming these functions are at the very bottom
    content = content.substring(0, skeletonIndex);
  } else {
    const cardIndex = content.indexOf('function PeptideCard');
    if (cardIndex > -1) content = content.substring(0, cardIndex);
  }
  
  fs.writeFileSync('src/templates/PeptideCollectionPage.jsx', content, 'utf8');
}

function refactorSupplements() {
  let content = fs.readFileSync('src/templates/SupplementCollectionPage.jsx', 'utf8');
  
  // Add import
  if (!content.includes('ProductCard')) {
    content = content.replace(
      `import SharedChip from '../components/collection/SharedChip';`,
      `import SharedChip from '../components/collection/SharedChip';\nimport ProductCard, { SkeletonCard } from '../components/collection/ProductCard';`
    );
  }

  // Update grid
  content = content.replace(
    /className=\{\`pc-grid\$\{viewMode === 'list' \? ' list-view' : ''\}\`\}/g,
    `className={\`col-grid \${viewMode === 'list' ? 'list-view' : ''}\`}`
  );

  // Replace SupplementCard usage
  content = content.replace(
    /<SupplementCard[\s\S]*?onClick=\{\(\) => handleCardClick\(p\)\}[\s\S]*?\/>/g,
    `<ProductCard
                        key={p.id}
                        title={p.name}
                        subtitle={p.role}
                        description={p.description}
                        tags={p.tags}
                        color={p.color}
                        badge={p.isPopular ? { text: 'Popular', type: 'popular' } : null}
                        footerLeft={p.dosage || p.quantity || ' '}
                        viewMode={viewMode}
                        onClick={() => handleCardClick(p)}
                      />`
  );

  // Remove SkeletonCard and SupplementCard components
  const skeletonIndex = content.indexOf('/* ── SkeletonCard ── */');
  if (skeletonIndex > -1) {
    content = content.substring(0, skeletonIndex);
  }
  
  fs.writeFileSync('src/templates/SupplementCollectionPage.jsx', content, 'utf8');
}

function refactorProtocols() {
  let content = fs.readFileSync('src/templates/ProtocolCollectionPage.jsx', 'utf8');
  
  // Add import
  if (!content.includes('ProductCard')) {
    content = content.replace(
      `import SharedChip from '../components/collection/SharedChip';`,
      `import SharedChip from '../components/collection/SharedChip';\nimport ProductCard, { SkeletonCard } from '../components/collection/ProductCard';`
    );
  }

  // Update grid
  content = content.replace(
    /className=\{\`prc-grid prc-grid--\$\{viewMode\}\`\}/g,
    `className={\`col-grid \${viewMode === 'list' ? 'list-view' : ''}\`}`
  );

  // Replace ProtocolCard usage
  content = content.replace(
    /<ProtocolCard[\s\S]*?onClick=\{handleCardClick\}[\s\S]*?\/>/g,
    `<ProductCard
                        key={protocol.id || protocol.slug}
                        title={protocol.title}
                        subtitle={protocol.goalLabel}
                        tags={protocol.phases.length > 0 ? protocol.phases : protocol.compounds}
                        color={protocol.color}
                        badge={{ text: protocol.complexityConfig.label, type: 'complexity' }}
                        footerLeft={protocol.duration || ' '}
                        viewMode={viewMode}
                        onClick={() => handleCardClick(protocol)}
                      />`
  );

  // We cannot blindly truncate ProtocolCollectionPage since it has FilterSidebar and GoalSelector.
  // Instead we just remove SkeletonCard and ProtocolCard by regex
  content = content.replace(/function SkeletonCard\(\) \{[\s\S]*?\}\s*function ProtocolCard[\s\S]*?\}\s*(?=function FilterSidebar)/g, '');

  fs.writeFileSync('src/templates/ProtocolCollectionPage.jsx', content, 'utf8');
}

refactorPeptides();
refactorSupplements();
refactorProtocols();
console.log('Cards refactored successfully.');
