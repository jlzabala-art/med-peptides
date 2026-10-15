import os
import re
import json
import tempfile
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import pypdf

# 1. Initialize Firebase Admin SDK
env_vars = {}
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('\"').strip('\'')

private_key = env_vars.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n')
client_email = env_vars.get('FIREBASE_CLIENT_EMAIL')
project_id = env_vars.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID') or env_vars.get('FIREBASE_PROJECT_ID')
bucket_name = env_vars.get('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') or f'{project_id}.firebasestorage.app'

cred = credentials.Certificate({
    "type": "service_account",
    "project_id": project_id,
    "private_key": private_key,
    "client_email": client_email,
    "token_uri": "https://oauth2.googleapis.com/token"
})

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})

db = firestore.client()
bucket = storage.bucket()

def parse_fagron_pdf(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    
    # 1. Date of results
    results_date = None
    patient_name = None
    sample_code = None
    
    for p in reader.pages[:6]:
        txt = p.extract_text()
        if not results_date:
            m = re.search(r'(?:Genetic results date|Date of the results|Results date|Date of results|Genetic results)\s*\n\s*([0-9]{2}-[0-9]{2}-[0-9]{4})', txt, re.IGNORECASE)
            if not m:
                m = re.search(r'([0-9]{2}-[0-9]{2}-[0-9]{4})', txt)
            if m: results_date = m.group(1)
        if not patient_name:
            m = re.search(r'Patient(?:\'s)?\s*name\s*\n\s*([^\n•]+)', txt, re.IGNORECASE)
            if m: patient_name = m.group(1).strip()
        if not sample_code:
            m = re.search(r'Sample\s*code\s*\n\s*(BOX[0-9A-Z]+)', txt, re.IGNORECASE)
            if m: sample_code = m.group(1).strip()

    # 2. Section III pages (pages 9 to 14)
    parts = []
    
    for p_idx in range(8, min(15, len(reader.pages))):
        text = reader.pages[p_idx].extract_text()
        
        if 'Formula' not in text:
            continue
            
        is_oral = 'Oral treatment' in text
        is_topical = 'Topical treatment' in text and not is_oral
        is_scalp_care = 'Scalp care and hygiene' in text
        
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        formula_indices = [idx for idx, l in enumerate(lines) if l.lower() == 'formula']
        if not formula_indices:
            continue
        f_idx = formula_indices[-1]
            
        posology = ''
        pos_idx = len(lines)
        for i in range(f_idx + 1, len(lines)):
            if lines[i].lower() == 'posology' or lines[i].lower().startswith('posology'):
                pos_idx = i
                p_lines = []
                for k in range(i + 1, len(lines)):
                    if any(stop in lines[k] for stop in ['Signature', 'Physician', '/ 29', '/ 28', '/ 30']):
                        break
                    p_lines.append(lines[k])
                posology = ' '.join(p_lines)
                break
                
        formula_lines = lines[f_idx+1:pos_idx]
        
        vehicle_line = None
        apis = []
        i = 0
        while i < len(formula_lines):
            curr = formula_lines[i]
            if any(v.lower() in curr.lower() for v in ['TrichoSol', 'TrichoFoam', 'TrichoOil', 'TrichoWash', 'TrichoCond']):
                vol = ''
                if i + 1 < len(formula_lines) and any(u in formula_lines[i+1].lower() for u in ['ml', 'mg', 'capsule']):
                    vol = formula_lines[i+1]
                    i += 1
                vehicle_line = f'{curr} {vol}'.strip()
                i += 1
                continue
            
            if i + 1 < len(formula_lines) and re.match(r'^[0-9]+(?:\.[0-9]+)?\s*(?:%|mg|mcg|ml|g)', formula_lines[i+1], re.IGNORECASE):
                api_name = curr
                api_dose = formula_lines[i+1]
                apis.append({'name': api_name, 'dose': api_dose, 'dosage': api_dose, 'strength': api_dose})
                i += 2
            else:
                m_dose = re.search(r'([0-9]+(?:\.[0-9]+)?\s*(?:%|mg|mcg|ml|g))', curr, re.IGNORECASE)
                if m_dose:
                    api_dose = m_dose.group(1)
                    api_name = curr[:m_dose.start()].strip()
                    if api_name:
                        apis.append({'name': api_name, 'dose': api_dose, 'dosage': api_dose, 'strength': api_dose})
                i += 1
                
        if apis or vehicle_line:
            part_num = len(parts) + 1
            if is_oral:
                fmt = 'ORAL CAPSULES'
                dosageForm = 'Oral Capsules (Vegetable)'
                title = f'Oral Treatment (90 Capsules)'
                vh = vehicle_line or 'Vegetarian HPMC Capsules (90 Caps)'
                vol = '90 Capsules'
                route = 'Oral Route'
            elif is_scalp_care and 'oil' in (vehicle_line or '').lower():
                fmt = 'SCALP CARE & LIPIDIC OIL'
                dosageForm = 'Scalp Care Oil'
                title = f'Scalp Care & Lipid Protection ({vehicle_line or "30 mL"})'
                vh = vehicle_line or 'TrichoOil™ (q.s. 30 mL)'
                vol = '30 mL'
                route = 'Topical Scalp Application & Massage'
            elif is_scalp_care:
                fmt = 'SCALP WASH'
                dosageForm = 'Scalp Cleansing Wash'
                title = f'Scalp Hygiene & Conditioning Cleanser ({vehicle_line or "250 mL"})'
                vh = vehicle_line or 'TrichoWash™ (q.s. 250 mL)'
                vol = '250 mL'
                route = 'Topical Scalp Cleanser'
            else:
                is_foam = 'foam' in (vehicle_line or '').lower()
                fmt = 'TOPICAL FOAM' if is_foam else 'TOPICAL SOLUTION'
                dosageForm = 'Topical Foam' if is_foam else 'Topical Solution'
                title = f'Topical Treatment ({vehicle_line or "100 mL"})'
                vh = vehicle_line or ('TrichoFoam™ (q.s. 100 mL)' if is_foam else 'TrichoSol™ (q.s. 100 mL)')
                vol = '100 mL'
                route = 'Topical Scalp Application'
                
            parts.append({
                'partNumber': part_num,
                'title': title,
                'format': fmt,
                'dosageForm': dosageForm,
                'vehicle': vh,
                'volume': vol,
                'route': route,
                'posology': posology,
                'directions': posology,
                'apis': apis
            })
            
    return {
        'results_date': results_date,
        'patient_name': patient_name,
        'sample_code': sample_code,
        'parts': parts
    }

def main():
    print("=== STARTING BATCH REPAIR OF 78 PRESCRIPTIONS ===")
    
    docs = list(db.collection('prescriptions').stream())
    print(f"Total prescriptions fetched: {len(docs)}")
    
    repaired_count = 0
    skipped_count = 0
    
    for d in docs:
        rx_id = d.id
        data = d.to_dict()
        items = data.get('items', [])
        
        # Check if affected
        missing_dose = len([i for i in items if not (i.get('dose') or i.get('dosage') or '').strip() or (i.get('dose') or '').strip() == '-'])
        is_affected = (len(items) >= 8 and missing_dose >= 4)
        
        if not is_affected:
            continue
            
        storage_path = data.get('fagron', {}).get('storagePath')
        if not storage_path:
            print(f"[{rx_id}] No storage path found! Skipping.")
            skipped_count += 1
            continue
            
        print(f"\nProcessing [{rx_id}] - Patient: {data.get('patientName')} | Box: {data.get('fagron', {}).get('boxId')}...")
        
        # Download PDF to temp file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tf:
            temp_path = tf.name
            
        try:
            blob = bucket.blob(storage_path)
            blob.download_to_filename(temp_path)
            
            parsed = parse_fagron_pdf(temp_path)
            parts = parsed['parts']
            results_date = parsed['results_date']
            
            if not parts:
                print(f"[{rx_id}] Failed to parse parts from PDF! Skipping.")
                skipped_count += 1
                continue
                
            # Date formatting (e.g. 16-01-2026 -> 2026-01-16)
            iso_date = None
            if results_date:
                try:
                    d_obj = datetime.strptime(results_date, '%d-%m-%Y')
                    iso_date = d_obj.strftime('%Y-%m-%d')
                except Exception:
                    iso_date = results_date
            else:
                iso_date = data.get('dateIssued') or datetime.now().strftime('%Y-%m-%d')
                results_date = data.get('date') or datetime.now().strftime('%d/%m/%Y')
                
            # Flatten items across parts with dosage
            all_items = []
            topical_names = []
            for p in parts:
                for api in p['apis']:
                    all_items.append({
                        'name': api['name'],
                        'dose': api['dose'],
                        'dosage': api['dose'],
                        'strength': api['dose'],
                        'type': 'formula_component',
                        'quantity': 1,
                        'partTitle': p['title']
                    })
                    if 'topical' in p['format'].lower():
                        topical_names.append(api['name'])
                        
                all_items.append({
                    'name': p['vehicle'],
                    'dose': p['volume'],
                    'dosage': p['volume'],
                    'type': 'base_solution',
                    'quantity': 1,
                    'partTitle': p['title']
                })
                
            # Generate clean clinical titles
            main_title = ' & '.join(topical_names[:2]) if topical_names else 'Personalized Compounded Formula'
            treatment_title = f"{main_title} Scalp Regimen"
            regimen_short_title = f"{main_title} Regimen"
            
            # Construct update payload
            update_payload = {
                'totalParts': len(parts),
                'parts': parts,
                'items': all_items,
                'dateIssued': iso_date,
                'prescriptionDate': iso_date,
                'dateFormatted': results_date,
                'date': results_date,
                'treatmentTitle': treatment_title,
                'regimenShortTitle': regimen_short_title,
                'regimenCategory': 'Follicular & Hair Restoration',
                'regimenCategoryShort': 'Follicular',
                'regimenCategoryId': 'follicular_hair',
                'regimenCategoryCode': 'HAIR-RX',
                'wholeseller': 'YDL',
                'wholesalerId': 'clinic-ydl-dubai',
                'wholesellerName': 'York Diagnostic Laboratories DMCC (YDL)',
                'doctorName': 'Dr. Çağatay Sezgin',
                'doctorId': 'z3aUIMaYsPViG1JgM95r',
                'doctor': {
                    'id': 'z3aUIMaYsPViG1JgM95r',
                    'name': 'Dr. Çağatay Sezgin',
                    'email': 'sezgin@novomed.com'
                },
                'documents': [
                    {
                        'name': os.path.basename(storage_path),
                        'url': data.get('fagron', {}).get('originalPdfUrl') or f"https://storage.googleapis.com/{bucket_name}/{storage_path}",
                        'storagePath': storage_path,
                        'type': 'PDF',
                        'uploadedAt': datetime.now().isoformat(),
                        'uploadedBy': 'Dr. Çağatay Sezgin',
                        'analyzedByAI': True
                    }
                ],
                'updatedAt': datetime.now().isoformat()
            }
            
            db.collection('prescriptions').document(rx_id).set(update_payload, merge=True)
            repaired_count += 1
            print(f"[{rx_id}] Successfully repaired! {len(parts)} parts, {len(all_items)} items, date: {iso_date}")
            
        except Exception as e:
            print(f"[{rx_id}] Error repairing: {e}")
            skipped_count += 1
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    print(f"\n=== BATCH REPAIR COMPLETED ===")
    print(f"Total Repaired: {repaired_count}")
    print(f"Total Skipped: {skipped_count}")

if __name__ == '__main__':
    main()
