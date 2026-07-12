const fs = require('fs');
const file = './src/sections/EternaDiagnosticsShowcase.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add the CSS styles
const cssInject = `
          {/* Section Header */}
          <style>{` + "`" + `
            .eterna-desktop-tabs { display: block; }
            .eterna-mobile-accordion { display: none; }
            @media (max-width: 768px) {
              .eterna-desktop-tabs { display: none; }
              .eterna-mobile-accordion { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; }
            }
          ` + "`" + `}</style>
`;
content = content.replace('{/* Section Header */}', cssInject);

// Extract the 3 tabs content
// I will just use regex to replace the AnimatePresence block and the Tab selectors block

const desktopBlock = `
              <div className="eterna-desktop-tabs">
                {/* App Tab selectors */}
                <div style={{
                  display: 'flex',
                  background: 'var(--background)',
                  padding: '0.3rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  marginBottom: '1.75rem'
                }}>
                  {[
                    { id: 'aging', label: 'Rate of Aging', icon: <Dna size={14} /> },
                    { id: 'wearables', label: 'Wearable Sync', icon: <Activity size={14} /> },
                    { id: 'biomarkers', label: 'Biomarkers', icon: <FileText size={14} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem 0.5rem',
                        borderRadius: '8px',
                        background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                        color: activeTab === tab.id ? '#a855f7' : 'var(--text-muted)',
                        border: activeTab === tab.id ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid transparent',
                        fontSize: '0.78rem',
                        fontWeight: activeTab === tab.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ minHeight: '260px', position: 'relative' }}>
                  <AnimatePresence mode="wait">
                    {activeTab === 'aging' && renderAgingContent()}
                    {activeTab === 'wearables' && renderWearablesContent()}
                    {activeTab === 'biomarkers' && renderBiomarkersContent()}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile Accordion */}
              <div className="eterna-mobile-accordion">
                {[
                  { id: 'aging', label: 'Rate of Aging', icon: <Dna size={16} />, content: renderAgingContent },
                  { id: 'wearables', label: 'Wearable Sync', icon: <Activity size={16} />, content: renderWearablesContent },
                  { id: 'biomarkers', label: 'Biomarkers', icon: <FileText size={16} />, content: renderBiomarkersContent }
                ].map(tab => (
                  <div key={tab.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    background: 'var(--background)',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: activeTab === tab.id ? '#a855f7' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight size={16} style={{ 
                        transform: activeTab === tab.id ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} />
                    </button>
                    <AnimatePresence>
                      {activeTab === tab.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div style={{ padding: '0 1.25rem 1.25rem' }}>
                            {tab.content()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
`;

// Now let's extract the actual content.

// Find App Tab selectors index
const selectorsStart = content.indexOf('{/* App Tab selectors */}');
const selectorsEnd = content.indexOf('{/* Dashboard Action Footer */}');

if (selectorsStart === -1 || selectorsEnd === -1) {
  console.log("Could not find selectors blocks");
  process.exit(1);
}

// I will just replace the whole section from {/* App Tab selectors */} to {/* Dashboard Action Footer */}
const blockToReplace = content.substring(selectorsStart, selectorsEnd);

// I need to extract the JSX for Aging, Wearables, and Biomarkers.
// Let's use regex to grab the insides.

const extractContent = (tabId) => {
  const startTag = `{/* Tab ${tabId} */}`;
  // actually it is {/* Tab 1: Aging Pace */}
  // let's just grab the whole block inside the motion.div
  return "";
}

// Wait, doing this via script string manipulation might be flaky for big JSX trees. Let's do it cleanly by writing out the exact file replacements using sed or just generating a new file with the modifications.

fs.writeFileSync('test.log', 'script ran');
