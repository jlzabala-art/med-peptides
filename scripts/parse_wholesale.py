import re, json

with open("wholesale_text.txt", "r") as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

products = {}
current_product = ""

for line in lines:
    if "Pricing List" in line or "Pricing Terms" in line or "PRODUCT DOSAGE" in line or "Ancillary Products" in line:
        continue

    # Clean up standard formats: e.g. "PRODUCT 10 mg/vial 10 vial/kit 99.0 usd/vial $638 / kit of 10"
    # or just "10 mg/vial 10 vial/kit 99.0 usd/vial $638 / kit of 10"
    
    # Let's match pricing info.
    # Look for: <price> usd/[unit] $\s*<kit_price> \/
    price_match = re.search(r'([\d.]+)\s*usd\/?\w*\s+\$([\d.]+)', line.lower())
    if price_match:
        unit_price = float(price_match.group(1))
        kit_price = float(price_match.group(2))
        
        # Now find the dosage part before the usd/vial string
        before_usd = line[:line.lower().find("usd")].strip()
        # Find the dosage strength (e.g., 5 mg/vial, 10iu, 250mcg/tablet)
        dose_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|mcg|iu|tabs?|ml)(?:\/\w+)?(?:/\d+\s*mg)?)', before_usd.lower())
        
        strength = ""
        if dose_match:
            strength = dose_match.group(1)
            # Remove the dosage from the before_usd to see what's left (the product name)
            idx = before_usd.lower().find(strength)
            name_part = before_usd[:idx].strip()
            
            if name_part and len(name_part) > 2:
                current_product = name_part
        else:
            # Fallback if weird formatting like "10 mg/10 mg/75 mg/..."
            name_part = before_usd.split()[0]
            if not name_part.isdigit():
                current_product = name_part
        
        # In case the strength is somehow captured with "/"
        strength_clean = strength.split('/')[0].strip()
        if not strength_clean:
            strength_clean = before_usd.split()[0] # fallback

        if current_product not in products:
            products[current_product] = []
            
        products[current_product].append({
            "strength": strength_clean,
            "unit_price": unit_price,
            "kit_price": kit_price
        })
    else:
        # Check if it's just a product name line like "Retatrutide"
        if len(line) > 2 and not line.isdigit() and "usd" not in line.lower():
            # If it doesn't have a slash or number pattern easily
            if not re.search(r'\d', line):
                current_product = line
            else:
                # E.g. "CJC-1295 with DAC"
                current_product = line

# Clean the keys
cleaned_products = {}
for p, variants in products.items():
    clean_name = p.replace("PRODUCT", "").strip()
    if clean_name:
        cleaned_products[clean_name] = variants

with open("wholesale_parsed.json", "w") as f:
    json.dump(cleaned_products, f, indent=2)

print("Parsed to wholesale_parsed.json")
