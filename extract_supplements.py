import fitz # PyMuPDF
import sys

try:
    doc = fitz.open("NP_LABS_Supplements.pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    
    with open("supplements_text.txt", "w") as f:
        f.write(text)
    print("Success: Text extracted to supplements_text.txt")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
