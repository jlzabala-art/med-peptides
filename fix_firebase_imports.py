import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find imports like: import { auth, db } from '../../firebase';
    # Or import { db, functions, auth, storage } from '../firebase';
    pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]([^\'"]*firebase)[\'"];')
    
    def replacer(match):
        imported_vars = [v.strip() for v in match.group(1).split(',')]
        import_path = match.group(2)
        
        # If it's just importing something from firebase/something else, skip
        if 'firebase/auth' in import_path or 'firebase/firestore' in import_path or 'firebase-admin' in import_path:
            return match.group(0)

        lines = [f"import * as fb from '{import_path}';"]
        for var in imported_vars:
            if var:
                lines.append(f"const {var} = fb?.{var};")
        return '\n'.join(lines)
    
    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        print(f"Updated {filepath}")
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done")
