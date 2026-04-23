const db = require('./database');

// Principal data from Google Sheet (last entry wins for duplicates)
// Mapping: [name_pattern, email, erp]
const updates = [
  { pattern: 'OIS Dharwad',          email: 'principal.oisdw@orchidsintl.edu.in',  erp: '20262001685_OIS' },
  { pattern: 'OIS Ramamurthy Nagar', email: 'principal.oisrm@orchidsintl.edu.in',  erp: '20262000818_OIS' },
  { pattern: 'OIS Oragadam',         email: 'principal.oisogm@orchidsintl.edu.in', erp: '20262001997_OIS' },
  { pattern: 'OIS Cheemasandra',     email: 'principal.oiscms@orchidsintl.edu.in', erp: '20252000912_OIS' },
  { pattern: 'OIS Marathalli',       email: 'principal.oismth@orchidsintl.edu.in', erp: '20239540282_OIS' },
  { pattern: 'OIS Hesarghatta',      email: 'principal.oishsg@orchidsintl.edu.in', erp: '20250007353_OIS' },
  { pattern: 'OIS Kumbagodu',        email: 'principal.oiskbg@orchidsintl.edu.in', erp: '20252001591_OIS' },
  { pattern: 'OIS HSR',              email: 'principal.oishsr@orchidsintl.edu.in', erp: '20262001158_OIS' },
  { pattern: 'OIS Mahadevapura',     email: 'principal.oismdp@orchidsintl.edu.in', erp: '20262001552_OIS' },
  { pattern: 'OIS Rayasandara',      email: 'principal.oisrs@orchidsintl.edu.in',  erp: '20262001159_OIS' },
  { pattern: 'OIS Manneguda',        email: 'principal.oismg@orchidsintl.edu.in',  erp: '20262001141_OIS' },
  { pattern: 'OIS Vandalur',         email: 'principal.oisvdl@orchidsintl.edu.in', erp: '20262004458_OIS' },
  { pattern: 'OIS Perungudi',        email: 'principal.oisprg@orchidsintl.edu.in', erp: '20262002112_OIS' },
  { pattern: 'OIS Arkere',           email: 'principal.oisark@orchidsintl.edu.in', erp: '20262001684_OIS' },
  { pattern: 'OIS Coimbatore',       email: 'principal.oiscoi@orchidsintl.edu.in', erp: '20262001480_OIS' },
  { pattern: 'OIS Shamirpet',        email: 'kavita.trivedi@orchidsintl.edu.in',   erp: '20252001131_OIS' },
  { pattern: 'OIS Kelambakkam',      email: 'principal.oiskbm@orchidsintl.edu.in', erp: '20262001644_OIS' },
];

// Kuntloor — two entries with same data; match by LIKE
const kuntloor = db.prepare(`UPDATE schools SET principal_email=?, principal_erp=? WHERE name LIKE '%Kuntloor%' OR name LIKE '%Kuntaloor%'`)
  .run('yasmeen.begum@orchidsintl.edu.in', '20252001905_OIS');
console.log(`Kuntloor: ${kuntloor.changes} row(s) updated`);

let total = 0;
for (const u of updates) {
  const result = db.prepare(`UPDATE schools SET principal_email=?, principal_erp=? WHERE name LIKE ?`)
    .run(u.email, u.erp, `%${u.pattern.replace('OIS ', '')}%`);
  if (result.changes > 0) {
    console.log(`  ${u.pattern}: ${result.changes} row(s) updated`);
    total += result.changes;
  } else {
    // Try exact prefix
    const r2 = db.prepare(`UPDATE schools SET principal_email=?, principal_erp=? WHERE name LIKE ?`)
      .run(u.email, u.erp, `${u.pattern}%`);
    if (r2.changes > 0) {
      console.log(`  ${u.pattern}: ${r2.changes} row(s) updated`);
      total += r2.changes;
    } else {
      console.log(`  WARNING: no match for "${u.pattern}"`);
    }
  }
}
console.log(`\nTotal schools updated: ${total}`);

// Show what was updated
const schools = db.prepare(`SELECT name, principal_email, principal_erp FROM schools WHERE principal_email != '' ORDER BY name`).all();
console.log('\nSchools with principal email:');
schools.forEach(s => console.log(`  ${s.name}: ${s.principal_email} / ${s.principal_erp}`));
