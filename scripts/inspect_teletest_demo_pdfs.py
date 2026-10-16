import os
import pypdf

pdf_files = [
    {
        "test": "Test 1: Genetic Celiac Disease",
        "type": "Analytical Report",
        "path": "/Users/joseluiszabala/Downloads/18267609v3_en.pdf"
    },
    {
        "test": "Test 2: HLA & Autoimmunity",
        "type": "Analytical Report",
        "path": "/Users/joseluiszabala/Downloads/18267615v3_en.pdf"
    },
    {
        "test": "Test 2: HLA & Autoimmunity",
        "type": "Assessment Report",
        "path": "/Users/joseluiszabala/Downloads/Informe Valoraciones 18267615v3_en.pdf"
    },
    {
        "test": "Test 3: Hair Mineral Analysis",
        "type": "Analytical Report",
        "path": "/Users/joseluiszabala/Downloads/18267691v1_en.pdf"
    },
    {
        "test": "Test 3: Hair Mineral Analysis",
        "type": "Assessment Report",
        "path": "/Users/joseluiszabala/Downloads/Informe Valoraciones 18267691v1_en.pdf"
    },
    {
        "test": "Test 4: Omega Fatty Acid Profile",
        "type": "Analytical Report",
        "path": "/Users/joseluiszabala/Downloads/18267598v1_en.pdf"
    },
    {
        "test": "Test 4: Omega Fatty Acid Profile",
        "type": "Assessment Report",
        "path": "/Users/joseluiszabala/Downloads/Informe Valoraciones 18267598v1_en.pdf"
    },
    {
        "test": "Test 5: Genetic Detoxification",
        "type": "Analytical Report",
        "path": "/Users/joseluiszabala/Downloads/18264926v3.pdf"
    }
]

print("=== PARSING 8 TELETEST DEMONSTRATION REPORTS ===\n")

for item in pdf_files:
    path = item["path"]
    print(f"============================================================")
    print(f"FILE: {os.path.basename(path)}")
    print(f"TEST: {item['test']} ({item['type']})")
    print(f"============================================================")
    if not os.path.exists(path):
        print("ERROR: File not found")
        continue
    
    reader = pypdf.PdfReader(path)
    print(f"Num pages: {len(reader.pages)}")
    full_text = ""
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        print(f"--- PAGE {idx + 1} (preview 400 chars) ---")
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        for l in lines[:10]:
            print(f"  {l}")
        full_text += f"\n--- Page {idx+1} ---\n" + text

    # Save full text to a txt file for deep inspection
    out_txt = path.replace(".pdf", "_extracted.txt")
    with open(out_txt, "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"Saved full extracted text to: {out_txt}\n")
