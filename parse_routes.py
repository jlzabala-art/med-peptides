import re

with open('src/routes/AdminRoutes.jsx', 'r') as f:
    content = f.read()

# Extract lazy imports
imports_pattern = re.compile(r'const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(([\'"])(.*?)\2\)\s*\);')
imports = imports_pattern.findall(content)

component_paths = {comp: path for comp, _, path in imports}

# Extract routes
routes_pattern = re.compile(r'<Route\s+path=([\'"])(.*?)\1\s+element=\{[\s\S]*?<AdminTabErrorBoundary[^>]*>[\s\S]*?<([A-Za-z0-9_]+)[\s\S]*?<\/AdminTabErrorBoundary>')
routes = routes_pattern.findall(content)

index_pattern = re.compile(r'<Route\s+index\s+element=\{[\s\S]*?<AdminTabErrorBoundary[^>]*>[\s\S]*?<([A-Za-z0-9_]+)[\s\S]*?<\/AdminTabErrorBoundary>')
index_match = index_pattern.search(content)

out = []
out.append("'use client';")
out.append("import React from 'react';")
out.append("import dynamic from 'next/dynamic';")
out.append("import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';")
out.append("")
out.append("// Dynamic imports for all admin tabs")

for comp, path in component_paths.items():
    # Fix paths because now we are in src/app/admin/[...slug]
    # Old path: '../components/admin/...' relative to src/routes/
    # New path: '../../../components/admin/...' relative to src/app/admin/[...slug]/
    new_path = path.replace('../', '../../../')
    out.append(f"const {comp} = dynamic(() => import('{new_path}'), {{ ssr: false }});")

out.append("")
out.append("export default function AdminDynamicRoute({ params }) {")
out.append("  const slug = params.slug || [];")
out.append("  const path = slug.join('/');")
out.append("")
out.append("  switch (path) {")

for _, path, comp in routes:
    if path == "dashboard" or path == "": continue
    out.append(f"    case '{path}': return <AdminTabErrorBoundary tabId=\"{path}\" tabLabel=\"{comp}\"><{comp} /></AdminTabErrorBoundary>;")

out.append("    default: return <div>Tab Not Found: {path}</div>;")
out.append("  }")
out.append("}")

with open('src/app/admin/[...slug]/page.jsx', 'w') as f:
    f.write('\n'.join(out))

