import re
import os

target_dirs = ['src/routes', 'src/templates']

pattern = r'const\s+([A-Za-z0-9_]+)\s*=\s*React\.lazy\(\s*\(\)\s*=>\s*import\([\'"]([^\'"]+)[\'"]\)\s*\);?'

for directory in target_dirs:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = re.sub(pattern, lambda m: f"import {m.group(1)} from '{m.group(2)}';", content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")

print("Replaced all React.lazy imports globally.")
