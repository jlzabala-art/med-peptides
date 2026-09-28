"""
bioblend_parser.py
Parses the 12-page BioBlend Master Price List and outputs structured JSON for the 4-phase importer.
"""
import json
import re

with open("/Users/joseluiszabala/.gemini/antigravity-ide/brain/e3a6ef7b-8c9a-4ac7-abc7-72c120140594/scratch/bioblend_extracted.json") as f:
    raw_pages = json.load(f)

# Helper to clean numbers
def parse_price(val):
    if not val:
        return None
    val_clean = str(val).replace(",", "").replace("AED", "").replace("G", "0").replace("O", "0").strip()
    if val_clean.upper() in ["NA", "N/A", "-", ""]:
        return None
    try:
        return float(val_clean)
    except:
        return None

# PHASE 1: PEPTIDES (PAGES 2 & 3)
phase1_items = [
    # Page 2: Pen & Cartridge
    {
        "name": "AOD-9604",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "3.6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 440.0, "refill_price_aed": 340.0},
            {"dose": "15 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1700.0, "refill_price_aed": 1600.0}
        ]
    },
    {
        "name": "BPC-157",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 405.0, "refill_price_aed": 305.0},
            {"dose": "15 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 850.0, "refill_price_aed": 750.0}
        ]
    },
    {
        "name": "BPC-157 + TB-4",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "6 mg / 9 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 670.0, "refill_price_aed": 570.0}
        ]
    },
    {
        "name": "BPC-157 + TB-500",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "6 mg / 9 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 670.0, "refill_price_aed": 570.0},
            {"dose": "15 mg / 22.5 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1350.0, "refill_price_aed": 1250.0}
        ]
    },
    {
        "name": "CJC-1295 No DAC",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "3 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 440.0, "refill_price_aed": 340.0}
        ]
    },
    {
        "name": "CJC-1295 + Ipamorelin",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "3 mg / 6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 610.0, "refill_price_aed": 510.0},
            {"dose": "6 mg / 6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 700.0, "refill_price_aed": 600.0}
        ]
    },
    {
        "name": "CJC-1295 + Ipamorelin + DSIP",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "3 mg / 6 mg / 6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1995.0, "refill_price_aed": 1895.0}
        ]
    },
    {
        "name": "DSIP",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "2 mg", "volume": "2 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 500.0, "refill_price_aed": 400.0}
        ]
    },
    {
        "name": "Epithalon",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "30 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 740.0, "refill_price_aed": 640.0},
            {"dose": "100 mg", "volume": "2 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 2100.0, "refill_price_aed": 2000.0}
        ]
    },
    {
        "name": "GHK-Cu",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "30 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 405.0, "refill_price_aed": 305.0},
            {"dose": "60 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 690.0, "refill_price_aed": 590.0}
        ]
    },
    {
        "name": "GLOW Triple Peptide",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "BPC-157 6 mg + TB-500 9 mg + GHK-Cu 30 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1150.0, "refill_price_aed": 1050.0}
        ]
    },
    {
        "name": "IGF-1 LR3",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "300 mcg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 395.0, "refill_price_aed": 295.0}
        ]
    },
    {
        "name": "Ipamorelin",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 450.0, "refill_price_aed": 350.0}
        ]
    },
    {
        "name": "Kisspeptin-10",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "3 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 625.0, "refill_price_aed": 525.0}
        ]
    },
    {
        "name": "KLOW Peptide without GHK",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "BPC-157 6 mg + TB-500 6 mg + KPV 6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1150.0, "refill_price_aed": 1050.0}
        ]
    },
    {
        "name": "KLOW Peptide with GHK",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "BPC-157 6 mg + TB-500 6 mg + GHK-Cu 30 mg + KPV 6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1895.0, "refill_price_aed": 1795.0}
        ]
    },
    {
        "name": "KPV",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "10 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 650.0, "refill_price_aed": 550.0}
        ]
    },
    {
        "name": "Melanotan II",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "6 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 500.0, "refill_price_aed": 400.0}
        ]
    },
    {
        "name": "MOTS-c",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "30 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1250.0, "refill_price_aed": 1150.0},
            {"dose": "40 mg", "volume": "2 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1350.0, "refill_price_aed": 1250.0},
            {"dose": "60 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 2150.0, "refill_price_aed": 2050.0}
        ]
    },
    {
        "name": "PT-141",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "20 mg", "volume": "2 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 500.0, "refill_price_aed": 400.0}
        ]
    },
    {
        "name": "Selank",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "7.5 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 660.0, "refill_price_aed": 560.0}
        ]
    },
    {
        "name": "Semax",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "9 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 775.0, "refill_price_aed": 675.0}
        ]
    },
    {
        "name": "Sermorelin",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "3 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 550.0, "refill_price_aed": 450.0}
        ]
    },
    {
        "name": "Thymosin Alpha-1",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "9 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 480.0, "refill_price_aed": 380.0}
        ]
    },
    {
        "name": "Thymosin Beta-4",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "9 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 475.0, "refill_price_aed": 375.0},
            {"dose": "45 mg", "volume": "2.25 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1700.0, "refill_price_aed": 1600.0}
        ]
    },
    {
        "name": "TB-500",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "9 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 475.0, "refill_price_aed": 375.0},
            {"dose": "45 mg", "volume": "2.25 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1700.0, "refill_price_aed": 1600.0}
        ]
    },
    {
        "name": "Tesamorelin",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "30 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1850.0, "refill_price_aed": 1750.0}
        ]
    },
    {
        "name": "hCG",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "5,000 IU", "volume": "2 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 550.0, "refill_price_aed": 450.0}
        ]
    },
    {
        "name": "NAD+",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "750 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 750.0, "refill_price_aed": 650.0},
            {"dose": "1050 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 950.0, "refill_price_aed": 850.0}
        ]
    },
    {
        "name": "MGF",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "2.4 mg", "volume": "2.4 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 790.0, "refill_price_aed": 690.0}
        ]
    },
    {
        "name": "SS-31",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "10 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 790.0, "refill_price_aed": 690.0},
            {"dose": "50 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 2400.0, "refill_price_aed": 2300.0}
        ]
    },
    {
        "name": "Humanin",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "30 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 2900.0, "refill_price_aed": 2800.0}
        ]
    },
    {
        "name": "Fat Loss Peptide",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "62.5 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 850.0, "refill_price_aed": 750.0}
        ]
    },
    {
        "name": "Advance Fat Loss",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "15 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1500.0, "refill_price_aed": 1400.0},
            {"dose": "40 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1900.0, "refill_price_aed": 1800.0}
        ]
    },
    {
        "name": "Amylix",
        "category": "Peptides - Injectable",
        "variants": [
            {"dose": "7.5 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1300.0, "refill_price_aed": 1200.0},
            {"dose": "12 mg", "volume": "3 mL", "format": "pen", "formatName": "Pre-Filled Pen", "clinic_price_aed": 1500.0, "refill_price_aed": 1400.0}
        ]
    },
    # Page 3: Nasal Spray
    {
        "name": "Selank Nasal Spray",
        "canonicalName": "Selank",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "30 mg", "volume": "4 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 495.0},
            {"dose": "30 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 495.0},
            {"dose": "75 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 990.0}
        ]
    },
    {
        "name": "Semax Nasal Spray",
        "canonicalName": "Semax",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "30 mg", "volume": "4 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 495.0},
            {"dose": "30 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 495.0},
            {"dose": "75 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 990.0}
        ]
    },
    {
        "name": "Semax + Selank",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "15 mg + 15 mg", "volume": "4 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 550.0},
            {"dose": "15 mg + 15 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 550.0},
            {"dose": "30 mg + 30 mg", "volume": "4 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 850.0},
            {"dose": "30 mg + 30 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 850.0},
            {"dose": "37.5 mg + 37.5 mg (75 mg)", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 990.0}
        ]
    },
    {
        "name": "Semax + Oxytocin",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "10 mg + 1,000 IU", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 450.0}
        ]
    },
    {
        "name": "PT-141 Nasal Spray",
        "canonicalName": "PT-141",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "10 mg", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 510.0}
        ]
    },
    {
        "name": "PT-141 + Pyridoxine",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "5 mg + 25 mg", "volume": "3 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 350.0}
        ]
    },
    {
        "name": "PT-141 + Oxytocin (Standard)",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "7.5 mg + 300 IU", "volume": "3 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 550.0}
        ]
    },
    {
        "name": "PT-141 + Oxytocin (Advanced High Strength)",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "15 mg + 600 IU", "volume": "3 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 690.0}
        ]
    },
    {
        "name": "NAD+ Nasal Spray",
        "canonicalName": "NAD+",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "1000 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 750.0},
            {"dose": "1500 mg", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 995.0}
        ]
    },
    {
        "name": "Oxytocin Nasal Spray",
        "canonicalName": "Oxytocin",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "5-15 IU/puff", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 245.0},
            {"dose": "20-35 IU/puff", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 360.0},
            {"dose": "40 IU/puff", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 450.0},
            {"dose": "50 IU/puff", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 540.0}
        ]
    },
    {
        "name": "Kisspeptin Nasal Spray",
        "canonicalName": "Kisspeptin-10",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "10 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 950.0}
        ]
    },
    {
        "name": "EDTA + Xylitol Nasal Spray",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "75 mg", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 250.0}
        ]
    },
    {
        "name": "DSIP Nasal Spray",
        "canonicalName": "DSIP",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "15 mg", "volume": "15 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 630.0}
        ]
    },
    {
        "name": "Epithalon Nasal Spray",
        "canonicalName": "Epithalon",
        "category": "Peptides - Nasal Spray",
        "variants": [
            {"dose": "30 mg", "volume": "10 mL", "format": "nasal_spray", "formatName": "Nasal Spray", "clinic_price_aed": 640.0}
        ]
    },
    # Page 3: Oral Capsules
    {
        "name": "BPC-157 Oral Capsules",
        "canonicalName": "BPC-157",
        "category": "Peptides - Oral",
        "variants": [
            {"dose": "200 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 369.0},
            {"dose": "500 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 495.0}
        ]
    },
    {
        "name": "Dihexa",
        "category": "Peptides - Oral",
        "variants": [
            {"dose": "2.5 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 500.0},
            {"dose": "5 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 920.0},
            {"dose": "10 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 1800.0},
            {"dose": "20 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 2700.0}
        ]
    },
    {
        "name": "KPV Oral Capsules",
        "canonicalName": "KPV",
        "category": "Peptides - Oral",
        "variants": [
            {"dose": "250 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 295.0},
            {"dose": "500 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 495.0}
        ]
    },
    {
        "name": "Peptide Golden GUT Support",
        "category": "Peptides - Oral",
        "description": "BPC-157 500mcg + KPV 500mcg + Curcumin 200mg + L-Glutamine 250mg",
        "variants": [
            {"dose": "500mcg/500mcg/200mg/250mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 549.0}
        ]
    },
    {
        "name": "SLU-PP-332",
        "category": "Peptides - Oral",
        "variants": [
            {"dose": "250 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 200.0},
            {"dose": "500 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 350.0},
            {"dose": "1000 mcg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 675.0}
        ]
    },
    {
        "name": "Enclomiphene",
        "category": "BHRT & Endocrinology",
        "variants": [
            {"dose": "6.25 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 390.0},
            {"dose": "12.5 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 575.0},
            {"dose": "25 mg", "pack_size": "30 capsules", "format": "capsule", "formatName": "Oral Capsule", "clinic_price_aed": 990.0}
        ]
    }
]

catalog_data = {
    "phase1": phase1_items
}

with open("/Users/joseluiszabala/regenpept-web.nosync/scripts/bioblend_phase1.json", "w") as f:
    json.dump(catalog_data, f, indent=2)

print(f"Generated Phase 1 items: {len(phase1_items)} master products.")
