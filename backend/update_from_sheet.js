const db = require('./database');
const fs = require('fs');

// Parse CSV handling quoted fields
function parseCSV(text) {
  return text.split('\n').map(line => {
    const fields = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    fields.push(cur.trim());
    return fields;
  });
}

// Map sheet school names → DB codes
const schoolNameToCode = {
  'OIS Dindigul': 'OIS-DGL',
  'OIS Kelambakkam': 'OIS-KLB',
  'OIS Oragadam': 'OIS-OGD',
  'OIS Thirumudivakkam-Hold': 'OIS-TMV',
  'OIS Tattva': 'OIS-TVA',
  'OIS VELS Marathalli': 'OIS-VML',
  'OIS HSR': 'OIS-HSR',
  'OIS Arkere': 'OIS-ARK',
  'OIS Rayasandara': 'OIS-RYS',
  'OIS Mahadevpura': 'OIS-MDP',
  'OIS Perungudi-New building': 'OIS-PRG',
  'OIS Vandalur-New building': 'OIS-VDL',
  'OIS Coimbatore-New building': 'OIS-CBE',
  'OIS Hesarghatta': 'OIS-HSG',
  'OIS Yelahanka New Town-New building': 'OIS-YNT',
  'OIS Kuntaloor-New building': 'OIS-KNT',
  'OIS Manneguda-New building': 'OIS-MNG',
  'OIS Ramamurthynagar': 'OIS-RMN',
  'OIS Mahbubnagar-New building': 'OIS-MBN',
  'OCSE Dharwad': 'OCSE-DWD',
  'OIS Hubli-New building': 'OIS-HBL',
  'OIS Cheemasandara-New building': 'OIS-CMS',
  'OIS Bhopal-New building': 'OIS-BPL',
  'OIS Nagpur': 'OIS-NGP',
};

function normalizeStatus(val) {
  if (!val || val === '#N/A') return 'No';
  if (val === 'Yes') return 'Yes';
  if (val === 'No') return 'No';
  if (val === 'In Future') return 'In Future';
  return 'No';
}

const csv = fs.readFileSync('/tmp/academic_offering.csv', 'utf8');
const rows = parseCSV(csv);

// Row 1 (index 1) is the header row with school names
const header = rows[1];

// Extract school names and their column indices
const schools = [];
for (let i = 2; i < header.length; i += 2) {
  const name = header[i];
  if (name) schools.push({ name, colIdx: i, code: schoolNameToCode[name] });
}

console.log(`Found ${schools.length} schools in sheet`);
schools.forEach(s => console.log(`  ${s.name} → ${s.code}`));

const upsert = db.prepare(`
  INSERT INTO school_offerings (school_id, offering_id, status, condition_notes, updated_at)
  VALUES (?, ?, ?, ?, datetime('now'))
  ON CONFLICT(school_id, offering_id) DO UPDATE SET
    status = excluded.status,
    condition_notes = excluded.condition_notes,
    updated_at = excluded.updated_at
`);

const getSchool = db.prepare('SELECT id FROM schools WHERE code = ?');
const getOffering = db.prepare('SELECT id FROM offerings WHERE name = ?');

let updated = 0, skipped = 0;

const doUpdate = db.transaction(() => {
  // Data rows start at index 2
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 3) continue;
    const offeringName = row[1];
    if (!offeringName) continue;

    const offering = getOffering.get(offeringName);
    if (!offering) { console.warn(`  Unknown offering: "${offeringName}"`); skipped++; continue; }

    for (const school of schools) {
      if (!school.code) { skipped++; continue; }
      const schoolRow = getSchool.get(school.code);
      if (!schoolRow) { console.warn(`  Unknown school code: ${school.code}`); skipped++; continue; }

      const status = normalizeStatus(row[school.colIdx]);
      const notes = row[school.colIdx + 1] || '';

      upsert.run(schoolRow.id, offering.id, status, notes);
      updated++;
    }
  }
});

doUpdate();
console.log(`\nDone! Updated ${updated} records, skipped ${skipped}.`);
