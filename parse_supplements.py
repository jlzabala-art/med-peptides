import json
import re

# Current EUR to USD conversion rate
EUR_TO_USD = 1.08 

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def parse_supplements(text):
    categories = [
        "ADAPTOGENS & BOTANICALS", "AMINO ACIDS", "ANTIOXIDANTS", 
        "LONGEVITY", "METABOLIC & BLOOD SUGAR", "VITAMINS & MINERALS", 
        "SLEEP & MOOD", "OTHER"
    ]
    
    current_category = "Other"
    results = []
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if line.upper() in categories:
            current_category = line.title()
            i += 1
            continue
            
        if '—' in line:
            price = None
            price_idx = -1
            for j in range(1, 3):
                if i+j < len(lines) and '€' in lines[i+j]:
                    price_str = lines[i+j].replace('€', '').replace(',', '').strip()
                    try:
                        price = float(price_str)
                        price_idx = i+j
                        break
                    except ValueError:
                        continue
            
            if price is not None:
                item_line = line
                parts = item_line.split('—')
                name_dosage = parts[0].strip()
                quantity = parts[1].strip()
                
                match = re.search(r'(.*?)\s+(\d+(?:mg|g|iu|mcg|%|u).*)$', name_dosage, re.IGNORECASE)
                if match:
                    name = match.group(1).strip()
                    dosage = match.group(2).strip()
                else:
                    name = name_dosage
                    dosage = ""
                
                usd_price = round(price * EUR_TO_USD, 2)
                
                # Create object matching the products.js schema
                results.append({
                    "category": current_category,
                    "name": name,
                    "type": "supplement",
                    "desc": f"High-purity {name} for research and clinical applications.",
                    "dosage": dosage,
                    "quantity": quantity,
                    "perVialPriceUSD": usd_price, # per item price
                    "kitPriceUSD": usd_price,      # same as perVial for supplements usually sold by unit
                    "objective": current_category,
                    "image": "/assets/vials/generic-supplement.png",
                    "goals": [current_category.lower().replace(' & ', '_').replace(' ', '_')],
                    "tags": ["Supplement", current_category],
                    "semanticKeywords": [name.lower(), current_category.lower()],
                    "synonyms": [name.lower()],
                    "status": "active"
                })
                
                i = price_idx + 1
                continue
        
        i += 1
            
    return results

# Read text
with open('supplements_text.txt', 'r') as f:
    text = f.read()

supps = parse_supplements(text)

# Write to .js file
js_content = f"""/**
 * supplements.js
 * Generated from NP_LABS_Supplements.pdf
 * Conversion Rate: 1 EUR = {EUR_TO_USD} USD
 */

export const supplements = {json.dumps(supps, indent=2)};
"""

with open('src/data/supplements.js', 'w') as f:
    f.write(js_content)

print(f"Generated src/data/supplements.js with {len(supps)} entries.")
