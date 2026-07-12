import os
import re

regex = re.compile(r"import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['\"]lucide-react/dist/esm/icons/[a-z0-9-]+['\"];?")

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = regex.findall(content)
    if not matches:
        return
        
    new_content = regex.sub('', content)
    
    new_import = f"import {{ {', '.join(matches)} }} from 'lucide-react';\n"
    
    last_import = new_content.rfind('import ')
    if last_import != -1:
        end_of_line = new_content.find('\n', last_import)
        if end_of_line == -1:
            end_of_line = len(new_content)
        new_content = new_content[:end_of_line+1] + new_import + new_content[end_of_line+1:]
    else:
        new_content = new_import + new_content
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Reverted {len(matches)} imports in {filepath}")

def walk_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                process_file(os.path.join(root, file))

print("Starting python revert...")
walk_dir('./src')
print("Done!")
