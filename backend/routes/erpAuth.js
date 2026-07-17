const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../database');

// In-memory sessions for the BLA Dashboard (ERP) sub-app — entirely separate
// from the main dashboard's auth/session store.
const sessions = new Map();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function createToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    subject: user.subject || '',
    grade: user.grade || '',
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  return token;
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    subject: u.subject,
    grade: u.grade,
    created_at: u.created_at,
  };
}

// POST /api/erp/register — employee self-registration, starts as "pending"
router.post('/register', (req, res) => {
  const { name, email, password, subject, grade } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const emailNorm = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM erp_users WHERE email = ?').get(emailNorm);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  db.prepare(
    `INSERT INTO erp_users (name, email, password, role, status, subject, grade) VALUES (?, ?, ?, 'employee', 'pending', ?, ?)`
  ).run(name.trim(), emailNorm, password, subject || '', grade || '');

  res.json({ ok: true, message: 'Registration submitted. An admin will review and approve your account.' });
});

// POST /api/erp/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM erp_users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || user.password !== password)
    return res.status(401).json({ error: 'Invalid email or password.' });

  if (user.status === 'pending')
    return res.status(403).json({ error: 'Your registration is pending admin approval.' });
  if (user.status === 'rejected')
    return res.status(403).json({ error: 'Your registration was rejected. Contact your admin.' });

  const token = createToken(user);
  res.json({ token, user: publicUser(user) });
});

// POST /api/erp/logout
router.post('/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  sessions.delete(token);
  res.json({ ok: true });
});

// GET /api/erp/me
router.get('/me', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    subject: session.subject,
    grade: session.grade,
  });
});

function requireErpAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.erpUser = session;
  next();
}

function requireErpAdmin(req, res, next) {
  requireErpAuth(req, res, () => {
    if (req.erpUser.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    next();
  });
}

// GET /api/erp/employees — admin: all approved employees
router.get('/employees', requireErpAdmin, (req, res) => {
  const rows = db.prepare(`SELECT * FROM erp_users WHERE role = 'employee' AND status = 'approved' ORDER BY name`).all();
  res.json(rows.map(publicUser));
});

// GET /api/erp/pending — admin: pending registration requests
router.get('/pending', requireErpAdmin, (req, res) => {
  const rows = db.prepare(`SELECT * FROM erp_users WHERE status = 'pending' ORDER BY created_at`).all();
  res.json(rows.map(publicUser));
});

// POST /api/erp/employees/:id/approve — admin: approve a pending registration
router.post('/employees/:id/approve', requireErpAdmin, (req, res) => {
  const { subject, grade } = req.body || {};
  const info = db.prepare(
    `UPDATE erp_users SET status = 'approved', subject = COALESCE(?, subject), grade = COALESCE(?, grade) WHERE id = ? AND status = 'pending'`
  ).run(subject ?? null, grade ?? null, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Pending registration not found.' });
  res.json({ ok: true });
});

// POST /api/erp/employees/:id/reject — admin: reject (removes the request)
router.post('/employees/:id/reject', requireErpAdmin, (req, res) => {
  const info = db.prepare(`DELETE FROM erp_users WHERE id = ? AND status = 'pending'`).run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Pending registration not found.' });
  res.json({ ok: true });
});

// POST /api/erp/employees — admin: directly add a pre-approved employee
router.post('/employees', requireErpAdmin, (req, res) => {
  const { name, email, password, subject, grade } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Name, email and password are required.' });
  const emailNorm = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM erp_users WHERE email = ?').get(emailNorm);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });
  const info = db.prepare(
    `INSERT INTO erp_users (name, email, password, role, status, subject, grade) VALUES (?, ?, ?, 'employee', 'approved', ?, ?)`
  ).run(name.trim(), emailNorm, password, subject || '', grade || '');
  res.json(publicUser(db.prepare('SELECT * FROM erp_users WHERE id = ?').get(info.lastInsertRowid)));
});

// PATCH /api/erp/employees/:id — admin: assign subject/grade
router.patch('/employees/:id', requireErpAdmin, (req, res) => {
  const { subject, grade } = req.body || {};
  db.prepare(
    `UPDATE erp_users SET subject = COALESCE(?, subject), grade = COALESCE(?, grade) WHERE id = ? AND role = 'employee'`
  ).run(subject ?? null, grade ?? null, req.params.id);
  res.json({ ok: true });
});

// DELETE /api/erp/employees/:id — admin: remove an employee
router.delete('/employees/:id', requireErpAdmin, (req, res) => {
  db.prepare(`DELETE FROM erp_users WHERE id = ? AND role = 'employee'`).run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
