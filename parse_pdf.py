import fitz # PyMuPDF
import re
import json

doc = fitz.open("RegenPept_Portfolio Poland.pdf")
text = ""
for page in doc:
    text += page.get_text()

print(text)
