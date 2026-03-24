const express = require('express');
const router = express.Router();
const https = require('https');

const SHEET_ID = '1cniOqGUEz7edeZrGXzCQer8bw64HS8acI8ECZ38VEdI';
const GRADES = {
  3: '418408920',
};

// Column indices (0-based) for each broader category
const ENG_CATEGORIES = {
  'Reading & Literacy': [4, 5, 6, 7, 8, 9, 13, 14, 18, 19, 22, 23, 24],
  // Speaking(4), Q1(5),Q2(6),Q3(7),Q4(8),Q5(9),Q9(13),Q10(14),Q14(18),Q15(19),Q18(22),Q19(23),Q20(24)
  'Grammar & Writing': [10, 11, 12, 15, 16, 17, 20, 21],
  // Q6(10),Q7(11),Q8(12),Q11(15),Q12(16),Q13(17),Q16(20),Q17(21)
  'Writing': [25],
};

const MATH_CATEGORIES = {
  'Numbers & Operations': [26, 27, 28, 29, 35, 36, 37, 38, 39],
  // Q1(26),Q2(27),Q3(28),Q4(29),Q10(35),Q11(36),Q12(37),Q13(38),Q14(39)
  'Fractions': [30],          // Q5
  'Measurement & Data': [32, 33, 34],  // Q7,Q8,Q9
  'Geometry & Patterns': [31, 40],     // Q6,Q15
};

const MAX_MARKS = {
  eng: { 'Reading & Literacy': 13, 'Grammar & Writing': 8, 'Writing': 5 },
  math: { 'Numbers & Operations': 14, 'Fractions': 1, 'Measurement & Data': 3, 'Geometry & Patterns': 3 },
};
// Numbers & Operations: Q1-Q4(1 each=4) + Q10-Q14(2 each=10) = 14
// Geometry & Patterns: Q6(1) + Q15(2) = 3

function fetchCSV(sheetId, gid) {
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
    follow(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`);
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

function parseStudents(rows) {
  const students = [];
  for (const row of rows) {
    const no = parseInt(row[0]);
    if (!no || !row[1]) continue;
    const name = row[1].trim();
    const section = row[3]?.trim() || '';

    const engCats = {};
    for (const [cat, cols] of Object.entries(ENG_CATEGORIES)) {
      const score = getScore(row, cols);
      const max = MAX_MARKS.eng[cat];
      engCats[cat] = { score: Math.round(score * 10) / 10, max, pct: Math.round((score / max) * 100) };
    }

    const mathCats = {};
    for (const [cat, cols] of Object.entries(MATH_CATEGORIES)) {
      const score = getScore(row, cols);
      const max = MAX_MARKS.math[cat];
      mathCats[cat] = { score: Math.round(score * 10) / 10, max, pct: Math.round((score / max) * 100) };
    }

    const engTotal = Object.values(engCats).reduce((s, c) => s + c.score, 0);
    const engMax = Object.values(engCats).reduce((s, c) => s + c.max, 0); // 26
    const mathTotal = parseFloat(row[41]) || 0;
    const mathMax = 21;
    const grandTotal = Math.round((engTotal + mathTotal) * 10) / 10;

    students.push({
      no, name, section,
      english: { categories: engCats, total: Math.round(engTotal * 10) / 10, max: engMax },
      math: { categories: mathCats, total: mathTotal, max: mathMax },
      total: grandTotal, totalMax: engMax + mathMax,
    });
  }
  return students;
}

// GET /api/bla/grade/3
router.get('/grade/:grade', async (req, res) => {
  const gid = GRADES[parseInt(req.params.grade)];
  if (!gid) return res.status(404).json({ error: 'Grade not found' });

  try {
    const csv = await fetchCSV(SHEET_ID, gid);
    if (csv.includes('DOCTYPE')) return res.status(502).json({ error: 'Sheet not accessible' });
    const rows = parseCSV(csv);
    const students = parseStudents(rows);

    // Compute averages
    const avg = (arr, fn) => arr.length ? Math.round(arr.reduce((s, x) => s + fn(x), 0) / arr.length * 10) / 10 : 0;

    const summary = {
      total: students.length,
      sections: [...new Set(students.map(s => s.section))].sort(),
      avgTotal: avg(students, s => s.total),
      avgEnglish: avg(students, s => s.english.total),
      avgMath: avg(students, s => s.math.total),
      engCategories: Object.keys(ENG_CATEGORIES).map(cat => ({
        name: cat,
        max: MAX_MARKS.eng[cat],
        avg: avg(students, s => s.english.categories[cat].score),
        avgPct: avg(students, s => s.english.categories[cat].pct),
      })),
      mathCategories: Object.keys(MATH_CATEGORIES).map(cat => ({
        name: cat,
        max: MAX_MARKS.math[cat],
        avg: avg(students, s => s.math.categories[cat].score),
        avgPct: avg(students, s => s.math.categories[cat].pct),
      })),
    };

    res.json({ grade: req.params.grade, students, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
