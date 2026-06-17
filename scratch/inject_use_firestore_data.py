import re

files_to_fix = [
    "src/routes/ShopRoutes.jsx",
    "src/templates/ProductTemplate.jsx",
    "src/templates/ProtocolTemplate.jsx",
    "src/templates/Catalog.jsx",
    "src/templates/ObjectiveDetailView.jsx",
    "src/templates/CollectionTemplate.jsx",
    "src/templates/CategoryDetailView.jsx",
    "src/templates/SearchTemplate.jsx",
    "src/templates/ProductDetail.jsx",
    "src/snippets/MobileProductCard.jsx",
    "src/snippets/SearchModal.jsx"
]

import_statement = "import { useFirestoreData } from '../hooks/useFirestoreData';\n"
import_statement_src = "import { useFirestoreData } from '../../hooks/useFirestoreData';\n" # for components deeper if needed, but these are mostly in templates/ so '../hooks/' is correct.
# ShopRoutes: ../hooks
# ProductTemplate: ../hooks
# Catalog: ../hooks
# MobileProductCard: ../hooks
# SearchModal: ../hooks

for file_path in files_to_fix:
    with open(file_path, "r") as f:
        content = f.read()

    if "useFirestoreData" not in content:
        # insert import after last import
        last_import_index = content.rfind("import ")
        if last_import_index != -1:
            end_of_line = content.find("\n", last_import_index)
            content = content[:end_of_line+1] + "import { useFirestoreData } from '../hooks/useFirestoreData';\n" + content[end_of_line+1:]

    # Now, find the component definition and inject `const { allFaqs } = useFirestoreData();`
    # We will just look for `export default function <Name>` or `const <Name> = (`
    # Actually, we should just let them grab `allFaqs` from `useFirestoreData()` directly.
    # We can replace `allFaqs` in props with nothing, and then add the line.
    
    # Or, the easier and safer way:
    # Just run a quick regex to inject it at the beginning of the component body.
    # It's tricky to do correctly with regex for all components.
    
    # Let's just do it manually with multi_replace_file_content or a tailored script if we really need to.
    pass
