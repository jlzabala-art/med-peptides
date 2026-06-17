import re
import os

files_to_clean = [
    "src/templates/DoctorDashboard.jsx",
    "src/templates/WholesalerHome.jsx",
    "src/templates/SupplierHome.jsx",
    "src/templates/RoleDashboard.jsx",
    "src/templates/AccountManagerDashboard.jsx"
]

for file_path in files_to_clean:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r") as f:
        content = f.read()

    # The template files usually have:
    # // ── Lazy tab components ────────────────────────────────────────────────────────
    # import ...
    # ...
    # // Tab→group lookup (or some other comment)
    # We will remove anything between "Lazy tab components" and the next major section comment
    
    # We can also just remove lines that start with `import ` and contain `Tab` or `Hub` or `Widget` from `../components/` or `../features/` if they aren't used.
    # Actually, the safest way is a regex for `import [A-Za-z0-9_]+ from '../(components|features)/.*';`
    # and then checking if the imported identifier is used anywhere else in the file besides the import itself!
    
    pattern = re.compile(r"^import\s+([A-Za-z0-9_]+)\s+from\s+['\"]../(components|features|pages)/.*?['\"];$", re.MULTILINE)
    
    def repl(match):
        ident = match.group(1)
        # Check if ident is used in the rest of the file (e.g. `<ident ` or `element={<ident />}`)
        # But we must be careful not to match the import line itself.
        # Let's count occurrences of the identifier as a whole word.
        # If it's only 1 (the import), remove it.
        occurrences = len(re.findall(r"\b" + ident + r"\b", content))
        if occurrences == 1:
            return "" # remove unused import
        else:
            # It's used!
            return match.group(0)

    new_content = pattern.sub(repl, content)

    # Some imports might be defined as `const Ident = lazy(...)`
    lazy_pattern = re.compile(r"^const\s+([A-Za-z0-9_]+)\s*=\s*lazy\([\s\S]*?\);$", re.MULTILINE)
    def repl_lazy(match):
        ident = match.group(1)
        occurrences = len(re.findall(r"\b" + ident + r"\b", content))
        if occurrences == 1:
            return ""
        return match.group(0)
    
    new_content = lazy_pattern.sub(repl_lazy, new_content)

    with open(file_path, "w") as f:
        f.write(new_content)
    print(f"Cleaned {file_path}")

