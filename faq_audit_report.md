# FAQ Data Audit (Firebase vs Local)

This report provides a mapping of FAQs currently stored in Firebase (`peptide_faq`) to the products identified in the application code. This is intended to help clean up and synchronize the database.

## 📊 Summary Statistics
- **Total Products in Code**: 50+
- **Total FAQs in Firebase (`peptide_faq`)**: 4
- **Total Mappings in Firebase (`faq_peptide_mapping`)**: 2
- **Mapped Coverage**: <5% of products have Firebase-driven FAQs.

---

## 🏗️ FAQ Mapping by Product (Firebase)

| Product | Question | FAQ ID | Status |
|---------|----------|--------|--------|
| **BPC-157** | What is BPC-157 and what does it do? | `bpc157_intro` | ✅ Mapped |
| **BPC-157** | How do I reconstitute lyophilized peptides? | `reconstitution_guide` | ✅ Mapped |
| **GLP-1 Duo (Sema/Tirz)** | *No current mappings* | - | ❌ Missing |
| **Semaglutide** | *No current mappings* | - | ❌ Missing |
| **Tirzepatide** | *No current mappings* | - | ❌ Missing |

---

## 🔍 Unmapped FAQs in Firebase
These FAQs exist in the `peptide_faq` collection but have no corresponding entry in `faq_peptide_mapping`.

| Question | FAQ ID | Potential Products |
|----------|--------|--------------------|
| **What peptides support cognitive function?** | `cognitive_peptides_list` | Cerebrolysin, Semax, Selank, BPC-157 |
| **What is the difference between Semaglutide and Tirzepatide?** | `sema_vs_tirz_comp` | Semaglutide, Tirzepatide |

---

## 🛠️ Data Debugging & Recommendations

### 1. Identify "Hidden" FAQs
The file `src/data/products.js` contains a large number of `faqModalItems`. For example, **BPC-157** has 5 questions defined locally:
- *What is the main research positioning for BPC-157?*
- *Why should BPC-157 variants be grouped?*
- ...and 3 more.

**Action**: These are **NOT** in Firebase. If you want the unified search engine to find them, you should migrate these local items into the `peptide_faq` collection.

### 2. Missing Mappings
The FAQ `sema_vs_tirz_comp` is an excellent resource comparing **Semaglutide** and **Tirzepatide**.
**Action**: Create two new entries in `faq_peptide_mapping`:
- `faqId: "sema_vs_tirz_comp"`, `productID: "Semaglutide"`
- `faqId: "sema_vs_tirz_comp"`, `productID: "Tirzepatide"`

### 3. Orphaned Global Guides
`reconstitution_guide` is currently only mapped to **BPC-157**. 
**Action**: Since this applies to almost all lyophilized peptides, you might consider:
- Mapping it to all products programmatically.
- Or marking it as a "Global FAQ" in a new `visibility` or `type` field so the search engine always surfaces it for universal queries.

---

## 📄 Raw Firebase Data Snapshot

### `peptide_faq` Collection
```json
[
  {
    "id": "bpc157_intro",
    "q": "What is BPC-157 and what does it do?",
    "a": "BPC-157 (Body Protection Compound-157) is a pentadecapeptide..."
  },
  {
    "id": "cognitive_peptides_list",
    "q": "What peptides support cognitive function?",
    "a": "Peptides like Cerebrolysin, Semax, and Selank are frequently investigated..."
  },
  {
    "id": "reconstitution_guide",
    "q": "How do I reconstitute lyophilized peptides?",
    "a": "Most peptides are supplied as lyophilized (freeze-dried) powder..."
  },
  {
    "id": "sema_vs_tirz_comp",
    "q": "What is the difference between Semaglutide and Tirzepatide?",
    "a": "While both are GLP-1 receptor agonists, Tirzepatide is a dual agonist..."
  }
]
```

### `faq_peptide_mapping` Collection
```json
[
  { "faqId": "bpc157_intro", "productID": "BPC-157" },
  { "faqId": "reconstitution_guide", "productID": "BPC-157" }
]
```
