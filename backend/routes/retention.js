const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM retention_report ORDER BY state, school_name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { school_name, state, location, owner, calling_status, bla_status,
    exam_start_date, exam_end_date, tentative_bla_date, retention_data_link, bla_scorecard_link, notes } = req.body;
  if (!school_name) return res.status(400).json({ error: 'school_name required' });
  const result = db.prepare(`
    INSERT INTO retention_report (school_name, state, location, owner, calling_status, bla_status,
      exam_start_date, exam_end_date, tentative_bla_date, retention_data_link, bla_scorecard_link, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(school_name, state||'', location||'', owner||'', calling_status||'', bla_status||'',
    exam_start_date||'', exam_end_date||'', tentative_bla_date||'',
    retention_data_link||'', bla_scorecard_link||'', notes||'');
  res.status(201).json(db.prepare('SELECT * FROM retention_report WHERE id=?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM retention_report WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const f = req.body;
  db.prepare(`
    UPDATE retention_report SET school_name=?, state=?, location=?, owner=?, calling_status=?,
      bla_status=?, exam_start_date=?, exam_end_date=?, tentative_bla_date=?,
      retention_data_link=?, bla_scorecard_link=?, notes=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    f.school_name??row.school_name, f.state??row.state, f.location??row.location,
    f.owner??row.owner, f.calling_status??row.calling_status, f.bla_status??row.bla_status,
    f.exam_start_date??row.exam_start_date, f.exam_end_date??row.exam_end_date,
    f.tentative_bla_date??row.tentative_bla_date, f.retention_data_link??row.retention_data_link,
    f.bla_scorecard_link??row.bla_scorecard_link, f.notes??row.notes, req.params.id
  );
  res.json(db.prepare('SELECT * FROM retention_report WHERE id=?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM retention_report WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
