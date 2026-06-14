import re

path = 'src/routes/AdminRoutes.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match: const ComponentName = React.lazy(() => import('import_path'));
# Or with double quotes. Handles any amount of spaces.
pattern = r'const\s+([A-Za-z0-9_]+)\s*=\s*React\.lazy\(\s*\(\)\s*=>\s*import\([\'"]([^\'"]+)[\'"]\)\s*\);?'

def repl(match):
    name = match.group(1)
    import_path = match.group(2)
    return f"import {name} from '{import_path}';"

new_content = re.sub(pattern, repl, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced all React.lazy imports.")
