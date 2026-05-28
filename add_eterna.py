import json
import re

file_path = "src/data/supplements.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

eterna_obj = {
    "category": "Longevity Diagnostics",
    "name": "ETERNA® Longevity Platform",
    "type": "testing",
    "desc": "Advanced longevity assessment platform integrating genetics, proteomics, biomarkers, wearable data and longitudinal analytics to generate personalized biological aging insights.",
    "dosage": "1 test",
    "quantity": "1 kit",
    "objective": "Biological Age Assessment & Health Optimization",
    "image": "/assets/vials/eterna-longevity.png",
    "goals": [
        "longevity",
        "health optimization",
        "aging"
    ],
    "tags": [
        "Testing",
        "Longevity",
        "Digital Health",
        "Multi-Omics"
    ],
    "semanticKeywords": [
        "proteomics",
        "genetics",
        "wearables",
        "biological age",
        "preventive medicine",
        "health optimization"
    ],
    "productType": "testing",
    "slug": "eterna-longevity-platform",
    "features": [
        "Organ biological age estimation",
        "Integration of up to 1,000 protein markers",
        "Wearable synchronization",
        "Upload of external laboratory data",
        "Genetic data integration"
    ],
    "targetUser": [
        "Longevity Clinics",
        "Preventive Medicine Clinics",
        "Health-conscious Consumers"
    ]
}

eterna_str = json.dumps(eterna_obj, indent=2)

# Insert after "export const supplements = ["
new_content = content.replace("export const supplements = [", f"export const supplements = [\n  {eterna_str},")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Added ETERNA DX successfully")
