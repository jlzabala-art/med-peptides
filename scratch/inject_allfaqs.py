import re

files_to_fix = [
    "src/templates/ProductDetail.jsx",
    "src/templates/CategoryDetailView.jsx",
    "src/templates/ObjectiveDetailView.jsx",
    "src/templates/CollectionTemplate.jsx",
    "src/templates/Catalog.jsx",
    "src/snippets/SearchModal.jsx",
    "src/snippets/MobileProductCard.jsx"
]

for file_path in files_to_fix:
    with open(file_path, "r") as f:
        content = f.read()

    # Add import
    if "useFirestoreData" not in content:
        content = re.sub(
            r"(import React.*?;\n)",
            r"\1import { useFirestoreData } from '../hooks/useFirestoreData';\n",
            content,
            count=1
        )
    
    # Remove allFaqs from props
    content = re.sub(r",\s*allFaqs\s*(?:=\s*\[\])?", "", content)
    content = re.sub(r"allFaqs\s*(?:=\s*\[\])?\s*,", "", content)
    
    # Inject const { allFaqs } = useFirestoreData();
    # We find the component definition line. Usually `export default function Name({ ... }) {` or `const Name = ({ ... }) => {`
    pattern = re.compile(r"((?:export default function|const) [A-Za-z0-9_]+\s*(?:=\s*)?\([^)]*\)\s*(?:=>\s*)?\{\n)", re.MULTILINE)
    
    # We only want to inject it once per file, at the main component.
    def repl(match):
        return match.group(1) + "  const { allFaqs } = useFirestoreData();\n"
    
    content = pattern.sub(repl, content, count=1)

    with open(file_path, "w") as f:
        f.write(content)
        
print("allFaqs injected")
