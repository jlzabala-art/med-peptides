#!/usr/bin/env python3
"""
sync_enriched_protocols_to_firestore.py
----------------------------------------
Sube todos los protocolos enriquecidos del archivo
export/protocols_all_enriched.json → colección `protocols` en Firestore.

• Si el doc ya existe → MERGE (no sobreescribe campos que no están en el JSON)
• Si no existe → CREATE
• Agrega syncedAt timestamp a cada doc

Usage:
  python3 scripts/sync_enriched_protocols_to_firestore.py [--dry-run]
"""

import json
import sys
import os
import argparse
from datetime import datetime, timezone

# ── Args ───────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--dry-run", action="store_true", help="Preview what would be uploaded without writing")
parser.add_argument("--collection", default="protocols", help="Firestore collection name (default: protocols)")
parser.add_argument("--source", default="export/protocols_all_enriched.json", help="Source JSON file")
parser.add_argument("--key", default="serviceAccountKey.json", help="Service account key file")
args = parser.parse_args()

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_FILE = os.path.join(BASE_DIR, args.source)
KEY_FILE = os.path.join(BASE_DIR, args.key)

print(f"\n{'='*60}")
print(f"  RegenPEPT · Enriched Protocols → Firestore Sync")
print(f"{'='*60}")
print(f"  Source  : {args.source}")
print(f"  Target  : Firestore/{args.collection}")
print(f"  Dry-run : {args.dry_run}")
print(f"{'='*60}\n")

# ── Load source data ──────────────────────────────────────────────────────────
if not os.path.exists(SOURCE_FILE):
    print(f"❌ Source file not found: {SOURCE_FILE}")
    sys.exit(1)

with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

protocols = data.get("protocols", {})
total = len(protocols)
print(f"📦 Found {total} protocols in enriched bundle")
print(f"   Schema version : {data.get('schema_version', 'n/a')}")
print(f"   Exported at    : {data.get('exported_at', 'n/a')}")
print()

if total == 0:
    print("⚠️  No protocols found. Check the JSON structure.")
    sys.exit(0)

# ── Firebase init ─────────────────────────────────────────────────────────────
if not args.dry_run:
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print("❌ firebase-admin not installed. Run: pip3 install firebase-admin")
        sys.exit(1)

    if not os.path.exists(KEY_FILE):
        print(f"❌ Service account key not found: {KEY_FILE}")
        sys.exit(1)

    cred = credentials.Certificate(KEY_FILE)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    collection_ref = db.collection(args.collection)
    print(f"✅ Firebase connected → project: {cred.project_id}\n")

# ── Helper: strip None and internal-only Python fields ───────────────────────
def clean_doc(d):
    """Recursively remove None values (Firestore doesn't allow None)."""
    if isinstance(d, dict):
        return {k: clean_doc(v) for k, v in d.items() if v is not None}
    elif isinstance(d, list):
        return [clean_doc(i) for i in d if i is not None]
    return d

# ── Upload loop ───────────────────────────────────────────────────────────────
NOW = datetime.now(timezone.utc).isoformat()
results = {"created": [], "updated": [], "failed": [], "skipped": []}

for i, (protocol_id, protocol_data) in enumerate(protocols.items(), 1):
    doc_id = protocol_data.get("protocol_id") or protocol_data.get("id") or protocol_id
    title = protocol_data.get("protocol_title", protocol_data.get("title", "?"))
    prefix = f"[{i:02d}/{total}]"

    # Build the payload
    payload = clean_doc(protocol_data)
    payload["syncedAt"] = NOW
    payload["_syncSource"] = f"export/protocols/{doc_id}.json"
    payload["_schemaVersion"] = data.get("schema_version", "antigravity_v2")

    if args.dry_run:
        top_keys = list(payload.keys())
        print(f"  {prefix} 🔍 DRY-RUN · {doc_id}")
        print(f"           Title : {title}")
        print(f"           Keys  : {len(top_keys)} top-level fields")
        print(f"           Phases: {len(payload.get('phases', payload.get('phase_blueprints', [])))} phase(s)")
        print()
        results["skipped"].append(doc_id)
        continue

    try:
        doc_ref = collection_ref.document(doc_id)
        # SET with merge=True → upsert behaviour
        doc_ref.set(payload, merge=True)

        # Check if it existed before (we can't easily tell after merge, so just log as updated)
        print(f"  {prefix} ✅ {doc_id:20s}  →  {title}")
        results["updated"].append(doc_id)

    except Exception as e:
        print(f"  {prefix} ❌ FAILED · {doc_id}: {e}")
        results["failed"].append(doc_id)

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Sync Complete")
print(f"{'='*60}")
if args.dry_run:
    print(f"  DRY-RUN — {len(results['skipped'])} protocols previewed, nothing written")
else:
    print(f"  ✅ Synced    : {len(results['updated'])} protocols")
    print(f"  ❌ Failed    : {len(results['failed'])} protocols")
    if results["failed"]:
        print(f"  Failed IDs  : {', '.join(results['failed'])}")
print(f"{'='*60}\n")
