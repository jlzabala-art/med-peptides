const fs = require('fs');
const file = './src/sections/EternaDiagnosticsShowcase.jsx';
let content = fs.readFileSync(file, 'utf8');

// The strategy is to wrap the existing tab selectors and content in a "eterna-desktop-tabs" div
// And then append a new "eterna-mobile-accordion" div with the same content (but reformatted for accordion).
// Wait, an easier React way without duplicating DOM: just check window size!
// We can use a simple custom hook:
const useMediaQueryString = `
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

if (!content.includes('useMediaQuery')) {
  content = content.replace('export default function EternaDiagnosticsShowcase', useMediaQueryString + '\nexport default function EternaDiagnosticsShowcase');
}

// Add the state hook inside the component
content = content.replace('const [activeTab, setActiveTab] = useState(\'aging\');', 'const [activeTab, setActiveTab] = useState(\'aging\');\n  const isMobile = useMediaQuery(\'(max-width: 768px)\');');

// Replace the AnimatePresence mode="wait" to avoid exit animations conflicting if we switch tabs
// Actually, let's just conditionally render the tab selectors based on isMobile.

// Wait! It's much simpler. I will write a completely new file and overwrite it. I'll read the original, extract the 3 content blocks, and generate the clean code.
