const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all schools (school users only see their own)
router.get('/', (req, res) => {
  if (req.user?.role === 'school') {
    const schools = db.prepare('SELECT * FROM schools WHERE name=? ORDER BY name').all(req.user.school_name);
    return res.json(schools);
  }
  res.json(db.prepare('SELECT * FROM schools ORDER BY name').all());
});

// GET single school
router.get('/:id', (req, res) => {
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.id);
  if (!school) return res.status(404).json({ error: 'School not found' });
  res.json(school);
});

// POST create school
router.post('/', (req, res) => {
  const { name, code, location, city, state, acquired_date, principal_name, zbh_name, academic_start_month, school_type } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name and code are required' });

  try {
    const result = db.prepare(
      `INSERT INTO schools (name, code, location, city, state, acquired_date, principal_name, zbh_name, academic_start_month, school_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, code.toUpperCase(), location || '', city || '', state || '', acquired_date || null,
          principal_name || '', zbh_name || '', academic_start_month || 'June', school_type || 'existing');

    const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(result.lastInsertRowid);

    // Auto-create No entries for all offerings
    const offerings = db.prepare('SELECT id FROM offerings').all();
    const insertOff = db.prepare(
      `INSERT OR IGNORE INTO school_offerings (school_id, offering_id, status, condition_notes) VALUES (?, ?, 'No', '')`
    );
    const init = db.transaction(() => {
      for (const o of offerings) insertOff.run(school.id, o.id);
    });
    init();

    res.status(201).json(school);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'School name or code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update school
router.put('/:id', (req, res) => {
  const { name, code, location, city, state, acquired_date, status, principal_name, zbh_name, academic_start_month, school_type, spoc_teacher_training, spoc_clicker, cod1, cod2 } = req.body;
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.id);
  if (!school) return res.status(404).json({ error: 'School not found' });

  try {
    db.prepare(
      `UPDATE schools SET name=?, code=?, location=?, city=?, state=?, acquired_date=?, status=?,
       principal_name=?, zbh_name=?, academic_start_month=?, school_type=?,
       spoc_teacher_training=?, spoc_clicker=?, cod1=?, cod2=? WHERE id=?`
    ).run(
      name ?? school.name,
      code ? code.toUpperCase() : school.code,
      location ?? school.location,
      city ?? school.city,
      state ?? school.state,
      acquired_date ?? school.acquired_date,
      status ?? school.status,
      principal_name ?? school.principal_name,
      zbh_name ?? school.zbh_name,
      academic_start_month ?? school.academic_start_month,
      school_type ?? school.school_type,
      spoc_teacher_training ?? school.spoc_teacher_training,
      spoc_clicker ?? school.spoc_clicker,
      cod1 ?? school.cod1,
      cod2 ?? school.cod2,
      req.params.id
    );
    res.json(db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'School name or code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE school
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM schools WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'School not found' });
  res.json({ message: 'School deleted' });
});

module.exports = router;
