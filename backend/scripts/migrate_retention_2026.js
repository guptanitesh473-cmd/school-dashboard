/**
 * Migration: update retention_detail from Google Sheet (March 2026)
 * - Updates all existing school data with latest numbers
 * - Adds St. Theressa and Jain as new schools
 */
const db = require('../database');

db.prepare('DELETE FROM retention_detail').run();

let so = 0;
const ins = db.prepare(`
  INSERT INTO retention_detail
    (school_name, sno, grade_current, grade_next, total_strength,
     app_fees_paid, interested, yet_to_decide, not_interested,
     pct_not_interested, is_grand_total, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function row(school, sno, cur, next, total, appFees, int_, ytd, ni, pct, grand = 0) {
  ins.run(school, String(sno), cur, next, total, appFees, int_, ytd, ni, pct, grand ? 1 : 0, so++);
}

// ─── OIS Kelambakkam ──────────────────────────────────────────────────────────
const K = 'OIS Kelambakkam';
row(K, 1,  'Nursery', 'K1',  7,  3,  0,  0,  4, '57%');
row(K, 2,  'K1',      'K2',  34, 19,  2,  0, 13, '38%');
row(K, 3,  'K2',      'G1',  35, 20,  2,  0, 13, '37%');
row(K, 4,  'G1',      'G2',  40, 21,  2,  0, 17, '43%');
row(K, 5,  'G2',      'G3',  36, 26,  0,  0, 10, '28%');
row(K, 6,  'G3',      'G4',  33, 19,  0,  0, 14, '42%');
row(K, 7,  'G4',      'G5',  35, 20,  0,  0, 15, '43%');
row(K, 8,  'G5',      'G6',  29, 17,  1,  0, 11, '38%');
row(K, 9,  'G6',      'G7',  25, 14,  0,  0, 11, '44%');
row(K, 10, 'G7',      'G8',  26, 18,  0,  0,  8, '31%');
row(K, 11, 'G8',      'G9',  11,  7,  0,  0,  4, '36%');
row(K, 12, 'G9',      'G10', 19, 17,  0,  0,  2, '11%');
row(K, 13, 'G10',     'G11',  8,  2,  1,  0,  5, '63%');
row(K, 14, 'G11',     'G12', 14, 12,  0,  0,  2, '14%');
row(K, '', 'Grand Total', '', 352, 215, 8, 0, 129, '37%', 1);

// ─── OIS Oragadam ─────────────────────────────────────────────────────────────
const O = 'OIS Oragadam';
row(O, 1,  'Pre Nursery', 'Pre KG', 9,  null,  9, 0, 0, '0%');
row(O, 2,  'Nursery',     'KG1',   10,  null, 10, 0, 0, '0%');
row(O, 3,  'K1',          'KG2',   19,  null, 15, 0, 4, '21%');
row(O, 4,  'K2',          'G1',    31,  null, 30, 0, 1, '3%');
row(O, 5,  'G1',          'G2',    33,  null, 31, 1, 1, '3%');
row(O, 6,  'G2',          'G3',    32,  null, 16, 0, 2, '6%');
row(O, 7,  'G3',          'G4',    25,  null, 25, 0, 0, '0%');
row(O, 8,  'G4',          'G5',    17,  null, 15, 1, 1, '6%');
row(O, 9,  'G5',          'G6',    12,  null, 10, 1, 1, '8%');
row(O, 10, 'G6',          'G7',    20,  null, 15, 0, 5, '25%');
row(O, 11, 'G7',          'G8',     9,  null,  7, 0, 2, '22%');
row(O, 12, 'G8',          'G9',     9,  null,  6, 1, 2, '22%');
row(O, 13, 'G9',          'G10',    6,  null,  5, 0, 1, '17%');
row(O, '', 'Grand Total', '',      223,  null, 185, 4, 20, '9%', 1);

// ─── OIS HSR ──────────────────────────────────────────────────────────────────
const H = 'OIS HSR';
row(H, 1,  'PreKG', 'KG1',  2, null,  1, 0,  1, '50%');
row(H, 2,  'KG1',  'KG2',   9, null,  5, 0,  4, '44%');
row(H, 3,  'KG2',  'G1',   12, null, 10, 0,  2, '17%');
row(H, 4,  'G1',   'G2',   27, null, 22, 0,  5, '19%');
row(H, 5,  'G2',   'G3',   21, null, 20, 0,  1, '5%');
row(H, 6,  'G3',   'G4',   43, null, 39, 0,  4, '9%');
row(H, 7,  'G4',   'G5',   29, null, 27, 0,  2, '7%');
row(H, 8,  'G5',   'G6',   35, null, 29, 0,  6, '17%');
row(H, 9,  'G6',   'G7',   50, null, 38, 0, 12, '24%');
row(H, 10, 'G7',   'G8',   33, null, 29, 0,  4, '12%');
row(H, 11, 'G8',   'G9',   47, null, 43, 0,  4, '9%');
row(H, 12, 'G9',   'G10',  41, null, 41, 0,  0, '0%');
row(H, 13, 'G10',  'G11',  32, null,  0, 0, 32, '100%');
row(H, '', 'Grand Total', '', 349, null, 304, 0, 45, '13%', 1);

// ─── OIS Dindigul ─────────────────────────────────────────────────────────────
const D = 'OIS Dindigul';
row(D, 1,  'Toddler', 'Nursery',  7, null,  4,  1,  2, '29%');
row(D, 2,  'Nursery', 'LKG',     23, null, 20,  0,  3, '13%');
row(D, 3,  'LKG',     'UKG',     34, null, 29,  1,  4, '12%');
row(D, 4,  'UKG',     'G1',      36, null, 28,  2,  6, '17%');
row(D, 5,  'G1',      'G2',      54, null, 48,  2,  4, '7%');
row(D, 6,  'G2',      'G3',      51, null, 37,  1, 13, '25%');
row(D, 7,  'G3',      'G4',      34, null, 32,  1,  1, '3%');
row(D, 8,  'G4',      'G5',      29, null, 25, -1,  5, '17%');
row(D, 9,  'G5',      'G6',      17, null, 14,  1,  2, '12%');
row(D, 10, 'G6',      'G7',      23, null, 17,  1,  5, '22%');
row(D, 11, 'G7',      'G8',      22, null, 18,  1,  3, '14%');
row(D, 12, 'G8',      'G9',      17, null, 12,  1,  4, '24%');
row(D, 13, 'G9',      'G10',     16, null, 14,  2,  0, '0%');
row(D, 14, 'G10',     'G11',     10, null,  8,  1,  1, '10%');
row(D, 15, 'G11',     'G12',     11, null, 10,  1,  0, '0%');
row(D, '', 'Grand Total', '',    373, null, 306, 14, 53, '14%', 1);

// ─── OIS Arkere ───────────────────────────────────────────────────────────────
const A = 'OIS Arkere';
row(A, 1,  'Pre Nursery', 'Nur',  5, null,  3, 0,  2, '40%');
row(A, 2,  'Nur',         'LKG', 16, null, 13, 0,  3, '19%');
row(A, 3,  'LKG',         'UKG', 10, null,  9, 0,  1, '10%');
row(A, 4,  'UKG',         'G1',  15, null, 15, 0,  0, '0%');
row(A, 5,  'G1',          'G2',  46, null, 36, 0, 10, '22%');
row(A, 6,  'G2',          'G3',  34, null, 32, 0,  2, '6%');
row(A, 7,  'G3',          'G4',  32, null, 27, 0,  5, '16%');
row(A, 8,  'G4',          'G5',  19, null, 17, 0,  2, '11%');
row(A, 9,  'G5',          'G6',  33, null, 28, 0,  5, '15%');
row(A, 10, 'G6',          'G7',  30, null, 25, 0,  5, '17%');
row(A, 11, 'G7',          'G8',  36, null, 32, 0,  3, '8%');
row(A, 12, 'G8',          'G9',  33, null, 29, 0,  4, '12%');
row(A, 13, 'G9',          'G10', 19, null, 19, 0,  0, '0%');
row(A, '', 'Grand Total', '',   328, null, 285, 0, 42, '13%', 1);

// ─── OIS Marathalli ───────────────────────────────────────────────────────────
const M = 'OIS Marathalli';
row(M, 1,  'NUR',  'KG1',   2, null,  2, 0,  0, '0%');
row(M, 2,  'KG1',  'KG2',  12, null, 11, 0,  1, '8%');
row(M, 3,  'KG2',  'G1',    8, null,  8, 0,  0, '0%');
row(M, 4,  'G1',   'G2',   36, null, 33, 0,  3, '8%');
row(M, 5,  'G2',   'G3',   29, null, 21, 0,  8, '28%');
row(M, 6,  'G3',   'G4',   27, null, 19, 0,  8, '30%');
row(M, 7,  'G4',   'G5',   39, null, 35, 3,  1, '3%');
row(M, 8,  'G5',   'G6',   24, null, 21, 0,  3, '13%');
row(M, 9,  'G6',   'G7',   27, null, 23, 0,  4, '15%');
row(M, 10, 'G7',   'G8',   37, null, 26, 5,  6, '16%');
row(M, 11, 'G8',   'G9',   17, null, 15, 1,  1, '6%');
row(M, 12, 'G9',   'G10',  22, null, 22, 0,  0, '-%');
row(M, 13, 'G10',  'G11',  21, null,  0, 0, 21, '100%');
row(M, '', 'Grand Total', '', 280, null, 236, 9, 35, '13%', 1);

// ─── OIS Hesarghatta (special: no total_strength, no grade_next) ──────────────
const HG = 'OIS Hesarghatta';
row(HG, '', 'Nursery',  '', null, null,   7, 0,  1, '12.50%');
row(HG, '', 'K1',       '', null, null,  17, 0,  4, '19.05%');
row(HG, '', 'K2',       '', null, null,  16, 0,  3, '15.79%');
row(HG, '', 'Grade 1',  '', null, null,  20, 0,  3, '13.04%');
row(HG, '', 'Grade 2',  '', null, null,  23, 0,  8, '25.81%');
row(HG, '', 'Grade 3',  '', null, null,  26, 0,  3, '10.34%');
row(HG, '', 'Grade 4',  '', null, null,  26, 0,  4, '13.33%');
row(HG, '', 'Grade 5',  '', null, null,  25, 0,  5, '16.67%');
row(HG, '', 'Grade 6',  '', null, null,  23, 0,  2, '8.00%');
row(HG, '', 'Grade 7',  '', null, null,  20, 0,  2, '9.09%');
row(HG, '', 'Grade 8',  '', null, null,  30, 0,  2, '6.25%');
row(HG, '', 'Grade 9',  '', null, null,  18, 0,  3, '14.29%');
row(HG, '', 'Total',    '', null, null, 244, 0, 39, '13.78%', 1);

// ─── OIS Rayasandara ──────────────────────────────────────────────────────────
const R = 'OIS Rayasandara';
row(R, 1,  'Nur',  'LKG',   8, null,  7,  0,  1, '13%');
row(R, 2,  'LKG',  'UKG',  20, null, 15,  0,  5, '25%');
row(R, 3,  'UKG',  'G1',   35, null, 25,  3,  5, '14%');
row(R, 4,  'G1',   'G2',   32, null, 21,  4,  6, '19%');
row(R, 5,  'G2',   'G3',   34, null, 30,  1,  3, '9%');
row(R, 6,  'G3',   'G4',   32, null, 27,  0,  4, '13%');
row(R, 7,  'G4',   'G5',   31, null, 25,  4,  2, '6%');
row(R, 8,  'G5',   'G6',   35, null, 29,  0,  6, '17%');
row(R, 9,  'G6',   'G7',   22, null, 19,  0,  3, '14%');
row(R, 10, 'G7',   'G8',   18, null, 16,  1,  1, '6%');
row(R, 11, 'G8',   'G9',   12, null, 11,  0,  1, '8%');
row(R, 12, 'G9',   'G10',   0, null,  0,  0,  0, '-%');
row(R, 13, 'G10',  'G11',   4, null,  4,  0,  0, '0%');
row(R, '', 'Grand Total', '', 279, null, 225, 13, 37, '13%', 1);

// ─── OIS Kumbagodu (Tatva) ────────────────────────────────────────────────────
const T = 'OIS Kumbagodu (Tatva)';
row(T, 1,  'Nursery', 'KG1',  19, null,  16,  0,  3, '16%');
row(T, 2,  'K1',      'KG2',  27, null,  26,  0,  1, '4%');
row(T, 3,  'K2',      'G1',   14, null,  10,  2,  2, '14%');
row(T, 4,  'G1',      'G2',   44, null,  40,  1,  3, '7%');
row(T, 5,  'G2',      'G3',   53, null,  41,  0, 12, '23%');
row(T, 6,  'G3',      'G4',   64, null,  56,  2,  6, '9%');
row(T, 7,  'G4',      'G5',   49, null,  40,  3,  6, '12%');
row(T, 8,  'G5',      'G6',   53, null,  42,  3,  8, '15%');
row(T, 9,  'G6',      'G7',   56, null,  49,  2,  5, '9%');
row(T, 10, 'G7',      'G8',   52, null,  47,  1,  4, '8%');
row(T, 11, 'G8',      'G9',   69, null,  67,  1,  1, '1%');
row(T, 12, 'G9',      'G10',  63, null,  61,  0,  1, '2%');
row(T, 13, 'G10',     'G11',  55, null,   5, 39, 11, '20%');
row(T, '', 'Grand Total', '',  563, null, 495, 15, 52, '9%', 1);

// ─── Dharwad ──────────────────────────────────────────────────────────────────
const DW = 'Dharwad';
row(DW, 1,  'Nursery', 'K1',  17, null,  9,  7,  1, '6%');
row(DW, 2,  'K1',      'K2',  26, null, 13,  9,  4, '15%');
row(DW, 3,  'K2',      'G1',  27, null,  8,  2,  2, '7%');
row(DW, 4,  'G1',      'G2',  42, null, 37,  5,  1, '2%');
row(DW, 5,  'G2',      'G3',  27, null, 22,  2,  3, '11%');
row(DW, 6,  'G3',      'G4',  27, null, 16, 10,  1, '4%');
row(DW, 7,  'G4',      'G5',  41, null, 30, 11,  0, '0%');
row(DW, 8,  'G5',      'G6',  34, null, 10,  8,  3, '9%');
row(DW, 9,  'G6',      'G7',  44, null, 31, 11,  2, '5%');
row(DW, 10, 'G7',      'G8',  40, null, 34,  4,  2, '5%');
row(DW, 11, 'G8',      'G9',  62, null, 49, 13,  0, '0%');
row(DW, 12, 'G9',      'G10', 45, null, 40,  4,  1, '2%');
row(DW, '', 'Grand Total', '', 432, null, 299, 86, 20, '5%', 1);

// ─── St. Theressa (NEW) ───────────────────────────────────────────────────────
const ST = 'St. Theressa';
row(ST, 1,  'Pre Nursery', 'Nursery',  2, null,  2,  0, 0, '0%');
row(ST, 2,  'Nursery',     'LKG',     10, null,  6,  3, 1, '10%');
row(ST, 3,  'K1',          'UKG',     13, null,  7,  3, 1, '15%');
row(ST, 4,  'K2',          'G1',      20, null, 11,  7, 0, '10%');
row(ST, 5,  'G1',          'G2',      21, null, 12,  8, 1, '5%');
row(ST, 6,  'G2',          'G3',      18, null,  0, 18, 0, '0%');
row(ST, 7,  'G3',          'G4',      14, null,  9,  5, 0, '0%');
row(ST, 8,  'G4',          'G5',      27, null, 26,  1, 0, '0%');
row(ST, 9,  'G5',          'G6',      11, null,  5,  3, 3, '27%');
row(ST, 10, 'G6',          'G7',      10, null,  3,  4, 3, '30%');
row(ST, 11, 'G7',          'G8',      16, null,  9,  6, 1, '6%');
row(ST, 12, 'G8',          'G9',       7, null,  0,  7, 0, '0%');
row(ST, 13, 'G9',          'G10',      5, null,  2,  3, 0, '-%');
row(ST, '', 'Grand Total', '',        169, null, 90, 65, 10, '8%', 1);

// ─── Jain (NEW) ───────────────────────────────────────────────────────────────
const J = 'Jain';
row(J, 1,  'Nursery', 'K1',   30, null, 26,  2,  2, '7%');
row(J, 2,  'K1',      'K2',   45, null, 39,  1,  3, '11%');
row(J, 3,  'K2',      'G1',   54, null, 38,  3,  6, '24%');
row(J, 4,  'G1',      'G2',   49, null, 33, 10,  4, '12%');
row(J, 5,  'G2',      'G3',   33, null, 33,  2,  0, '3%');
row(J, 6,  'G3',      'G4',   47, null, 32,  4,  1, '15%');
row(J, 7,  'G4',      'G5',   53, null, 33, 13,  0, '13%');
row(J, 8,  'G5',      'G6',   50, null, 37,  4,  0, '18%');
row(J, 9,  'G6',      'G7',   36, null, 33,  0,  0, '8%');
row(J, 10, 'G7',      'G8',   48, null, 43,  1,  2, '8%');
row(J, 11, 'G8',      'G9',   36, null, 17,  8,  0, '31%');
row(J, 12, 'G9',      'G10',  47, null,  0,  0,  0, '0%');
row(J, 13, 'G10',     'G11',  38, null,  0,  0,  0, '0%');
row(J, '', 'Grand Total', '', 528, null, 364, 48, 18, '13%', 1);

const count = db.prepare('SELECT COUNT(*) as n FROM retention_detail').get();
console.log(`Done. Total rows inserted: ${count.n}`);
