const express = require('express');
const router = express.Router();
const db = require('../database');

const ALL_CATEGORIES = [
  'Library', 'Diy Lab', 'Computer Lab', 'Music', 'Composite Lab',
  'Maths Lab', 'Prem Phy Lab', 'Prem Chem Lab', 'Prem Bio Lab',
  'Day Care Set', 'Robotics', 'Coding Lab', 'Astronomy Lab',
  'Dance', 'Theater', 'Art Lab Dry', 'Art Lab Wet',
  'Staff Room', 'Infirmary Room', 'All Inventory',
];

// GET /api/inventory/categories
router.get('/categories', (req, res) => {
  const seeded = db.prepare(
    `SELECT DISTINCT category FROM inventory_templates`
  ).all().map(r => r.category);
  res.json(ALL_CATEGORIES.map(name => ({
    name,
    hasData: seeded.includes(name),
  })));
});

// GET /api/inventory?school_id=X&category=Y
// Returns template items joined with this school's saved data
router.get('/', (req, res) => {
  const { school_id, category } = req.query;
  if (!category) return res.status(400).json({ error: 'category required' });

  const templates = db.prepare(
    `SELECT * FROM inventory_templates WHERE category = ? ORDER BY sort_order`
  ).all(category);

  if (!school_id) return res.json(templates.map(t => ({ ...t, available_count: '', condition_notes: '', notes: '' })));

  // Left-join with school_inventory for this school
  const schoolData = db.prepare(
    `SELECT template_id, available_count, condition_notes, notes
     FROM school_inventory WHERE school_id = ?`
  ).all(school_id);
  const map = Object.fromEntries(schoolData.map(r => [r.template_id, r]));

  res.json(templates.map(t => ({
    ...t,
    available_count: map[t.id]?.available_count ?? '',
    condition_notes: map[t.id]?.condition_notes ?? '',
    notes: map[t.id]?.notes ?? '',
    school_filled: !!map[t.id],
  })));
});

// PUT /api/inventory/school/:schoolId/item/:templateId
router.put('/school/:schoolId/item/:templateId', (req, res) => {
  const { schoolId, templateId } = req.params;
  const { available_count = '', condition_notes = '', notes = '' } = req.body;

  db.prepare(`
    INSERT INTO school_inventory (school_id, template_id, available_count, condition_notes, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(school_id, template_id) DO UPDATE SET
      available_count = excluded.available_count,
      condition_notes = excluded.condition_notes,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).run(schoolId, templateId, available_count, condition_notes, notes);

  res.json({ ok: true });
});

// PUT /api/inventory/school/:schoolId/category/:category/bulk
// Save many rows at once
router.put('/school/:schoolId/category/:category/bulk', (req, res) => {
  const { schoolId, category } = req.params;
  const { rows } = req.body; // [{template_id, available_count, condition_notes, notes}]
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows[] required' });

  const upsert = db.prepare(`
    INSERT INTO school_inventory (school_id, template_id, available_count, condition_notes, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(school_id, template_id) DO UPDATE SET
      available_count = excluded.available_count,
      condition_notes = excluded.condition_notes,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);

  db.transaction(() => {
    for (const row of rows) {
      upsert.run(schoolId, row.template_id, row.available_count || '', row.condition_notes || '', row.notes || '');
    }
  })();

  res.json({ ok: true, saved: rows.length });
});

module.exports = router;
