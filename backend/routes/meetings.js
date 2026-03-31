const express = require('express');
const router = express.Router();
const db = require('../database');

const isSchool = req => req.user?.role === 'school';

const FIELDS = [
  'month', 'school_name', 'discussion_points', 'tagged_department',
  'responsible_person', 'progress_update',
];

// GET /api/meetings?school=X
router.get('/', (req, res) => {
  const school = isSchool(req) ? req.user.school_name : (req.query.school || null);
  const rows = school
    ? db.prepare('SELECT * FROM monthly_meetings WHERE school_name=? ORDER BY id ASC').all(school)
    : db.prepare('SELECT * FROM monthly_meetings ORDER BY school_name, id ASC').all();
  res.json(rows);
});

// POST /api/meetings
router.post('/', (req, res) => {
  const { month, school_name } = req.body;
  if (!month || !school_name) return res.status(400).json({ error: 'month and school_name required' });
  if (isSchool(req) && school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const vals = FIELDS.map(f => req.body[f] ?? '');
  const placeholders = FIELDS.map(() => '?').join(',');
  const result = db.prepare(
    `INSERT INTO monthly_meetings (${FIELDS.join(',')}) VALUES (${placeholders})`
  ).run(...vals);
  res.json(db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(result.lastInsertRowid));
});

// PUT /api/meetings/:id
router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req) && row.school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const sets = FIELDS.map(f => `${f}=?`).join(',');
  const vals = FIELDS.map(f => req.body[f] ?? row[f]);
  db.prepare(`UPDATE monthly_meetings SET ${sets}, updated_at=datetime('now') WHERE id=?`).run(...vals, req.params.id);
  res.json(db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(req.params.id));
});

// DELETE /api/meetings/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req) && row.school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM monthly_meetings WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
