const express = require('express');
const router = express.Router();
const db = require('../database');

const isSchool = req => req.user?.role === 'school';

const FIELDS = [
  'month', 'school_name', 'dept_planned', 'agenda_planned', 'timeline',
  'designation_planned', 'auditor_name', 'erp', 'designation_executed',
  'dept_executed', 'date_of_auditing', 'agenda_executed', 'audit_report', 'issues_tagged',
];

// GET /api/audit?school=X
router.get('/', (req, res) => {
  const school = isSchool(req) ? req.user.school_name : (req.query.school || null);
  const rows = school
    ? db.prepare('SELECT * FROM audit_reports WHERE school_name=? ORDER BY id ASC').all(school)
    : db.prepare('SELECT * FROM audit_reports ORDER BY school_name, id ASC').all();
  res.json(rows);
});

// POST /api/audit
router.post('/', (req, res) => {
  const { month, school_name } = req.body;
  if (!month || !school_name) return res.status(400).json({ error: 'month and school_name required' });
  if (isSchool(req) && school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const vals = FIELDS.map(f => req.body[f] ?? '');
  const placeholders = FIELDS.map(() => '?').join(',');
  const result = db.prepare(
    `INSERT INTO audit_reports (${FIELDS.join(',')}) VALUES (${placeholders})`
  ).run(...vals);
  res.json(db.prepare('SELECT * FROM audit_reports WHERE id=?').get(result.lastInsertRowid));
});

// PUT /api/audit/:id
router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM audit_reports WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req) && row.school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const sets = FIELDS.map(f => `${f}=?`).join(',');
  const vals = FIELDS.map(f => req.body[f] ?? row[f]);
  db.prepare(`UPDATE audit_reports SET ${sets}, updated_at=datetime('now') WHERE id=?`).run(...vals, req.params.id);
  res.json(db.prepare('SELECT * FROM audit_reports WHERE id=?').get(req.params.id));
});

// DELETE /api/audit/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM audit_reports WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req)) return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM audit_reports WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
