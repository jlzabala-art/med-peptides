const fs = require('fs');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'med-peptides-app' });
}
const db = admin.firestore();

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  function parseLine(line) {
    const entries = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        entries.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    entries.push(cur.trim());
    return entries;
  }

  const rawHeaders = parseLine(lines[1]);
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const rowObj = {};
    rawHeaders.forEach((h, idx) => {
      const key = h || ('col_' + idx);
      rowObj[key] = vals[idx] || '';
    });
    rows.push({
      rowIndex: i + 1,
      patient: rowObj['PATIENT'] || vals[1] || '',
      country: rowObj['COUNTRY'] || vals[2] || '',
      doctor: rowObj['DOCTOR'] || vals[3] || '',
      prescription: rowObj['PRESCRIPTION'] || vals[4] || '',
      quote: rowObj['QUOTE'] || vals[5] || '',
      signedPrescription: rowObj['SIGNED PRESCRIPTION'] || vals[6] || '',
      notes: rowObj['NOTES'] || vals[7] || '',
      items: rowObj['ITEMS'] || vals[8] || '',
      orderNum: rowObj['ORDER #'] || vals[9] || '',
      status: rowObj['STATUS'] || vals[10] || '',
      finalStatus: rowObj['FINAL STATUS'] || vals[15] || ''
    });
  }
  return rows;
}

function cleanStr(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function runAudit() {
  const csvPath = '/Users/joseluiszabala/Downloads/PharmaPolis - PharmaPolis-2.csv';
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const sheetRows = parseCSV(csvText).filter(r => r.patient && r.patient.trim().length > 0);

  const snap = await db.collection('prescriptions').get();
  const atlasPrescriptions = snap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      patientName: d.patientName || (d.patient && d.patient.name) || '',
      doctorName: d.doctorName || d.doctor || d.doctorSlug || '',
      prescriptionCode: d.prescriptionCode || d.code || '',
      sourceFileName: d.sourceFileName || d.fileName || '',
      fileUrl: d.fileUrl || d.documentUrl || d.pdfUrl || '',
      status: d.status || '',
      createdAt: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate().toISOString() : d.createdAt) : null,
      raw: d
    };
  });

  const auditReport = [];

  for (const row of sheetRows) {
    const normPatient = cleanStr(row.patient);
    const normSigned = cleanStr(row.signedPrescription);
    const normOrder = cleanStr(row.orderNum);

    // Matching criteria:
    // 1. Patient name similarity (exact or inclusion of major name tokens)
    // 2. Or matching prescription file name or order number
    const matches = atlasPrescriptions.filter(ap => {
      const apPatient = cleanStr(ap.patientName);
      const apCode = cleanStr(ap.prescriptionCode);
      const apFile = cleanStr(ap.sourceFileName);

      // Check patient match
      if (normPatient && apPatient) {
        if (normPatient === apPatient) return true;
        if (normPatient.length > 5 && apPatient.includes(normPatient)) return true;
        if (apPatient.length > 5 && normPatient.includes(apPatient)) return true;

        // Token match: check if first & last name match
        const pTokens = row.patient.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        const apTokens = ap.patientName.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        const commonTokens = pTokens.filter(t => apTokens.includes(t));
        if (commonTokens.length >= 2) return true;
      }

      // Check signed prescription match (if filename/url matches)
      if (normSigned && normSigned.length > 4) {
        if (apFile && apFile.includes(normSigned)) return true;
        if (apCode && apCode.includes(normSigned)) return true;
      }

      // Check order number match
      if (normOrder && normOrder.length > 3) {
        if (apCode && apCode.includes(normOrder)) return true;
      }

      return false;
    });

    auditReport.push({
      rowIndex: row.rowIndex,
      patient: row.patient,
      doctorInSheet: row.doctor,
      signedPrescription: row.signedPrescription,
      orderNum: row.orderNum,
      isLoaded: matches.length > 0,
      matchCount: matches.length,
      matches: matches.map(m => ({
        id: m.id,
        patientName: m.patientName,
        doctorInAtlas: m.doctorName,
        prescriptionCode: m.prescriptionCode,
        status: m.status
      }))
    });
  }

  const loaded = auditReport.filter(r => r.isLoaded);
  const notLoaded = auditReport.filter(r => !r.isLoaded);

  console.log(JSON.stringify({
    totalSheetRows: sheetRows.length,
    totalAtlasDocs: atlasPrescriptions.length,
    loadedCount: loaded.length,
    notLoadedCount: notLoaded.length,
    notLoadedList: notLoaded,
    loadedSample: loaded.slice(0, 10)
  }, null, 2));
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
