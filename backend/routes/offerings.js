const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all categories with their offerings
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const result = categories.map(cat => ({
    ...cat,
    offerings: db.prepare('SELECT * FROM offerings WHERE category_id = ? ORDER BY sort_order').all(cat.id),
  }));
  res.json(result);
});

// GET all offerings flat
router.get('/', (req, res) => {
  const offerings = db.prepare(`
    SELECT o.*, c.name as category_name FROM offerings o
    JOIN categories c ON o.category_id = c.id
    ORDER BY c.sort_order, o.sort_order
  `).all();
  res.json(offerings);
});

// POST add a new offering
router.post('/', (req, res) => {
  const { category_id, name } = req.body;
  if (!category_id || !name) return res.status(400).json({ error: 'category_id and name required' });

  try {
    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM offerings WHERE category_id = ?').get(category_id);
    const result = db.prepare(
      'INSERT INTO offerings (category_id, name, sort_order) VALUES (?, ?, ?)'
    ).run(category_id, name, (maxOrder.m || 0) + 1);

    // Auto-init for all existing schools
    const schools = db.prepare('SELECT id FROM schools').all();
    const initOff = db.prepare(
      `INSERT OR IGNORE INTO school_offerings (school_id, offering_id, status, condition_notes) VALUES (?, ?, 'No', '')`
    );
    const init = db.transaction(() => {
      for (const s of schools) initOff.run(s.id, result.lastInsertRowid);
    });
    init();

    res.status(201).json(db.prepare('SELECT * FROM offerings WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Offering already exists in this category' });
    res.status(500).json({ error: err.message });
  }
});

// POST add a new category
router.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  try {
    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM categories').get();
    const result = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run(name, (maxOrder.m || 0) + 1);
    res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Category already exists' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
