import os
import re

directory = '/Users/joseluiszabala/regenpept-web.nosync/src/components'

files_changed = 0
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # We want to replace header: '' or header: "" with header: 'Actions'
            new_content = re.sub(r"(key:\s*['\"]actions['\"],\s*)header:\s*['\"]['\"]", r"\1header: 'Actions'", content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_changed += 1
                print(f'Updated {path}')

print(f'Total files updated: {files_changed}')
