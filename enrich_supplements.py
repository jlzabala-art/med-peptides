import json
import os

# Clinical data extracted from search and expert analysis
ENRICHMENT_DATA = {
    "Ashwagandha": {
        "desc": "A potent Ayurvedic adaptogen studied for its ability to modulate the HPA axis and lower cortisol levels.",
        "clinical_benefits": ["Stress reduction", "Cortisol management", "Sleep improvement", "Fatigue reduction"],
        "mechanisms": ["HPA axis modulation", "GABAergic signaling support"],
        "objective": "Stress & Recovery",
        "goals": ["stress_reduction", "recovery", "sleep"],
        "tags": ["Adaptogen", "Stress", "Recovery"]
    },
    "Rhodiola Rosea": {
        "desc": "An arctic adaptogen researched for reducing stress-related fatigue and enhancing mental clarity during physical exertion.",
        "clinical_benefits": ["Fatigue reduction", "Stress resilience", "Cognitive support", "Physical stamina"],
        "mechanisms": ["Monoamine modulation", "Beta-endorphin support"],
        "objective": "Energy & Focus",
        "goals": ["energy", "focus", "stamina"],
        "tags": ["Adaptogen", "Energy", "Cognitive"]
    },
    "Lion's Mane Mushroom": {
        "desc": "A medicinal mushroom containing hericenones and erinacines that stimulate Nerve Growth Factor (NGF) synthesis.",
        "clinical_benefits": ["Neuroprotection", "Nerve growth support", "Cognitive enhancement", "Mood support"],
        "mechanisms": ["NGF stimulation", "Neurogenesis support"],
        "objective": "Neuroprotection",
        "goals": ["brain_health", "neuroregeneration", "focus"],
        "tags": ["Nootropic", "Brain Health", "Neuroprotection"]
    },
    "Co-Q10": {
        "desc": "A critical mitochondrial nutrient essential for ATP production and potent lipid-phase antioxidant protection.",
        "clinical_benefits": ["Cellular energy production", "Cardiovascular support", "Antioxidant protection", "Statins support"],
        "mechanisms": ["Mitochondrial ETC support", "ROS scavenging"],
        "objective": "Cellular Energy",
        "goals": ["energy", "cardio_health", "longevity"],
        "tags": ["Antioxidant", "Energy", "Cardio"]
    },
    "Berberine": {
        "desc": "A bioactive alkaloid that acts as an AMPK activator, fundamentally influencing glucose and lipid metabolism.",
        "clinical_benefits": ["Blood sugar management", "Insulin sensitivity", "Lipid lowering", "Metabolic support"],
        "mechanisms": ["AMPK activation", "GLUT4 translocation support"],
        "objective": "Metabolic Health",
        "goals": ["metabolism", "weight_loss", "blood_sugar"],
        "tags": ["Metabolic", "Glucose", "Weight"]
    },
    "Resveratrol": {
        "desc": "A polyphenol known for activating sirtuins and providing robust cardiovascular and antioxidant defense.",
        "clinical_benefits": ["Cardiovascular protection", "Anti-aging support", "Antioxidant defense", "Metabolic health"],
        "mechanisms": ["Sirtuin activation (SIRT1)", "Nrf2 pathway support"],
        "objective": "Longevity",
        "goals": ["anti_aging", "cardio_health", "longevity"],
        "tags": ["Antioxidant", "Longevity", "Sirtuin"]
    },
    "Ginkgo Biloba": {
        "desc": "One of the oldest living tree species, ginkgo is researched for enhancing peripheral and cerebral microcirculation.",
        "clinical_benefits": ["Memory support", "Focus improvement", "Cerebral circulation", "Antioxidant"],
        "mechanisms": ["Vasodilation support", "PAF inhibition"],
        "objective": "Cognitive Health",
        "goals": ["memory", "focus", "circulation"],
        "tags": ["Herbal", "Cognitive", "Circulation"]
    },
    "Boswellia": {
        "desc": "A botanical resin containing boswellic acids that specifically inhibit the 5-LOX enzyme pathway.",
        "clinical_benefits": ["Joint pain reduction", "Inflammation control", "Digestive support", "Respiratory health"],
        "mechanisms": ["5-LOX inhibition", "Cytokine modulation"],
        "objective": "Inflammation Control",
        "goals": ["joint_health", "inflammation", "mobility"],
        "tags": ["Anti-inflammatory", "Joints", "Recovery"]
    }
}

def enrich():
    supplements_path = 'src/data/supplements.js'
    with open(supplements_path, 'r') as f:
        content = f.read()
    
    # Extract the JSON part
    json_start = content.find('[')
    json_end = content.rfind(']') + 1
    data = json.loads(content[json_start:json_end])
    
    for item in data:
        name = item['name']
        if name in ENRICHMENT_DATA:
            enrichment = ENRICHMENT_DATA[name]
            item.update(enrichment)
            # Merge tags
            if 'tags' in item:
                item['tags'] = list(set(item['tags'] + enrichment.get('tags', [])))
            # Merge goals
            if 'goals' in item:
                item['goals'] = list(set(item['goals'] + enrichment.get('goals', [])))
            # Update keywords
            item['semanticKeywords'] = list(set(item.get('semanticKeywords', []) + [g.replace('_', ' ') for g in item['goals']] + [item['objective'].lower()]))
            
    # Write back
    new_content = content[:json_start] + json.dumps(data, indent=2) + ";\n"
    with open(supplements_path, 'w') as f:
        f.write(new_content)
    
    print(f"Enriched {len(ENRICHMENT_DATA)} supplement types across {len(data)} items.")

if __name__ == "__main__":
    enrich()
