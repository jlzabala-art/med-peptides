import { db } from './lib/firebase-admin.mjs';

async function importPrescriptions() {
  const prescriptions = [
    {
      patientName: "Alice Shamoon",
      source: "PDF Import",
      status: "draft",
      dateIssued: "2026-07-07",
      createdAt: new Date().toISOString(),
      items: [
        {
          type: "product",
          productName: "CJC-1295 / Ipamorelin Blend (5mg/5mg)",
          dosage: "Inject 0.1 mL (10 Units) once daily subcutaneously, 5 nights per week.",
          duration: "8 weeks",
          vials: 2, // 8 weeks * 5 days = 40 doses * 0.1ml = 4ml. 2ml vial = 2 vials
          quantity: 2
        },
        {
          type: "product",
          productName: "Tesamorelin 10mg",
          dosage: "Inject 0.2 mL (20 Units) once daily subcutaneously, 6 days per week.",
          duration: "12 weeks",
          vials: 8, // 12 weeks * 6 days = 72 doses * 0.2ml = 14.4ml. 2ml vial = 8 vials
          quantity: 8
        },
        {
          type: "product",
          productName: "MOTS-C 10mg",
          dosage: "Inject 1 ml once WEEKLY for 2 weeks, then increase to 100 Units. Total Duration 6 weeks.",
          duration: "6 weeks",
          vials: 6, // Approx 1 vial per week
          quantity: 6
        },
        {
          type: "product",
          productName: "Epithalon 10mg",
          dosage: "Inject 2 mL (200 Units) once daily for 10 consecutive days at bedtime.",
          duration: "10 days",
          vials: 10, // 2ml per dose. 2ml vial = 1 vial per dose. 10 doses = 10 vials.
          quantity: 10
        }
      ]
    },
    {
      patientName: "Alice Shamoon",
      source: "PDF Import",
      status: "draft",
      dateIssued: "2026-07-11",
      createdAt: new Date().toISOString(),
      items: [
        {
          type: "product",
          productName: "CJC-1295 / Ipamorelin Blend (5mg/5mg)",
          dosage: "Inject 0.1 mL (10 Units) once daily subcutaneously, 5 nights per week.",
          duration: "8 weeks",
          vials: 2,
          quantity: 2
        },
        {
          type: "product",
          productName: "Tesamorelin 10mg",
          dosage: "Inject 0.2 mL (20 Units) once daily subcutaneously, 6 days per week.",
          duration: "12 weeks",
          vials: 8,
          quantity: 8
        },
        {
          type: "product",
          productName: "MOTS-C 10mg",
          dosage: "Inject 0.5 mL once WEEKLY for 2 weeks. Increase dose to 100 Units (5 mg) after 2 weeks if well tolerated.",
          duration: "6 weeks",
          vials: 6,
          quantity: 6
        },
        {
          type: "product",
          productName: "Epithalon 10mg",
          dosage: "Inject 2 mL once daily 10 consecutive days.",
          duration: "10 days",
          vials: 10,
          quantity: 10
        }
      ]
    }
  ];

  for (const rx of prescriptions) {
    const docRef = await db.collection('prescriptions').add(rx);
    console.log(`Imported prescription ID: ${docRef.id}`);
  }
}

importPrescriptions().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
