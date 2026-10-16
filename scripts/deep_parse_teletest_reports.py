import re

def parse_celiac():
    print("=" * 70)
    print("1. CELIAC DISEASE REPORT (18267609v3_en)")
    print("=" * 70)
    with open("/Users/joseluiszabala/Downloads/18267609v3_en_extracted.txt") as f:
        text = f.read()
    # Print pages
    for page in text.split("--- Page "):
        if not page.strip(): continue
        print("PAGE HEADER:")
        lines = [l.strip() for l in page.split("\n") if l.strip()]
        for l in lines[:15]:
            print("  ", l)
        print("...")

def parse_hla():
    print("=" * 70)
    print("2. HLA & AUTOIMMUNITY REPORT (18267615v3_en + Assessment)")
    print("=" * 70)
    with open("/Users/joseluiszabala/Downloads/18267615v3_en_extracted.txt") as f:
        text = f.read()
    for page in text.split("--- Page "):
        if not page.strip(): continue
        lines = [l.strip() for l in page.split("\n") if l.strip()]
        for l in lines[:20]:
            print("  ", l)
        print("...")
        
    print("\n--- ASSESSMENT REPORT (18267615v3_en) ---")
    with open("/Users/joseluiszabala/Downloads/Informe Valoraciones 18267615v3_en_extracted.txt") as f:
        text = f.read()
    for page in text.split("--- Page "):
        if not page.strip(): continue
        lines = [l.strip() for l in page.split("\n") if l.strip()]
        for l in lines[:20]:
            print("  ", l)
        print("...")

def parse_mineral():
    print("=" * 70)
    print("3. HAIR MINERAL (18267691v1_en + Assessment)")
    print("=" * 70)
    with open("/Users/joseluiszabala/Downloads/18267691v1_en_extracted.txt") as f:
        text = f.read()
    print("Sample lines from analytical report:")
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for l in lines[20:60]:
        print("  ", l)
        
    print("\n--- ASSESSMENT REPORT ---")
    with open("/Users/joseluiszabala/Downloads/Informe Valoraciones 18267691v1_en_extracted.txt") as f:
        text = f.read()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for l in lines[:40]:
        print("  ", l)

def parse_omega():
    print("=" * 70)
    print("4. OMEGA (18267598v1_en + Assessment)")
    print("=" * 70)
    with open("/Users/joseluiszabala/Downloads/18267598v1_en_extracted.txt") as f:
        text = f.read()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for l in lines[20:80]:
        print("  ", l)
        
    print("\n--- ASSESSMENT REPORT ---")
    with open("/Users/joseluiszabala/Downloads/Informe Valoraciones 18267598v1_en_extracted.txt") as f:
        text = f.read()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for l in lines[:40]:
        print("  ", l)

def parse_detox():
    print("=" * 70)
    print("5. DETOX (18264926v3)")
    print("=" * 70)
    with open("/Users/joseluiszabala/Downloads/18264926v3_extracted.txt") as f:
        text = f.read()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for l in lines[15:80]:
        print("  ", l)

parse_celiac()
parse_hla()
parse_mineral()
parse_omega()
parse_detox()
