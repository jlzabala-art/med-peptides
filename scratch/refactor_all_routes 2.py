import re
import glob

files = glob.glob("src/routes/*.jsx")
# we should skip AppRouter.jsx, or process it carefully
for file_path in files:
    if file_path.endswith("AppRouter.jsx") or file_path.endswith("ShopRoutes.jsx"):
        continue

    with open(file_path, "r") as f:
        content = f.read()

    pattern = re.compile(r"^import\s+([A-Za-z0-9_]+)\s+from\s+(['\"])(.*)\2;", re.MULTILINE)

    def repl(match):
        name = match.group(1)
        path = match.group(3)
        # Leave react router and react imports alone
        if name in ['React', 'useState', 'useEffect', 'lazy', 'Suspense', 'Routes', 'Route', 'Navigate', 'useNavigate', 'useLocation']:
            return match.group(0)
        # Leave layouts and error boundaries alone (sometimes they break if lazy loaded incorrectly depending on the setup)
        if 'ErrorBoundary' in name or 'Dashboard' in name or 'Layout' in name or 'Home' in name:
            return match.group(0)
        return f"const {name} = lazy(() => import('{path}'));"

    new_content = pattern.sub(repl, content)

    with open(file_path, "w") as f:
        f.write(new_content)
    print(f"Updated {file_path}")
