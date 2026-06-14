import os
import re

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Match imports like: import data from './data.json'
            # and require('./data.json')
            new_content = re.sub(r'([\'"])(.*(?:catalog\.v2|products\.v2|protocolBlueprintsV2))\.json(\1)', r'\1\2.js\3', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {filepath}')
