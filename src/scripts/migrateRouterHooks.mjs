import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.js') || f.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

let modifiedFiles = 0;

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace Link
  if (content.includes("import { Link } from 'react-router-dom'") || content.includes('import { Link,') || content.includes(', Link }')) {
    // Add next/link import if missing
    if (!content.includes("import Link from 'next/link'")) {
       content = "import Link from 'next/link';\n" + content;
    }
    // Remove Link from react-router-dom
    content = content.replace(/import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"];?\n?/, '');
    content = content.replace(/,\s*Link\b/, '');
    content = content.replace(/\bLink\s*,/, '');
  }

  // 2. Replace useNavigate
  if (content.includes('useNavigate')) {
    if (!content.includes("import { useRouter } from 'next/navigation'")) {
       content = "import { useRouter } from 'next/navigation';\n" + content;
    }
    content = content.replace(/import\s+{\s*([^}]*?)useNavigate([^}]*?)\s*}\s+from\s+['"]react-router-dom['"];?/g, (match, p1, p2) => {
      const rest = (p1 + p2).replace(/,\s*,/g, ',').trim().replace(/(^,)|(,$)/g, '');
      if (rest.length === 0) return '';
      return `import { ${rest} } from 'react-router-dom';`;
    });
    content = content.replace(/useNavigate\(\)/g, 'useRouter()');
    content = content.replace(/\bnavigate\(/g, 'router.push(');
    content = content.replace(/const navigate = useRouter\(\)/g, 'const router = useRouter()');
  }
  
  // 3. Replace useLocation
  if (content.includes('useLocation')) {
    if (!content.includes("import { usePathname } from 'next/navigation'")) {
       content = "import { usePathname } from 'next/navigation';\n" + content;
    }
    content = content.replace(/import\s+{\s*([^}]*?)useLocation([^}]*?)\s*}\s+from\s+['"]react-router-dom['"];?/g, (match, p1, p2) => {
      const rest = (p1 + p2).replace(/,\s*,/g, ',').trim().replace(/(^,)|(,$)/g, '');
      if (rest.length === 0) return '';
      return `import { ${rest} } from 'react-router-dom';`;
    });
    content = content.replace(/useLocation\(\)/g, 'usePathname()');
    content = content.replace(/location\.pathname/g, 'pathname');
    content = content.replace(/const location = usePathname\(\)/g, 'const pathname = usePathname()');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated routing hooks in: ${filePath}`);
  }
});

console.log(`Migration script finished. Modified ${modifiedFiles} files.`);
