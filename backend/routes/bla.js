const express = require('express');
const router = express.Router();
const https = require('https');

const SHEET_ID = '1cniOqGUEz7edeZrGXzCQer8bw64HS8acI8ECZ38VEdI';

// Each entry: gid, snoCol, sectionCol, nameCol, dataStartRow,
//   engCategories: [{name, cols, max}], mathCategories: [{name, cols, max}], mathTotalCol (optional)
const GRADE_CONFIGS = {
  1: {
    gid: '679659520', label: 'Grade 1',
    snoCol: 0, sectionCol: 1, nameCol: 2, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking & Reading', cols: [4], max: 5 },
      { name: 'Writing', cols: [5, 6], max: 10 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [7, 8, 9, 10, 11], max: 10 },
    ],
  },
  2: {
    gid: '1972416899', label: 'Grade 2',
    snoCol: 1, sectionCol: 2, nameCol: 3, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking', cols: [5], max: 5 },
      { name: 'Writing', cols: [6, 7, 8, 9], max: 10 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [10, 11, 12, 13, 14, 15], max: 10 },
    ],
  },
  3: {
    gid: '418408920', label: 'Grade 3',
    snoCol: 0, sectionCol: 3, nameCol: 1, dataStartRow: 4,
    engCategories: [
      { name: 'Reading & Literacy', cols: [4,5,6,7,8,9,13,14,18,19,22,23,24], max: 13 },
      { name: 'Grammar & Writing',  cols: [10,11,12,15,16,17,20,21], max: 8 },
      { name: 'Writing',            cols: [25], max: 5 },
    ],
    mathCategories: [
      { name: 'Numbers & Operations', cols: [26,27,28,29,35,36,37,38,39], max: 14 },
      { name: 'Fractions',            cols: [30], max: 1 },
      { name: 'Measurement & Data',   cols: [32,33,34], max: 3 },
      { name: 'Geometry & Patterns',  cols: [31,40], max: 3 },
    ],
    mathTotalCol: 41,
  },
  4: {
    gid: '2090601823', label: 'Grade 4',
    snoCol: 0, sectionCol: 1, nameCol: 2, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking', cols: [4], max: 5 },
      { name: 'Writing', cols: [5, 6, 7, 8, 9, 10], max: 25 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], max: 20 },
    ],
  },
  5: {
    gid: '1683805760', label: 'Grade 5',
    snoCol: 0, sectionCol: 3, nameCol: 1, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking',  cols: [4], max: 5 },
      { name: 'Objective', cols: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], max: 20 },
      { name: 'Writing',   cols: [26], max: 5 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49], max: 30 },
    ],
  },
  6: {
    gid: '853239414', label: 'Grade 6',
    snoCol: 0, sectionCol: 2, nameCol: 1, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking',  cols: [4], max: 5 },
      { name: 'Objective', cols: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], max: 20 },
      { name: 'Writing',   cols: [26], max: 5 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50], max: 30 },
    ],
    mathTotalCol: 27,
  },
  7: {
    gid: '650962980', label: 'Grade 7',
    snoCol: 0, sectionCol: 1, nameCol: 2, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking',  cols: [4], max: 5 },
      { name: 'Writing',   cols: [5], max: 5 },
      { name: 'Objective', cols: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], max: 20 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48], max: 30 },
    ],
    mathTotalCol: 49,
  },
  8: {
    gid: '2049470642', label: 'Grade 8',
    snoCol: 0, sectionCol: 1, nameCol: 2, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking',  cols: [4], max: 5 },
      { name: 'Writing',   cols: [5], max: 5 },
      { name: 'Objective', cols: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], max: 20 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49], max: 30 },
    ],
    mathTotalCol: 50,
  },
  9: {
    gid: '1720050063', label: 'Grade 9',
    snoCol: 0, sectionCol: 1, nameCol: 2, dataStartRow: 4,
    engCategories: [
      { name: 'Speaking',  cols: [4], max: 5 },
      { name: 'Writing',   cols: [5], max: 5 },
      { name: 'Objective', cols: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], max: 20 },
    ],
    mathCategories: [
      { name: 'Numeracy', cols: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49], max: 30 },
    ],
    mathTotalCol: 50,
  },
};

function fetchCSV(gid) {
  return new Promise((resolve, reject) => {
    const follow = (u) => {
      https.get(u, res => {
        if ([301, 302, 307].includes(res.statusCode)) return follow(res.headers.location);
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks).toString()));
        res.on('error', reject);
      }).on('error', reject);
    };
    follow(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`);
  });
}

function parseCSV(text) {
  return text.split('\n').map(line => {
    const fields = [];
    let cur = '', inQ = false;
    for (const c of line) {
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    fields.push(cur.trim());
    return fields;
  });
}

function getScore(row, cols) {
  return cols.reduce((sum, c) => sum + (parseFloat(row[c]) || 0), 0);
}

function round1(n) { return Math.round(n * 10) / 10; }

function parseStudents(rows, cfg) {
  const { snoCol, sectionCol, nameCol, dataStartRow, engCategories, mathCategories, mathTotalCol } = cfg;
  const students = [];

  for (let i = dataStartRow; i < rows.length; i++) {
    const row = rows[i];
    const no = parseInt(row[snoCol]);
    if (!no || !row[nameCol]) continue;
    const name = row[nameCol].trim();
    const section = row[sectionCol]?.trim() || '';
    if (!name || name.toLowerCase() === 'name of student') continue;

    const engCats = {};
    for (const { name: cat, cols, max } of engCategories) {
      const score = round1(getScore(row, cols));
      engCats[cat] = { score, max, pct: Math.min(100, Math.round((score / max) * 100)) };
    }
    const engTotal = round1(Object.values(engCats).reduce((s, c) => s + c.score, 0));
    const engMax = engCategories.reduce((s, c) => s + c.max, 0);

    const mathCats = {};
    for (const { name: cat, cols, max } of mathCategories) {
      const score = round1(getScore(row, cols));
      mathCats[cat] = { score, max, pct: Math.min(100, Math.round((score / max) * 100)) };
    }
    const mathMax = mathCategories.reduce((s, c) => s + c.max, 0);
    const mathTotal = mathTotalCol != null
      ? (parseFloat(row[mathTotalCol]) || round1(Object.values(mathCats).reduce((s, c) => s + c.score, 0)))
      : round1(Object.values(mathCats).reduce((s, c) => s + c.score, 0));

    students.push({
      no, name, section,
      english: { categories: engCats, total: engTotal, max: engMax },
      math: { categories: mathCats, total: mathTotal, max: mathMax },
      total: round1(engTotal + mathTotal),
      totalMax: engMax + mathMax,
    });
  }
  return students;
}

// GET /api/bla/grades — list available grades
router.get('/grades', (req, res) => {
  const grades = Object.entries(GRADE_CONFIGS).map(([g, cfg]) => ({
    grade: g,
    label: cfg.label,
  }));
  res.json(grades);
});

// GET /api/bla/grade/:grade
router.get('/grade/:grade', async (req, res) => {
  const cfg = GRADE_CONFIGS[req.params.grade];
  if (!cfg) return res.status(404).json({ error: 'Grade not found' });

  try {
    const csv = await fetchCSV(cfg.gid);
    if (csv.includes('DOCTYPE')) return res.status(502).json({ error: 'Sheet not accessible' });
    const rows = parseCSV(csv);
    const students = parseStudents(rows, cfg);

    const avg = (arr, fn) => arr.length ? round1(arr.reduce((s, x) => s + fn(x), 0) / arr.length) : 0;

    const summary = {
      total: students.length,
      sections: [...new Set(students.map(s => s.section).filter(Boolean))].sort(),
      avgTotal: avg(students, s => s.total),
      avgEnglish: avg(students, s => s.english.total),
      avgMath: avg(students, s => s.math.total),
      engCategories: cfg.engCategories.map(({ name: cat, max }) => ({
        name: cat, max,
        avg: avg(students, s => s.english.categories[cat]?.score || 0),
        avgPct: avg(students, s => s.english.categories[cat]?.pct || 0),
      })),
      mathCategories: cfg.mathCategories.map(({ name: cat, max }) => ({
        name: cat, max,
        avg: avg(students, s => s.math.categories[cat]?.score || 0),
        avgPct: avg(students, s => s.math.categories[cat]?.pct || 0),
      })),
    };

    res.json({ grade: req.params.grade, label: cfg.label, students, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
