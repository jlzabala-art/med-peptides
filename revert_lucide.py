import os
import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return

    # Find all lucide imports
    pattern = re.compile(r"import\s+([A-Za-z0-9_]+)\s+from\s+['\"]lucide-react/dist/esm/icons/[a-zA-Z0-9_-]+['\"];?")
    matches = pattern.findall(content)
    
    if not matches:
        return
        
    icons = set(matches)
    
    # Remove old imports
    new_content = pattern.sub('', content)
    
    # Insert new import
    import_stmt = f"import {{ {', '.join(icons)} }} from 'lucide-react';\n"
    
    # Find insert position (after the first import or at top)
    insert_pos = 0
    lines = new_content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('import '):
            insert_pos = i + 1
            
    lines.insert(insert_pos, import_stmt)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
        
    print(f"Updated {filepath} with {len(icons)} icons")

for root, dirs, files in os.walk('src'):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
        
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')) and not file.endswith('.bak'):
            process_file(os.path.join(root, file))

print("Done!")
