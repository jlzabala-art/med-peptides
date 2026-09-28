"""
generate_all_phases.py
Compiles all 4 phases of BioBlend products into scripts/bioblend_catalog_data.json
for loading into provider Magenta (supplier-magenta).
"""
import json

# Load base phase 1
with open("/Users/joseluiszabala/regenpept-web.nosync/scripts/bioblend_phase1.json") as f:
    p1 = json.load(f)["phase1"]

# PHASE 2: DERMATOLOGY & ANESTHESIA (Pages 4 & 5)
phase2_items = [
    {
        "name": "Hydroquinone + Hydrocortisone + Tretinoin Cream",
        "canonicalName": "Kligman Formulation Tri-Luma Compound",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "HQ 8% + HC 2% + Tretinoin 0.025%", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 130.0, "patient_price_aed": 260.0},
            {"dose": "HQ 4% + HC 2% + Tretinoin 0.025%", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 100.0, "patient_price_aed": 200.0}
        ]
    },
    {
        "name": "Tranexamic Acid + GigaWhite + Niacinamide Cream",
        "canonicalName": "Tranexamic Multi-Action Depigmenting Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "TXA 5% + GigaWhite + Niacinamide", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 100.0, "patient_price_aed": 200.0}
        ]
    },
    {
        "name": "GLOW Whitening Cream",
        "canonicalName": "GLOW Whitening Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Glutathione 5% + TXA 5% + Niacinamide", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 100.0, "patient_price_aed": 200.0}
        ]
    },
    {
        "name": "Tretinoin Topical Cream",
        "canonicalName": "Tretinoin",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "0.01%", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 100.0, "patient_price_aed": 200.0},
            {"dose": "0.05%", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 120.0, "patient_price_aed": 240.0}
        ]
    },
    {
        "name": "Tretinoin Maintenance Cream",
        "canonicalName": "Tretinoin Multi-Brightening Maintenance Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Tretinoin + GigaWhite + Kojic Acid + Niacinamide", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 100.0, "patient_price_aed": 200.0}
        ]
    },
    {
        "name": "Under Eye Brightening Cream",
        "canonicalName": "Clinical Under Eye Complex",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "HQ + Caffeine + Niacinamide", "volume": "15 mL", "format": "cream", "formatName": "Under Eye Cream", "clinic_price_aed": 110.0, "patient_price_aed": 220.0},
            {"dose": "Vitamin K + Caffeine + Niacinamide", "volume": "15 mL", "format": "cream", "formatName": "Under Eye Cream", "clinic_price_aed": 110.0, "patient_price_aed": 220.0}
        ]
    },
    {
        "name": "Clinical Lips Rejuvenation Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Niacinamide + Lactic + Glycolic + Argan", "volume": "10 mL", "format": "cream", "formatName": "Lip Cream", "clinic_price_aed": 90.0, "patient_price_aed": 180.0},
            {"dose": "Niacinamide + Lactic + Glycolic + Argan", "volume": "15 mL", "format": "cream", "formatName": "Lip Cream", "clinic_price_aed": 135.0, "patient_price_aed": 270.0}
        ]
    },
    {
        "name": "Intimate Depigmenting Body Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Urea 10% + HQ 4% + Kojic + Lactic + Niacinamide", "volume": "30 mL", "format": "cream", "formatName": "Body Cream", "clinic_price_aed": 100.0, "patient_price_aed": 200.0},
            {"dose": "Urea 10% + HQ 4% + Kojic + Lactic + Niacinamide", "volume": "50 mL", "format": "cream", "formatName": "Body Cream", "clinic_price_aed": 175.0, "patient_price_aed": 350.0}
        ]
    },
    {
        "name": "Glowing & Hydrating Vitamin C Day Serum",
        "canonicalName": "Ascorbic Acid Multi-Strength Antioxidant Serum",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Ascorbic Acid 5% + HA 1% + Dexpanthenol 5%", "volume": "30 mL", "format": "serum", "formatName": "Day Serum", "clinic_price_aed": 125.0, "patient_price_aed": 250.0},
            {"dose": "Ascorbic Acid 5% + HA 1% + Dexpanthenol 5%", "volume": "50 mL", "format": "serum", "formatName": "Day Serum", "clinic_price_aed": 175.0, "patient_price_aed": 350.0},
            {"dose": "Ascorbic Acid 15% + HA 1.5% + Dexpanthenol 5%", "volume": "30 mL", "format": "serum", "formatName": "Day Serum", "clinic_price_aed": 135.0, "patient_price_aed": 270.0},
            {"dose": "Ascorbic Acid 15% + HA 1.5% + Dexpanthenol 5%", "volume": "50 mL", "format": "serum", "formatName": "Day Serum", "clinic_price_aed": 185.0, "patient_price_aed": 370.0},
            {"dose": "Ascorbic Acid 20% + HA 2% + Dexpanthenol 5%", "volume": "30 mL", "format": "serum", "formatName": "Day Serum", "clinic_price_aed": 145.0, "patient_price_aed": 290.0},
            {"dose": "Ascorbic Acid 20% + HA 2% + Dexpanthenol 5%", "volume": "50 mL", "format": "serum", "formatName": "Day Serum", "clinic_price_aed": 195.0, "patient_price_aed": 390.0}
        ]
    },
    {
        "name": "Ageless Argireline & GHK-Cu Serum",
        "canonicalName": "Argireline & GHK-Cu Bio-Botox Serum",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "HA 1.5% + Argireline 10% + GHK-Cu 0.5%", "volume": "30 mL", "format": "serum", "formatName": "Topical Serum", "clinic_price_aed": 150.0, "patient_price_aed": 300.0}
        ]
    },
    {
        "name": "GHK-Cu Ageless Cream",
        "canonicalName": "GHK-Cu Copper Peptide Regenerative Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "GHK-Cu 0.5%", "volume": "30 mL", "format": "cream", "formatName": "Ageless Cream", "clinic_price_aed": 105.0, "patient_price_aed": 210.0},
            {"dose": "GHK-Cu 1%", "volume": "30 mL", "format": "cream", "formatName": "Ageless Cream", "clinic_price_aed": 115.0, "patient_price_aed": 230.0},
            {"dose": "GHK-Cu 2%", "volume": "30 mL", "format": "cream", "formatName": "Ageless Cream", "clinic_price_aed": 125.0, "patient_price_aed": 250.0}
        ]
    },
    {
        "name": "GHK-Cu Topical Serum",
        "canonicalName": "GHK-Cu High-Potency Dermal Serum",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "GHK-Cu 2%", "volume": "30 mL", "format": "serum", "formatName": "Topical Serum", "clinic_price_aed": 130.0, "patient_price_aed": 260.0},
            {"dose": "GHK-Cu 4%", "volume": "30 mL", "format": "serum", "formatName": "Topical Serum", "clinic_price_aed": 160.0, "patient_price_aed": 320.0}
        ]
    },
    {
        "name": "Clinical Acne Compound Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Clindamycin 2% + Salicylic 1% + Azelaic Acid", "volume": "30 mL", "format": "cream", "formatName": "Acne Cream", "clinic_price_aed": 75.0, "patient_price_aed": 150.0},
            {"dose": "Clindamycin 1% + Salicylic 1% + Tretinoin 0.025%", "volume": "30 mL", "format": "cream", "formatName": "Acne Cream", "clinic_price_aed": 75.0, "patient_price_aed": 150.0}
        ]
    },
    {
        "name": "Rejuvex Anti-Aging Night Renewal Cream",
        "canonicalName": "Rejuvex NAD+ & Copper Peptide Renewal Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "NAD+ 5% + GHK-Cu 0.05% + HA 2% + TXA 2%", "volume": "30 mL", "format": "cream", "formatName": "Night Cream", "clinic_price_aed": 225.0, "patient_price_aed": 450.0},
            {"dose": "NAD+ 10% + GHK-Cu 0.2% + HA 2% + Vit E 2%", "volume": "30 mL", "format": "cream", "formatName": "Night Cream", "clinic_price_aed": 235.0, "patient_price_aed": 470.0},
            {"dose": "NAD+ 10% + GHK-Cu 0.2% + HA 2% + Vit E 2%", "volume": "50 mL", "format": "cream", "formatName": "Night Cream", "clinic_price_aed": 300.0, "patient_price_aed": 600.0}
        ]
    },
    {
        "name": "Rosacea Compound Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Metronidazole 1% + Niacinamide 4%", "volume": "30 mL", "format": "cream", "formatName": "Rosacea Cream", "clinic_price_aed": 125.0, "patient_price_aed": 250.0},
            {"dose": "Metronidazole 2% + Niacinamide 4%", "volume": "30 mL", "format": "cream", "formatName": "Rosacea Cream", "clinic_price_aed": 125.0, "patient_price_aed": 250.0}
        ]
    },
    {
        "name": "Post-Laser & Scar Silicone Gel",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Functional Medical Grade Silicone Gel", "volume": "30 mL", "format": "gel", "formatName": "Post-Laser Gel", "clinic_price_aed": 195.0, "patient_price_aed": 390.0},
            {"dose": "Functional Medical Grade Silicone Gel", "volume": "50 mL", "format": "gel", "formatName": "Post-Laser Gel", "clinic_price_aed": 295.0, "patient_price_aed": 590.0}
        ]
    },
    {
        "name": "Dexpanthenol & Vitamin E Barrier Repair Cream",
        "category": "Dermatology & Cosmeceuticals",
        "variants": [
            {"dose": "Dexpanthenol + Vitamin E Repair", "volume": "30 mL", "format": "cream", "formatName": "Repair Cream", "clinic_price_aed": 170.0, "patient_price_aed": 340.0},
            {"dose": "Dexpanthenol + Vitamin E Repair", "volume": "50 mL", "format": "cream", "formatName": "Repair Cream", "clinic_price_aed": 195.0, "patient_price_aed": 390.0}
        ]
    },
    # Page 5: Anesthesia & Peels
    {
        "name": "Lidocaine Professional Topical Anesthetic Cream",
        "canonicalName": "Lidocaine Anesthetic Cream",
        "category": "Clinical Supplies & Topicals",
        "variants": [
            {"dose": "10%", "pack_size": "100 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 90.0, "patient_price_aed": 180.0},
            {"dose": "10%", "pack_size": "250 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 170.0, "patient_price_aed": 340.0},
            {"dose": "10%", "pack_size": "500 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 330.0, "patient_price_aed": 660.0},
            {"dose": "10.56%", "pack_size": "100 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 90.0, "patient_price_aed": 180.0},
            {"dose": "10.56%", "pack_size": "250 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 170.0, "patient_price_aed": 340.0},
            {"dose": "10.56%", "pack_size": "500 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 330.0, "patient_price_aed": 660.0},
            {"dose": "30%", "pack_size": "100 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 105.0, "patient_price_aed": 210.0},
            {"dose": "30%", "pack_size": "250 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 205.0, "patient_price_aed": 410.0},
            {"dose": "30%", "pack_size": "500 g", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 390.0, "patient_price_aed": 780.0}
        ]
    },
    {
        "name": "BLT 30% (Benzocaine/Lidocaine/Tetracaine) Professional Gel",
        "canonicalName": "BLT Anesthetic Compound (20/6/4)",
        "category": "Clinical Supplies & Topicals",
        "variants": [
            {"dose": "BLT 30% (20/6/4)", "pack_size": "100 g", "format": "gel", "formatName": "Anesthetic Gel", "clinic_price_aed": 125.0, "patient_price_aed": 250.0},
            {"dose": "BLT 30% (20/6/4)", "pack_size": "250 g", "format": "gel", "formatName": "Anesthetic Gel", "clinic_price_aed": 240.0, "patient_price_aed": 480.0},
            {"dose": "BLT 30% (20/6/4)", "pack_size": "500 g", "format": "gel", "formatName": "Anesthetic Gel", "clinic_price_aed": 470.0, "patient_price_aed": 940.0}
        ]
    },
    {
        "name": "Hydroquinone + Tretinoin Peel Off Mask",
        "canonicalName": "HQ & Tretinoin Chemical Peel Mask",
        "category": "Clinical Supplies & Topicals",
        "variants": [
            {"dose": "HQ 2% + Tretinoin 2%", "volume": "10 mL", "format": "mask", "formatName": "Peel-Off Mask", "clinic_price_aed": 150.0, "patient_price_aed": 300.0},
            {"dose": "HQ 5% + Tretinoin 5%", "volume": "10 mL", "format": "mask", "formatName": "Peel-Off Mask", "clinic_price_aed": 200.0, "patient_price_aed": 400.0},
            {"dose": "HQ 10% + Tretinoin 10%", "volume": "10 mL", "format": "mask", "formatName": "Peel-Off Mask", "clinic_price_aed": 250.0, "patient_price_aed": 500.0}
        ]
    }
]

# PHASE 3: HAIR CARE & IVNT (Pages 6 & 7)
phase3_items = [
    # Page 6: Hair Care
    {
        "name": "Minoxidil + Finasteride + Tretinoin Hair Serum",
        "canonicalName": "Minoxidil Complex Hair Regrowth Serum",
        "category": "Trichology & Hair Care",
        "variants": [
            {"dose": "Minoxidil 5% + Finasteride 0.1% + Tretinoin 0.01%", "volume": "30 mL", "format": "serum", "formatName": "Hair Serum", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Minoxidil 5% + Finasteride 0.1% + Tretinoin 0.01%", "volume": "50 mL", "format": "serum", "formatName": "Hair Serum", "clinic_price_aed": 210.0, "patient_price_aed": 420.0},
            {"dose": "Minoxidil 5% + Finasteride 0.01% + Tretinoin 0.01% + Zn + Biotin + Caffeine", "volume": "30 mL", "format": "serum", "formatName": "Hair Serum", "clinic_price_aed": 220.0, "patient_price_aed": 440.0},
            {"dose": "Minoxidil 5% + Finasteride 0.01% + Tretinoin 0.01% + Zn + Biotin + Caffeine", "volume": "50 mL", "format": "serum", "formatName": "Hair Serum", "clinic_price_aed": 245.0, "patient_price_aed": 490.0}
        ]
    },
    {
        "name": "Minoxidil + Finasteride Topical Hair Cream",
        "canonicalName": "Minoxidil & Finasteride Scalp Cream",
        "category": "Trichology & Hair Care",
        "variants": [
            {"dose": "Minoxidil 5% + Finasteride 2%", "volume": "30 mL", "format": "cream", "formatName": "Hair Cream", "clinic_price_aed": 160.0, "patient_price_aed": 320.0}
        ]
    },
    {
        "name": "Minoxidil + Finasteride Oral Capsules",
        "canonicalName": "Oral Minoxidil & Finasteride Complex",
        "category": "Trichology & Hair Care",
        "variants": [
            {"dose": "Minoxidil 5 mg + Finasteride 1 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 130.0, "patient_price_aed": 260.0}
        ]
    },
    {
        "name": "GHK-Cu Hair Regrowth Foam",
        "canonicalName": "GHK-Cu Copper Peptide Hair Foam",
        "category": "Trichology & Hair Care",
        "variants": [
            {"dose": "GHK-Cu 0.5%", "volume": "50 mL", "format": "foam", "formatName": "Topical Foam", "clinic_price_aed": 245.0, "patient_price_aed": 490.0}
        ]
    },
    {
        "name": "Tretinoin Scalp Solution",
        "canonicalName": "Tretinoin Trichology Solution",
        "category": "Trichology & Hair Care",
        "variants": [
            {"dose": "Tretinoin 0.01%", "volume": "30 mL", "format": "solution", "formatName": "Scalp Solution", "clinic_price_aed": 75.0, "patient_price_aed": 150.0},
            {"dose": "Tretinoin 0.01%", "volume": "50 mL", "format": "solution", "formatName": "Scalp Solution", "clinic_price_aed": 95.0, "patient_price_aed": 190.0},
            {"dose": "Tretinoin 0.05%", "volume": "30 mL", "format": "solution", "formatName": "Scalp Solution", "clinic_price_aed": 80.0, "patient_price_aed": 160.0},
            {"dose": "Tretinoin 0.05%", "volume": "50 mL", "format": "solution", "formatName": "Scalp Solution", "clinic_price_aed": 100.0, "patient_price_aed": 200.0}
        ]
    },
    {
        "name": "Betamethasone + Salicylic Acid Scalp Solution",
        "canonicalName": "Anti-Inflammatory Scalp Solution",
        "category": "Trichology & Hair Care",
        "variants": [
            {"dose": "Betamethasone 0.05% + Salicylic Acid", "volume": "30 mL", "format": "solution", "formatName": "Scalp Solution", "clinic_price_aed": 125.0, "patient_price_aed": 250.0},
            {"dose": "Betamethasone 0.05% + Salicylic Acid", "volume": "50 mL", "format": "solution", "formatName": "Scalp Solution", "clinic_price_aed": 140.0, "patient_price_aed": 280.0}
        ]
    },
    # Page 7: IVNT
    {
        "name": "NAD+ IV Infusion Vial",
        "canonicalName": "NAD+ IV Infusion",
        "category": "IVNT & Infusion Therapy",
        "variants": [
            {"dose": "100 mg", "volume": "10 mL", "format": "iv_vial", "formatName": "IV Infusion Vial", "clinic_price_aed": 100.0, "patient_price_aed": 150.0},
            {"dose": "250 mg", "volume": "10 mL", "format": "iv_vial", "formatName": "IV Infusion Vial", "clinic_price_aed": 200.0, "patient_price_aed": 300.0},
            {"dose": "500 mg", "volume": "10 mL", "format": "iv_vial", "formatName": "IV Infusion Vial", "clinic_price_aed": 350.0, "patient_price_aed": 500.0},
            {"dose": "750 mg", "volume": "10 mL", "format": "iv_vial", "formatName": "IV Infusion Vial", "clinic_price_aed": 750.0, "patient_price_aed": 1200.0}
        ]
    },
    {
        "name": "Methylene Blue IV Vial",
        "canonicalName": "Methylene Blue Pharmaceutical Grade",
        "category": "IVNT & Infusion Therapy",
        "variants": [
            {"dose": "100 mg", "volume": "10 mL", "format": "iv_vial", "formatName": "IV Infusion Vial", "clinic_price_aed": 170.0, "patient_price_aed": 300.0}
        ]
    },
    {
        "name": "BioBlend Standard IV Drip Cocktails",
        "canonicalName": "Standard Micronutrient IV Infusion",
        "category": "IVNT & Infusion Therapy",
        "variants": [
            {"dose": "Energy Drip Cocktail", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Energy Drip Cocktail", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Radiant Skin Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Radiant Skin Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Immune Boost Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Immune Boost Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Detoxification Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Detoxification Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Fat Burning Metabolic Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Fat Burning Metabolic Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Glow Anti-Aging Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Glow Anti-Aging Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Brain Power Neuro Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Brain Power Neuro Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "Athletic Recovery Drip", "volume": "25 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 180.0, "patient_price_aed": 360.0},
            {"dose": "Athletic Recovery Drip", "volume": "50 mL", "format": "iv_bag_blend", "formatName": "IV Infusion Blend", "clinic_price_aed": 280.0, "patient_price_aed": 560.0}
        ]
    }
]

# PHASE 4: BHRT (Pages 8 - 12)
phase4_items = [
    {
        "name": "Bi-Est (Estriol & Estradiol)",
        "canonicalName": "Bi-Est Bioidentical Estrogen",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "0.50 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 235.0, "patient_price_aed": 470.0},
            {"dose": "1.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 240.0, "patient_price_aed": 480.0},
            {"dose": "2.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 250.0, "patient_price_aed": 500.0},
            {"dose": "3.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 262.0, "patient_price_aed": 524.0},
            {"dose": "5.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 284.0, "patient_price_aed": 568.0}
        ]
    },
    {
        "name": "Estriol (E3)",
        "canonicalName": "Estriol",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "0.50 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 207.0, "patient_price_aed": 414.0},
            {"dose": "1.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 212.0, "patient_price_aed": 424.0},
            {"dose": "2.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 221.0, "patient_price_aed": 442.0},
            {"dose": "4.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 239.0, "patient_price_aed": 478.0}
        ]
    },
    {
        "name": "Estradiol (E2)",
        "canonicalName": "Estradiol",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "0.25 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 200.0, "patient_price_aed": 400.0},
            {"dose": "0.50 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 205.0, "patient_price_aed": 410.0},
            {"dose": "1.00 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 215.0, "patient_price_aed": 430.0}
        ]
    },
    {
        "name": "DHEA",
        "canonicalName": "DHEA",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "10 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 95.0, "patient_price_aed": 190.0},
            {"dose": "25 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 105.0, "patient_price_aed": 210.0},
            {"dose": "50 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 115.0, "patient_price_aed": 230.0},
            {"dose": "100 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 135.0, "patient_price_aed": 270.0}
        ]
    },
    {
        "name": "Hydrocortisone",
        "canonicalName": "Hydrocortisone Bioidentical",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "5 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 120.0, "patient_price_aed": 240.0},
            {"dose": "10 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 125.0, "patient_price_aed": 250.0},
            {"dose": "20 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 130.0, "patient_price_aed": 260.0}
        ]
    },
    {
        "name": "Liothyronine (T3)",
        "canonicalName": "Liothyronine Sodium (T3)",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "5 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 95.0, "patient_price_aed": 190.0},
            {"dose": "10 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 104.0, "patient_price_aed": 208.0},
            {"dose": "25 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 117.0, "patient_price_aed": 234.0}
        ]
    },
    {
        "name": "Levothyroxine (T4)",
        "canonicalName": "Levothyroxine (T4)",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "50 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 72.0, "patient_price_aed": 144.0},
            {"dose": "100 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 74.0, "patient_price_aed": 148.0},
            {"dose": "150 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 76.0, "patient_price_aed": 152.0}
        ]
    },
    {
        "name": "Low Dose Naltrexone (LDN)",
        "canonicalName": "Naltrexone HCl",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "1.5 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 110.0, "patient_price_aed": 220.0},
            {"dose": "3 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 120.0, "patient_price_aed": 240.0},
            {"dose": "4.5 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 130.0, "patient_price_aed": 260.0},
            {"dose": "1.5 mg", "pack_size": "30 sublingual tabs", "format": "sublingual", "formatName": "Sublingual Tab", "clinic_price_aed": 127.5, "patient_price_aed": 255.0},
            {"dose": "3 mg", "pack_size": "30 sublingual tabs", "format": "sublingual", "formatName": "Sublingual Tab", "clinic_price_aed": 160.5, "patient_price_aed": 321.0},
            {"dose": "4.5 mg", "pack_size": "30 sublingual tabs", "format": "sublingual", "formatName": "Sublingual Tab", "clinic_price_aed": 193.5, "patient_price_aed": 387.0}
        ]
    },
    {
        "name": "Pregnenolone",
        "canonicalName": "Pregnenolone",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "25 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 110.0, "patient_price_aed": 220.0},
            {"dose": "50 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 125.0, "patient_price_aed": 250.0},
            {"dose": "100 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 145.0, "patient_price_aed": 290.0}
        ]
    },
    {
        "name": "Progesterone Bioidentical",
        "canonicalName": "Progesterone Micronized",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "50 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 232.0, "patient_price_aed": 464.0},
            {"dose": "100 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 248.0, "patient_price_aed": 496.0},
            {"dose": "200 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "50 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 232.0, "patient_price_aed": 464.0},
            {"dose": "100 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 248.0, "patient_price_aed": 496.0}
        ]
    },
    {
        "name": "Testosterone Bioidentical Cream",
        "canonicalName": "Testosterone Micronized",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "10 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream (Topi-CLICK)", "clinic_price_aed": 240.0, "patient_price_aed": 480.0},
            {"dose": "50 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream (Topi-CLICK)", "clinic_price_aed": 280.0, "patient_price_aed": 560.0},
            {"dose": "100 mg/mL", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream (Topi-CLICK)", "clinic_price_aed": 330.0, "patient_price_aed": 660.0}
        ]
    },
    {
        "name": "4-Hormones Bioidentical Synergy",
        "canonicalName": "Bi-Est + Progesterone + Testosterone + DHEA",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "Custom Quad-Hormone Synergy", "volume": "30 mL", "format": "cream", "formatName": "Topical Cream", "clinic_price_aed": 420.0, "patient_price_aed": 840.0}
        ]
    }
]

all_data = {
    "phase1": p1,
    "phase2": phase2_items,
    "phase3": phase3_items,
    "phase4": phase4_items
}

with open("/Users/joseluiszabala/regenpept-web.nosync/scripts/bioblend_catalog_data.json", "w") as f:
    json.dump(all_data, f, indent=2)

print(f"Generated complete catalog data:")
print(f"  Phase 1 (Peptides Pen/Spray/Oral): {len(p1)} products")
print(f"  Phase 2 (Derma & Anesthesia): {len(phase2_items)} products")
print(f"  Phase 3 (Hair & IVNT): {len(phase3_items)} products")
print(f"  Phase 4 (BHRT Endocrinology): {len(phase4_items)} products")
print(f"  Total products across all 4 phases: {len(p1) + len(phase2_items) + len(phase3_items) + len(phase4_items)}")
