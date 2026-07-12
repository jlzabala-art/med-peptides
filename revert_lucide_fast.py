import os

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        return

    new_lines = []
    lucide_icons = set()
    has_changes = False

    for line in lines:
        if 'lucide-react/dist/esm/icons/' in line:
            # line looks like: import Activity from 'lucide-react/dist/esm/icons/activity';
            parts = line.strip().split()
            if len(parts) >= 4 and parts[0] == 'import' and parts[2] == 'from':
                icon_name = parts[1].replace('{', '').replace('}', '').replace(',', '')
                lucide_icons.add(icon_name)
                has_changes = True
                continue
        new_lines.append(line)

    if has_changes:
        import_stmt = f"import {{ {', '.join(lucide_icons)} }} from 'lucide-react';\n"
        
        insert_idx = 0
        for i, l in enumerate(new_lines):
            if l.startswith('import '):
                insert_idx = i + 1
                
        new_lines.insert(insert_idx, import_stmt)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Updated {filepath} with {len(lucide_icons)} icons")

for root, dirs, files in os.walk('src'):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
        
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')) and not file.endswith('.bak'):
            process_file(os.path.join(root, file))

print("Done!")
