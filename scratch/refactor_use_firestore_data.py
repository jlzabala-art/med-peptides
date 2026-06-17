import re

file_path = "src/App.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Remove useFirestoreData import
content = re.sub(r"import\s+\{\s*useFirestoreData\s*\}\s+from\s+'./hooks/useFirestoreData';\n", "", content)

# Remove hook call
content = re.sub(r"\s*// allFaqs and protocolIndex: read-only, session-cached — no products fetch inside hook\n\s*const\s+\{\s*allFaqs,\s*protocolIndex,\s*supplementCatalogue\s*\}\s*=\s*useFirestoreData\(\);\n", "\n", content)

# Remove allFaqs from ObjectiveDetailRouteWrapper
content = re.sub(r"const ObjectiveDetailRouteWrapper = \(\{ isProfessional, visibleProducts, allFaqs, onSelectProduct \}\) => \{", "const ObjectiveDetailRouteWrapper = ({ isProfessional, visibleProducts, onSelectProduct }) => {", content)

content = re.sub(r"allFaqs=\{allFaqs\}", "", content)
content = re.sub(r"protocolIndex=\{protocolIndex\}", "", content)
content = re.sub(r"supplementCatalogue=\{supplementCatalogue\}", "", content)
content = re.sub(r"setPendingQuote, allFaqs,", "setPendingQuote,", content)

with open(file_path, "w") as f:
    f.write(content)

print("App.jsx updated.")
