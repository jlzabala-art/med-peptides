import fs from 'fs';

const file = './src/sections/EternaDiagnosticsShowcase.jsx';
let content = fs.readFileSync(file, 'utf8');

const agingStart = content.indexOf('{/* Tab 1: Aging Pace */}');
const agingEnd = content.indexOf('{/* Tab 2: Wearable Sync */}');
let agingJSX = content.substring(content.indexOf('<div', agingStart), content.indexOf('</motion.div>', agingStart));
agingJSX = agingJSX.trim() + '\n                    </div>'; // close the div

const wearableStart = content.indexOf('{/* Tab 2: Wearable Sync */}');
const wearableEnd = content.indexOf('{/* Tab 3: Biomarkers */}');
let wearableJSX = content.substring(content.indexOf('<div', wearableStart), content.indexOf('</motion.div>', wearableStart));
wearableJSX = wearableJSX.trim() + '\n                    </div>';

const biomarkerStart = content.indexOf('{/* Tab 3: Biomarkers */}');
const biomarkerEnd = content.indexOf('</AnimatePresence>');
let biomarkerJSX = content.substring(content.indexOf('<div', biomarkerStart), content.indexOf('</motion.div>', biomarkerStart));
biomarkerJSX = biomarkerJSX.trim() + '\n                    </div>';

// Now replace motion.div content with function calls
let newContent = content;

const useMediaQueryStr = `
function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}
`;

if (!newContent.includes('useMediaQuery')) {
  newContent = newContent.replace('export default function', useMediaQueryStr + '\nexport default function');
}

newContent = newContent.replace('const [activeTab, setActiveTab] = useState(\'aging\');', 'const [activeTab, setActiveTab] = useState(\'aging\');\n  const isMobile = useMediaQuery(\'(max-width: 768px)\');');

// Create the render functions
const renderFunctions = `
  const renderAgingContent = () => (
    ${agingJSX}
  );

  const renderWearablesContent = () => (
    ${wearableJSX}
  );

  const renderBiomarkersContent = () => (
    ${biomarkerJSX}
  );
`;

newContent = newContent.replace('return (', renderFunctions + '\n  return (');

// Now rewrite the entire App Interface Mockup
const uiStart = newContent.indexOf('{/* App Tab selectors */}');
const uiEnd = newContent.indexOf('{/* Dashboard Action Footer */}');

const newUI = `
              {!isMobile ? (
                <>
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

                  {/* Dynamic App content screen */}
                  <div style={{ minHeight: '260px', position: 'relative' }}>
                    <AnimatePresence mode="wait">
                      {activeTab === 'aging' && (
                        <motion.div key="aging" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderAgingContent()}
                        </motion.div>
                      )}
                      {activeTab === 'wearables' && (
                        <motion.div key="wearables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderWearablesContent()}
                        </motion.div>
                      )}
                      {activeTab === 'biomarkers' && (
                        <motion.div key="biomarkers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderBiomarkersContent()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Mobile Accordion */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
              )}

              `;

newContent = newContent.substring(0, uiStart) + newUI + newContent.substring(uiEnd);

fs.writeFileSync(file, newContent, 'utf8');
console.log('Done refactoring');
