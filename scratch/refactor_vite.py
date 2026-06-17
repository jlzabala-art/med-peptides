import re

file_path = "vite.config.js"

with open(file_path, "r") as f:
    content = f.read()

# We want to remove the portal-admin chunking logic.
# find:
'''
          if (
            id.includes('/src/components/admin/') ||
            id.includes('/src/routes/AdminRoutes') ||
            id.includes('/src/templates/Admin')
          ) {
            return 'portal-admin';
          }
'''
pattern = re.compile(r"\s*if\s*\([\s\S]*?return 'portal-admin';\s*\}", re.MULTILINE)
new_content = pattern.sub("", content)

with open(file_path, "w") as f:
    f.write(new_content)

print("vite.config.js updated.")
