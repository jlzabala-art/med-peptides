import os
import re
import glob

# 1. Build a mapping of ComponentName -> filename
icons_dir = 'node_modules/lucide-react/dist/esm/icons'
mapping = {}

if os.path.exists(icons_dir):
    for f in os.listdir(icons_dir):
        if f.endswith('.js'):
            basename = f[:-3] # remove .js
            # Convert kebab-case to PascalCase
            # Example: check-circle-2 -> CheckCircle2
            parts = basename.split('-')
            # Handle the specific logic for numbers
            pascal = ''
            for part in parts:
                if part.isdigit():
                    pascal += part
                else:
                    pascal += part.capitalize()
            mapping[pascal] = basename

# Handle a few special cases where the heuristic might fail
mapping['XCircle'] = 'x-circle'
mapping['CheckCircle2'] = 'check-circle-2'

# 2. Process all files
src_dir = 'src'
files = glob.glob(src_dir + '/**/*.jsx', recursive=True) + glob.glob(src_dir + '/**/*.js', recursive=True)

import_regex = re.compile(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];?")

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def replacer(match):
        imports = match.group(1).split(',')
        new_imports = []
        for imp in imports:
            imp = imp.strip()
            if not imp:
                continue
            
            # If there's an alias: import { ChevronDown as CD }
            parts = imp.split(' as ')
            if len(parts) == 2:
                original_name = parts[0].strip()
                alias = parts[1].strip()
            else:
                original_name = imp
                alias = imp
            
            filename = mapping.get(original_name)
            if not filename:
                # Fallback to simple kebab
                filename = re.sub(r'(?<!^)(?=[A-Z0-9])', '-', original_name).lower()
                
            new_imports.append(f'import {alias} from "lucide-react/dist/esm/icons/{filename}";')
        
        return '\n'.join(new_imports)

    new_content = import_regex.sub(replacer, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

print("Done optimizing lucide-react imports.")
