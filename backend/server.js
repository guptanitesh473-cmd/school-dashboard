const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Auth (public — no token required)
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);

// All other API routes require a valid session token
const requireAuth = require('./middleware/auth');
app.use('/api', requireAuth);

app.use('/api/schools', require('./routes/schools'));
app.use('/api/offerings', require('./routes/offerings'));
app.use('/api/school-offerings', require('./routes/schoolOfferings'));
app.use('/api/retention', require('./routes/retention'));
app.use('/api/retention-detail', require('./routes/retentionDetail'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/inventory', require('./routes/inventory'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve built frontend in production
const frontendDist = path.join(__dirname, 'public');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
