const express = require('express');
const router = express.Router();
const db = require('../database');

const isSchool = req => req.user?.role === 'school';
const schoolOf = req => isSchool(req) ? req.user.school_name : null;

// GET /api/mau?school=name
router.get('/', (req, res) => {
  const school = schoolOf(req) || req.query.school;
  if (school) {
    return res.json(db.prepare('SELECT * FROM mau_data WHERE school_name=? ORDER BY rowid').all(school));
  }
  res.json(db.prepare('SELECT * FROM mau_data ORDER BY school_name, rowid').all());
});

// POST /api/mau
router.post('/', (req, res) => {
  const { school_name, grade, total_students = 0, app_login = 0, used_last_week = 0, used_last_month = 0 } = req.body;
  if (!school_name || !grade) return res.status(400).json({ error: 'school_name and grade required' });
  if (isSchool(req) && school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const existing = db.prepare('SELECT id FROM mau_data WHERE school_name=? AND grade=?').get(school_name, grade);
  if (existing) return res.status(409).json({ error: 'Entry already exists for this school and grade' });
  const result = db.prepare(
    'INSERT INTO mau_data (school_name, grade, total_students, app_login, used_last_week, used_last_month) VALUES (?,?,?,?,?,?)'
  ).run(school_name, grade, total_students, app_login, used_last_week, used_last_month);
  res.json(db.prepare('SELECT * FROM mau_data WHERE id=?').get(result.lastInsertRowid));
});

// PUT /api/mau/:id
router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM mau_data WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req) && row.school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const { total_students, app_login, used_last_week, used_last_month } = req.body;
  db.prepare(`
    UPDATE mau_data SET
      total_students=?, app_login=?, used_last_week=?, used_last_month=?,
      updated_at=datetime('now')
    WHERE id=?
  `).run(
    total_students ?? row.total_students,
    app_login ?? row.app_login,
    used_last_week ?? row.used_last_week,
    used_last_month ?? row.used_last_month,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM mau_data WHERE id=?').get(req.params.id));
});

// DELETE /api/mau/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM mau_data WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req) && row.school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM mau_data WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
