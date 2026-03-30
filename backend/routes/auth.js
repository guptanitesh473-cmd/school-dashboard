const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../database');

// In-memory sessions: token -> { userId, username, name, role, expiresAt }
const sessions = new Map();

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function createToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    school_name: user.school_name || '',
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  return token;
}

// Exported so middleware can use the same map
module.exports.sessions = sessions;

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || user.password !== password)
    return res.status(401).json({ error: 'Invalid username or password' });

  const token = createToken(user);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role, school_name: user.school_name || '' } });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ userId: session.userId, username: session.username, name: session.name, role: session.role, school_name: session.school_name || '' });
});

module.exports.router = router;
