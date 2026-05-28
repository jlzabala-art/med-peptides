import fitz # PyMuPDF
import re
import json

doc = fitz.open("Med-Peptides_Portfolio Poland.pdf")
text = ""
for page in doc:
    text += page.get_text()

print(text)
