const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/meetings
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM monthly_meetings ORDER BY month DESC, school_name').all();
  res.json(rows);
});

// POST /api/meetings
router.post('/', (req, res) => {
  const { month, school_name, target = '', outcome = '' } = req.body;
  if (!month || !school_name) return res.status(400).json({ error: 'month and school_name required' });
  const result = db.prepare(
    'INSERT INTO monthly_meetings (month, school_name, target, outcome) VALUES (?,?,?,?)'
  ).run(month, school_name, target, outcome);
  res.json(db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(result.lastInsertRowid));
});

// PUT /api/meetings/:id
router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const { month, school_name, target, outcome } = req.body;
  db.prepare(`
    UPDATE monthly_meetings SET
      month=?, school_name=?, target=?, outcome=?,
      updated_at=datetime('now')
    WHERE id=?
  `).run(
    month ?? row.month,
    school_name ?? row.school_name,
    target ?? row.target,
    outcome ?? row.outcome,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM monthly_meetings WHERE id=?').get(req.params.id));
});

// DELETE /api/meetings/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM monthly_meetings WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
