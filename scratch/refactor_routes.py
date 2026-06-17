import re

file_path = "src/routes/AdminRoutes.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Find all lines like: import X from '../components/...';
pattern = re.compile(r"^import\s+([A-Za-z0-9_]+)\s+from\s+(['\"])(.*)\2;", re.MULTILINE)

def repl(match):
    name = match.group(1)
    path = match.group(3)
    if name in ['React', 'useState', 'lazy', 'Suspense', 'Routes', 'Route', 'AdminDashboard', 'AdminTabErrorBoundary']:
        return match.group(0) # don't touch base react or layout components
    return f"const {name} = lazy(() => import('{path}'));"

new_content = pattern.sub(repl, content)

with open(file_path, "w") as f:
    f.write(new_content)

print("AdminRoutes.jsx updated.")
