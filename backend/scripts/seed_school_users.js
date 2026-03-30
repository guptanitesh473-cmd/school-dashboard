/**
 * Seed one login user per school.
 * username = school code lowercase (e.g. ois-ark)
 * password = School@123 (default — admin can change via UI)
 * role     = school
 */
const db = require('../database');

const schools = db.prepare('SELECT id, name, code FROM schools ORDER BY name').all();

const stmt = db.prepare(`
  INSERT OR IGNORE INTO users (username, password, name, role, school_name)
  VALUES (?, ?, ?, 'school', ?)
`);

let created = 0;
for (const s of schools) {
  const username = s.code.toLowerCase();
  const result = stmt.run(username, 'School@123', s.name, s.name);
  if (result.changes) {
    console.log(`Created: ${username} → ${s.name}`);
    created++;
  } else {
    console.log(`Skipped (exists): ${username}`);
  }
}
console.log(`\nDone. ${created} users created.`);
