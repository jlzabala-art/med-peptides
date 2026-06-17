import re

file_path = "vite.config.js"

with open(file_path, "r") as f:
    content = f.read()

# We want to remove all portal- chunks from vite.config.js
# Just replace the manualChunks function body from lines `if (id.includes('node_modules')) ... return 'vendor';` to the end of manualChunks.
pattern = re.compile(r"manualChunks\(id\)\s*\{.*?return 'vendor';\s*\}.*?\}", re.DOTALL)

def repl(match):
    return '''manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('recharts')) return 'vendor-recharts';
            return 'vendor';
          }
        }'''

new_content = pattern.sub(repl, content)

with open(file_path, "w") as f:
    f.write(new_content)

print("vite.config.js updated.")
