const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM project_progress ORDER BY school_name, admission_status').all();

  // Group by school
  const schools = {};
  for (const r of rows) {
    if (!schools[r.school_name]) schools[r.school_name] = { school_name: r.school_name, statuses: [] };
    schools[r.school_name].statuses.push(r);
  }
  res.json(Object.values(schools));
});

router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM project_progress WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const { total_students, toddler, nursery, lkg, ukg, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12 } = req.body;
  db.prepare(`
    UPDATE project_progress SET total_students=?, toddler=?, nursery=?, lkg=?, ukg=?,
      g1=?, g2=?, g3=?, g4=?, g5=?, g6=?, g7=?, g8=?, g9=?, g10=?, g11=?, g12=?,
      updated_at=datetime('now') WHERE id=?
  `).run(
    total_students??row.total_students, toddler??row.toddler, nursery??row.nursery,
    lkg??row.lkg, ukg??row.ukg, g1??row.g1, g2??row.g2, g3??row.g3, g4??row.g4,
    g5??row.g5, g6??row.g6, g7??row.g7, g8??row.g8, g9??row.g9, g10??row.g10,
    g11??row.g11, g12??row.g12, req.params.id
  );
  res.json(db.prepare('SELECT * FROM project_progress WHERE id=?').get(req.params.id));
});

module.exports = router;
