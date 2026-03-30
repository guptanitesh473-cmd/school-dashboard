const express = require('express');
const router = express.Router();
const db = require('../database');

// Only admin can access these routes
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// GET /api/users — list all users
router.get('/', requireAdmin, (req, res) => {
  const users = db.prepare(
    'SELECT id, username, name, role, school_name, created_at FROM users ORDER BY role DESC, name'
  ).all();
  res.json(users);
});

// POST /api/users — create user
router.post('/', requireAdmin, (req, res) => {
  const { username, password, name, role, school_name } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const result = db.prepare(
      'INSERT INTO users (username, password, name, role, school_name) VALUES (?, ?, ?, ?, ?)'
    ).run(username.trim(), password, name || username, role || 'school', school_name || '');
    res.json(db.prepare('SELECT id, username, name, role, school_name, created_at FROM users WHERE id=?').get(result.lastInsertRowid));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username already exists' });
    throw e;
  }
});

// PUT /api/users/:id — update (name, password, role, school_name)
router.put('/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const { password, name, role, school_name } = req.body || {};
  db.prepare(
    'UPDATE users SET password=?, name=?, role=?, school_name=? WHERE id=?'
  ).run(
    password || row.password,
    name ?? row.name,
    role ?? row.role,
    school_name ?? row.school_name,
    req.params.id
  );
  res.json(db.prepare('SELECT id, username, name, role, school_name, created_at FROM users WHERE id=?').get(req.params.id));
});

// DELETE /api/users/:id — cannot delete yourself or last admin
router.delete('/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (String(row.id) === String(req.user.userId)) return res.status(400).json({ error: 'Cannot delete yourself' });
  if (row.role === 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='admin'").get().c;
    if (adminCount <= 1) return res.status(400).json({ error: 'Cannot delete the last admin' });
  }
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
