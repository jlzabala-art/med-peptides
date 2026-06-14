import os

files = ['src/data/v2/catalog.v2.json', 'src/data/v2/products.v2.json']

for filename in files:
    with open(filename, 'r') as f:
        content = f.read()
    
    if content.startswith('export default JSON.parse(`'):
        # content is: export default JSON.parse(`...`);
        # 'export default JSON.parse(`' is 27 chars.
        # '`);\n' or '`);' is 3 or 4 chars at the end.
        
        start_idx = 27
        end_idx = content.rfind('`')
        if end_idx != -1:
            json_content = content[start_idx:end_idx]
            with open(filename, 'w') as f:
                f.write(json_content)
            print(f'Fixed {filename}')
