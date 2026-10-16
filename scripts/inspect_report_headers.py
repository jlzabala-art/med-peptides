import os

files = [
    "/Users/joseluiszabala/Downloads/18267609v3_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/18267615v3_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/Informe Valoraciones 18267615v3_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/18267691v1_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/Informe Valoraciones 18267691v1_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/18267598v1_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/Informe Valoraciones 18267598v1_en_extracted.txt",
    "/Users/joseluiszabala/Downloads/18264926v3_extracted.txt",
]

for fpath in files:
    fname = os.path.basename(fpath).replace("_extracted.txt", "")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("=" * 60)
    print(f"REPORT: {fname}")
    print("=" * 60)
    
    # Extract header lines
    lines = [l.strip() for l in content.split("\n") if l.strip()]
    for l in lines[:25]:
        print(f"  {l}")
    print(f"  ... [Total characters: {len(content)}, Total lines: {len(lines)}]\n")
