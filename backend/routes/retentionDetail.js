const express = require('express');
const router = express.Router();
const db = require('../database');

const isSchool = req => req.user?.role === 'school';

router.get('/', (req, res) => {
  const rows = isSchool(req)
    ? db.prepare('SELECT * FROM retention_detail WHERE school_name=? ORDER BY sort_order').all(req.user.school_name)
    : db.prepare('SELECT * FROM retention_detail ORDER BY sort_order').all();

  const grouped = {};
  for (const r of rows) {
    if (!grouped[r.school_name]) grouped[r.school_name] = [];
    grouped[r.school_name].push(r);
  }
  const grandRows = rows.filter(r => r.is_grand_total && r.school_name !== 'OIS Hesarghatta');
  const summary = {
    total_students: grandRows.reduce((s, r) => s + (r.total_strength || 0), 0),
    total_interested: grandRows.reduce((s, r) => s + (r.interested || 0), 0),
    total_yet_to_decide: grandRows.reduce((s, r) => s + (r.yet_to_decide || 0), 0),
    total_not_interested: grandRows.reduce((s, r) => s + (r.not_interested || 0), 0),
  };
  res.json({ schools: Object.entries(grouped).map(([name, rows]) => ({ school_name: name, rows })), summary });
});

router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM retention_detail WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (isSchool(req) && row.school_name !== req.user.school_name)
    return res.status(403).json({ error: 'Access denied' });
  const { interested, yet_to_decide, not_interested, total_strength, app_fees_paid, pct_not_interested } = req.body;
  db.prepare(`
    UPDATE retention_detail SET
      interested=?, yet_to_decide=?, not_interested=?,
      total_strength=?, app_fees_paid=?, pct_not_interested=?,
      updated_at=datetime('now') WHERE id=?
  `).run(
    interested ?? row.interested,
    yet_to_decide ?? row.yet_to_decide,
    not_interested ?? row.not_interested,
    total_strength ?? row.total_strength,
    app_fees_paid ?? row.app_fees_paid,
    pct_not_interested ?? row.pct_not_interested,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM retention_detail WHERE id=?').get(req.params.id));
});

module.exports = router;
