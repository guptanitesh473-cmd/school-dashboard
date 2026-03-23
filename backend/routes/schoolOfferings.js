const express = require('express');
const router = express.Router();
const db = require('../database');

// GET full matrix: all offerings x all schools
router.get('/matrix', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const schools = db.prepare('SELECT * FROM schools WHERE status = ? ORDER BY name', ).all('active');
  const allOfferings = db.prepare(`
    SELECT o.*, c.name as category_name, c.sort_order as cat_sort
    FROM offerings o JOIN categories c ON o.category_id = c.id
    ORDER BY c.sort_order, o.sort_order
  `).all();

  const statusMap = {};
  const rows = db.prepare(`
    SELECT so.school_id, so.offering_id, so.status, so.condition_notes
    FROM school_offerings so
  `).all();
  for (const r of rows) {
    if (!statusMap[r.offering_id]) statusMap[r.offering_id] = {};
    statusMap[r.offering_id][r.school_id] = { status: r.status, condition_notes: r.condition_notes };
  }

  const matrix = categories.map(cat => ({
    category: cat,
    offerings: allOfferings
      .filter(o => o.category_id === cat.id)
      .map(o => ({
        offering: o,
        schools: schools.map(s => ({
          school_id: s.id,
          ...(statusMap[o.id]?.[s.id] || { status: 'No', condition_notes: '' }),
        })),
      })),
  }));

  res.json({ schools, matrix });
});

// GET all offerings for a specific school
router.get('/school/:schoolId', (req, res) => {
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.schoolId);
  if (!school) return res.status(404).json({ error: 'School not found' });

  const offerings = db.prepare(`
    SELECT so.*, o.name as offering_name, c.name as category_name, c.id as category_id
    FROM school_offerings so
    JOIN offerings o ON so.offering_id = o.id
    JOIN categories c ON o.category_id = c.id
    WHERE so.school_id = ?
    ORDER BY c.sort_order, o.sort_order
  `).all(req.params.schoolId);

  const summary = {
    total: offerings.length,
    yes: offerings.filter(o => o.status === 'Yes').length,
    no: offerings.filter(o => o.status === 'No').length,
    in_future: offerings.filter(o => o.status === 'In Future').length,
  };

  res.json({ school, offerings, summary });
});

// PUT update a single school offering
router.put('/school/:schoolId/offering/:offeringId', (req, res) => {
  const { status, condition_notes } = req.body;
  const validStatuses = ['Yes', 'No', 'In Future'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'status must be Yes, No, or In Future' });
  }

  const existing = db.prepare(
    'SELECT * FROM school_offerings WHERE school_id = ? AND offering_id = ?'
  ).get(req.params.schoolId, req.params.offeringId);

  if (existing) {
    db.prepare(`
      UPDATE school_offerings SET status=?, condition_notes=?, updated_at=datetime('now')
      WHERE school_id=? AND offering_id=?
    `).run(
      status ?? existing.status,
      condition_notes ?? existing.condition_notes,
      req.params.schoolId,
      req.params.offeringId
    );
  } else {
    db.prepare(`
      INSERT INTO school_offerings (school_id, offering_id, status, condition_notes)
      VALUES (?, ?, ?, ?)
    `).run(req.params.schoolId, req.params.offeringId, status || 'No', condition_notes || '');
  }

  res.json(db.prepare(
    'SELECT * FROM school_offerings WHERE school_id = ? AND offering_id = ?'
  ).get(req.params.schoolId, req.params.offeringId));
});

// PUT bulk update offerings for a school
router.put('/school/:schoolId/bulk', (req, res) => {
  const { offerings } = req.body; // [{ offering_id, status, condition_notes }]
  if (!Array.isArray(offerings)) return res.status(400).json({ error: 'offerings array required' });

  const upsert = db.prepare(`
    INSERT INTO school_offerings (school_id, offering_id, status, condition_notes, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(school_id, offering_id) DO UPDATE SET
      status=excluded.status,
      condition_notes=excluded.condition_notes,
      updated_at=excluded.updated_at
  `);

  const update = db.transaction(() => {
    for (const o of offerings) {
      upsert.run(req.params.schoolId, o.offering_id, o.status, o.condition_notes || '');
    }
  });
  update();

  res.json({ message: `Updated ${offerings.length} offerings` });
});

// GET stats summary across all schools
router.get('/stats', (req, res) => {
  const schools = db.prepare('SELECT * FROM schools WHERE status = ? ORDER BY name').all('active');
  const stats = schools.map(school => {
    const counts = db.prepare(`
      SELECT status, COUNT(*) as count FROM school_offerings WHERE school_id = ? GROUP BY status
    `).all(school.id);
    const map = Object.fromEntries(counts.map(c => [c.status, c.count]));
    return {
      school,
      yes: map['Yes'] || 0,
      no: map['No'] || 0,
      in_future: map['In Future'] || 0,
      total: (map['Yes'] || 0) + (map['No'] || 0) + (map['In Future'] || 0),
    };
  });
  res.json(stats);
});

module.exports = router;
