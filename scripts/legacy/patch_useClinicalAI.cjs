const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/shared/ClinicalAssistant/useClinicalAI.js');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [dynamicPageContext, setDynamicPageContext] = useState(null);')) {
  code = code.replace(
    'const [sessionIntents, setSessionIntents] = useState([]);',
    `const [sessionIntents, setSessionIntents] = useState([]);\n  const [dynamicPageContext, setDynamicPageContext] = useState(null);\n\n  useEffect(() => {\n    const handler = (e) => setDynamicPageContext(e.detail);\n    window.addEventListener('UPDATE_GLOBAL_CONTEXT', handler);\n    return () => window.removeEventListener('UPDATE_GLOBAL_CONTEXT', handler);\n  }, []);`
  );
  
  code = code.replace(
    '...externalPageContext',
    '...externalPageContext,\n            ...(dynamicPageContext || {})'
  );
  
  fs.writeFileSync(file, code);
  console.log('useClinicalAI patched successfully');
}
