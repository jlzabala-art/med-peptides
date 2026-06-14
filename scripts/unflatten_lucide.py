import os
import re
from collections import defaultdict

def unflatten_lucide_imports(root_dir):
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(subdir, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to match: import IconName from 'lucide-react/dist/esm/icons/icon-name';
                pattern = re.compile(r"import\s+([A-Za-z0-9_]+)\s+from\s+['\"]lucide-react/dist/esm/icons/[^'\"]+['\"];?")
                
                matches = pattern.findall(content)
                if not matches:
                    continue
                
                # Remove all individual imports
                new_content = pattern.sub("", content)
                
                # Remove blank lines left behind (optional, simple cleanup)
                new_content = os.linesep.join([s for s in new_content.splitlines() if s.strip() or s == ""])
                
                # Construct the combined import
                combined_import = f"import {{ {', '.join(matches)} }} from 'lucide-react';\n"
                
                # Add to the top of the file
                new_content = combined_import + new_content
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"Fixed {len(matches)} imports in {filepath}")

if __name__ == "__main__":
    unflatten_lucide_imports('./src')
