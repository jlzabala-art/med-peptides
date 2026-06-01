import XLSX from 'xlsx';

const localDest = './scratch/temp_rfq.xlsx';
const workbook = XLSX.readFile(localDest);
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

console.log(`Total rows extracted: ${rows.length}`);
for (let i = 0; i < 20; i++) {
  if (rows[i]) {
    console.log(`Row ${i}:`, {
      name: rows[i]["STERILE LAB REQUEST FOR RAW MATERIALS"],
      qty: rows[i]["__EMPTY_2"],
      unit: rows[i]["__EMPTY_3"],
      original: JSON.stringify(rows[i])
    });
  }
}
