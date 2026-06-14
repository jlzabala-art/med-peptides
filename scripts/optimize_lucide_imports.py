import os
import re

def to_kebab_case(name):
    # Convert PascalCase to kebab-case (e.g., FileText -> file-text)
    name = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', name).lower()

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find all import { ... } from 'lucide-react'
            # We match multi-line imports as well
            pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"];?', re.DOTALL)
            
            def replacer(match):
                icons_str = match.group(1)
                # Split by comma and remove whitespace
                icons = [i.strip() for i in icons_str.split(',') if i.strip()]
                
                # Handle aliased imports: import { Icon as Something } from 'lucide-react'
                new_imports = []
                for icon in icons:
                    if ' as ' in icon:
                        parts = icon.split(' as ')
                        original = parts[0].strip()
                        alias = parts[1].strip()
                        kebab = to_kebab_case(original)
                        new_imports.append(f"import {alias} from 'lucide-react/dist/esm/icons/{kebab}';")
                    else:
                        kebab = to_kebab_case(icon)
                        new_imports.append(f"import {icon} from 'lucide-react/dist/esm/icons/{kebab}';")
                
                return '\n'.join(new_imports)

            new_content = pattern.sub(replacer, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Optimized lucide imports in {filepath}')
