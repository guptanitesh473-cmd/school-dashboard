const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../database');

// In-memory sessions for the BLA Dashboard (ERP) sub-app — entirely separate
// from the main dashboard's auth/session store.
const sessions = new Map();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function todayDateStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Working days elapsed this month so far (excludes Sundays)
function workingDaysElapsedThisMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  let count = 0;
  for (let day = 1; day <= todayDate; day++) {
    if (new Date(year, month, day).getDay() !== 0) count++;
  }
  return count;
}

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

/* ------------------------------------------------------------------ */
/*  Leave requests — all go to admin for approval                     */
/* ------------------------------------------------------------------ */

// POST /api/erp/leaves — employee: apply for leave
router.post('/leaves', requireErpAuth, (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body || {};
  if (!start_date || !end_date || !reason?.trim())
    return res.status(400).json({ error: 'Start date, end date and reason are required.' });
  const info = db.prepare(
    `INSERT INTO erp_leave_requests (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`
  ).run(req.erpUser.userId, leave_type || 'Casual leave', start_date, end_date, reason.trim());
  res.json(db.prepare('SELECT * FROM erp_leave_requests WHERE id = ?').get(info.lastInsertRowid));
});

// GET /api/erp/leaves/mine — employee: own leave requests
router.get('/leaves/mine', requireErpAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM erp_leave_requests WHERE employee_id = ? ORDER BY created_at DESC`).all(req.erpUser.userId);
  res.json(rows);
});

// GET /api/erp/leaves — admin: all leave requests, pending first
router.get('/leaves', requireErpAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT lr.*, u.name as employee_name, u.email as employee_email
    FROM erp_leave_requests lr JOIN erp_users u ON u.id = lr.employee_id
    ORDER BY (lr.status = 'pending') DESC, lr.created_at DESC
  `).all();
  res.json(rows);
});

// POST /api/erp/leaves/:id/approve — admin
router.post('/leaves/:id/approve', requireErpAdmin, (req, res) => {
  const info = db.prepare(`UPDATE erp_leave_requests SET status = 'approved' WHERE id = ? AND status = 'pending'`).run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Pending leave request not found.' });
  res.json({ ok: true });
});

// POST /api/erp/leaves/:id/reject — admin
router.post('/leaves/:id/reject', requireErpAdmin, (req, res) => {
  const info = db.prepare(`UPDATE erp_leave_requests SET status = 'rejected' WHERE id = ? AND status = 'pending'`).run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Pending leave request not found.' });
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/*  Attendance — real check-in/out tracking                           */
/* ------------------------------------------------------------------ */

// POST /api/erp/attendance/checkin — employee
router.post('/attendance/checkin', requireErpAuth, (req, res) => {
  const date = todayDateStr();
  const existing = db.prepare(`SELECT * FROM erp_attendance WHERE employee_id = ? AND date = ?`).get(req.erpUser.userId, date);
  if (existing) return res.status(409).json({ error: 'Already checked in today.' });
  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  db.prepare(`INSERT INTO erp_attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, 'Present')`).run(req.erpUser.userId, date, now);
  res.json(db.prepare(`SELECT * FROM erp_attendance WHERE employee_id = ? AND date = ?`).get(req.erpUser.userId, date));
});

// POST /api/erp/attendance/checkout — employee
router.post('/attendance/checkout', requireErpAuth, (req, res) => {
  const date = todayDateStr();
  const existing = db.prepare(`SELECT * FROM erp_attendance WHERE employee_id = ? AND date = ?`).get(req.erpUser.userId, date);
  if (!existing) return res.status(400).json({ error: 'You have not checked in today.' });
  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  db.prepare(`UPDATE erp_attendance SET check_out = ? WHERE id = ?`).run(now, existing.id);
  res.json(db.prepare(`SELECT * FROM erp_attendance WHERE id = ?`).get(existing.id));
});

// GET /api/erp/attendance/mine — employee: this month's records + summary
router.get('/attendance/mine', requireErpAuth, (req, res) => {
  const prefix = monthPrefix();
  const records = db.prepare(`SELECT * FROM erp_attendance WHERE employee_id = ? AND date LIKE ? ORDER BY date DESC`).all(req.erpUser.userId, `${prefix}%`);
  const daysPresent = records.filter((r) => r.status === 'Present').length;
  const workingDaysElapsed = workingDaysElapsedThisMonth();
  const pct = workingDaysElapsed ? Math.round((daysPresent / workingDaysElapsed) * 100) : 0;
  res.json({ records, daysPresent, workingDaysElapsed, pct });
});

// GET /api/erp/attendance/summary — admin: per-employee attendance % this month
router.get('/attendance/summary', requireErpAdmin, (req, res) => {
  const prefix = monthPrefix();
  const workingDaysElapsed = workingDaysElapsedThisMonth();
  const employees = db.prepare(`SELECT id, name, email FROM erp_users WHERE role = 'employee' AND status = 'approved'`).all();
  const summary = employees.map((e) => {
    const daysPresent = db.prepare(
      `SELECT COUNT(*) as c FROM erp_attendance WHERE employee_id = ? AND date LIKE ? AND status = 'Present'`
    ).get(e.id, `${prefix}%`).c;
    const pct = workingDaysElapsed ? Math.round((daysPresent / workingDaysElapsed) * 100) : 0;
    return { employee_id: e.id, name: e.name, email: e.email, daysPresent, workingDaysElapsed, pct };
  });
  res.json(summary);
});

module.exports = router;
