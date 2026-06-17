import re

file_path = "src/templates/AdminDashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Lines between 80 and 136 contain the static imports of tabs.
# We will just remove those lines entirely. We'll search for the block by a comment or regex.
# They are: import AdminUsersTab from '../components/admin/AdminUsersTab'; etc.
# We will match any line matching ^import\s+[A-Za-z0-9_]+\s+from\s+['"]../components/admin/.*['"];$
# Wait, some are from '../features/...', and some are const lazy.
# Let's just remove anything between the `// ── Lazy tab components` and `function MailPlus2(props)`

pattern = re.compile(r"// ── Lazy tab components ────────────────────────────────────────────────────────\n(.*?)\n// icon alias \(lucide", re.DOTALL)

def repl(match):
    return "// ── Removed unused tab component imports for code splitting ─────────────────\n// icon alias (lucide"

new_content = pattern.sub(repl, content)

with open(file_path, "w") as f:
    f.write(new_content)

print("AdminDashboard.jsx updated.")
