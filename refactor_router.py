import os
import re

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist.")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace imports
    if 'react-router-dom' in content:
        # Complex replacements for Link
        if re.search(r'import\s+\{[^}]*\bLink\b[^}]*\}\s+from\s+[\'"]react-router-dom[\'"]', content):
            # Just do a simplistic replacement to avoid breaking syntax, and rely on ESLint/build to catch issues
            pass
            
        content = re.sub(r'from\s+[\'"]react-router-dom[\'"]', "from 'next/navigation'", content)

    # Basic navigate replacement
    content = content.replace('useNavigate', 'useRouter')
    content = re.sub(r'const\s+navigate\s*=\s*useRouter\(\)', r'const router = useRouter()', content)
    content = re.sub(r'\bnavigate\(', r'router.push(', content)
    content = content.replace('useLocation', 'usePathname')

    if content != original_content:
        # Add "use client" if it's a component with router hooks
        if 'use client' not in content:
            content = '"use client";\n' + content
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    try:
        with open('router_files.txt', 'r') as f:
            files = [line.strip() for line in f if line.strip()]
        
        for file in files:
            process_file(file)
            
    except Exception as e:
        print(f"Error: {e}")
