import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Look for:
    # import * as fb from '...firebase';
    # const something = fb?.something;
    
    # We want to replace it with:
    # import { auth, db, storage, functions } from '...firebase';
    
    if 'import * as fb from' not in content:
        return

    # Find the import line
    import_match = re.search(r"import \* as fb from '([^']+firebase)';", content)
    if not import_match:
        return
    
    firebase_path = import_match.group(1)
    
    # Find all assignments
    assignments = re.findall(r"const\s+([a-zA-Z0-9_]+)\s*=\s*fb\?\.([a-zA-Z0-9_]+);", content)
    if not assignments:
        return
        
    # Build the new import
    imported_vars = []
    for var_name, prop_name in assignments:
        if var_name == prop_name:
            imported_vars.append(var_name)
        else:
            imported_vars.append(f"{prop_name} as {var_name}")
            
    new_import = f"import {{ {', '.join(imported_vars)} }} from '{firebase_path}';"
    
    # Replace the import
    content = content.replace(import_match.group(0), new_import)
    
    # Remove the assignments
    for var_name, prop_name in assignments:
        assignment_str = f"const {var_name} = fb?.{prop_name};"
        content = content.replace(assignment_str, "")
        assignment_str2 = f"const {var_name}=fb?.{prop_name};"
        content = content.replace(assignment_str2, "")
        
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Restored: {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            process_file(os.path.join(root, file))
