const db = require('./database');

db.prepare('DELETE FROM retention_detail').run();
console.log('Cleared retention_detail table');

const insert = db.prepare(`
  INSERT INTO retention_detail
    (school_name, sno, grade_current, grade_next, total_strength, app_fees_paid,
     interested, yet_to_decide, not_interested, pct_not_interested,
     is_grand_total, sort_order, prev_total_strength, prev_tc_requested, prev_tc_pct)
  VALUES
    (@school_name,@sno,@grade_current,@grade_next,@total_strength,@app_fees_paid,
     @interested,@yet_to_decide,@not_interested,@pct_not_interested,
     @is_grand_total,@sort_order,@prev_total_strength,@prev_tc_requested,@prev_tc_pct)
`);

const run = db.transaction((rows) => rows.forEach(r => insert.run(r)));

function row(school, sno, gc, gn, ts, fees, int_, ytd, ni, pct, gt, so, pts, ptc, ptcpct) {
  return {
    school_name: school, sno: sno || '', grade_current: gc, grade_next: gn || '',
    total_strength: ts, app_fees_paid: fees ?? null,
    interested: int_, yet_to_decide: ytd, not_interested: ni,
    pct_not_interested: pct || '', is_grand_total: gt ? 1 : 0, sort_order: so,
    prev_total_strength: pts ?? null, prev_tc_requested: ptc ?? null, prev_tc_pct: ptcpct || '',
  };
}

// ── 1. OIS Kelambakkam ────────────────────────────────────────────────────────
const S = 'OIS Kelambakkam';
run([
  row(S,'1', 'Nursery','K1',         7,  3,  0,0,  4,'57%', false, 1, null,null,'-'),
  row(S,'2', 'K1','K2',             34, 20,  0,0, 14,'41%', false, 2, null,null,'-'),
  row(S,'3', 'K2','G1',             35, 21,  0,0, 14,'40%', false, 3, null,null,'-'),
  row(S,'4', 'G1','G2',             40, 21,  0,0, 19,'48%', false, 4, null,null,'-'),
  row(S,'5', 'G2','G3',             36, 27,  0,0, 10,'28%', false, 5, null,null,'-'),
  row(S,'6', 'G3','G4',             33, 19,  0,0, 14,'42%', false, 6, null,null,'-'),
  row(S,'7', 'G4','G5',             35, 20,  0,0, 15,'43%', false, 7, null,null,'-'),
  row(S,'8', 'G5','G6',             29, 17,  0,0, 12,'41%', false, 8, null,null,'-'),
  row(S,'9', 'G6','G7',             25, 14,  0,0, 11,'44%', false, 9, null,null,'-'),
  row(S,'10','G7','G8',             26, 18,  0,0,  8,'31%', false,10, null,null,'-'),
  row(S,'11','G8','G9',             11,  7,  0,0,  4,'36%', false,11, null,null,'-'),
  row(S,'12','G9','G10',            19, 17,  0,0,  2,'11%', false,12, null,null,'-'),
  row(S,'13','G10','G11',            8,  4,  0,0,  4,'50%', false,13, null,null,'-'),
  row(S,'14','G11','G12',           14, 12,  0,0,  2,'14%', false,14, null,null,'-'),
  row(S,'', 'Kelambakkam','Grand Total',352,220,0,0,133,'38%', true,99, null,null,'-'),
]);

// ── 2. OIS Oragadam ───────────────────────────────────────────────────────────
const O = 'OIS Oragadam';
run([
  row(O,'1', 'Pre Nursery','Pre KG',  9,0,  9,0, 0,'0%',  false, 1,  0,  0,'-'),
  row(O,'2', 'Nursery','KG1',        10,0, 10,0, 0,'0%',  false, 2, 14,  0,'0.00%'),
  row(O,'3', 'K1','KG2',             19,0, 17,0, 2,'11%', false, 3, 28,  3,'10.71%'),
  row(O,'4', 'K2','G1',              31,0, 30,0, 1,'3%',  false, 4, 34,  4,'11.76%'),
  row(O,'5', 'G1','G2',              33,0, 31,0, 1,'3%',  false, 5, 41, 11,'26.83%'),
  row(O,'6', 'G2','G3',              32,0, 31,0, 1,'3%',  false, 6, 22,  9,'40.91%'),
  row(O,'7', 'G3','G4',              25,0, 25,0, 0,'0%',  false, 7, 19,  4,'21.05%'),
  row(O,'8', 'G4','G5',              17,0, 16,0, 1,'6%',  false, 8, 13,  7,'53.85%'),
  row(O,'9', 'G5','G6',              12,0, 11,0, 1,'8%',  false, 9, 17,  2,'11.76%'),
  row(O,'10','G6','G7',              20,0, 15,0, 5,'25%', false,10, 12,  2,'16.67%'),
  row(O,'11','G7','G8',               9,0,  7,0, 2,'22%', false,11,  9,  4,'44.44%'),
  row(O,'12','G8','G9',               9,0,  8,0, 1,'11%', false,12, 10,  3,'30.00%'),
  row(O,'13','G9','G10',              6,0,  5,0, 1,'17%', false,13,  7,  0,'0.00%'),
  row(O,'', 'Oragadam','Grand Total',223,0,206,0,16,'7%',  true,99,226, 49,'21.68%'),
]);

// ── 3. OIS HSR (VELLS HSR) ────────────────────────────────────────────────────
const H = 'OIS HSR';
run([
  row(H,'1', 'PreKG','KG1',           2,0,  1,0,  1,'50%',  false, 1,  4,  0,'0.00%'),
  row(H,'2', 'KG1','KG2',             9,0,  5,0,  4,'44%',  false, 2, 10,  1,'10.00%'),
  row(H,'3', 'KG2','G1',             12,0, 10,0,  2,'17%',  false, 3, 13,  2,'15.38%'),
  row(H,'4', 'G1','G2',              27,0, 22,0,  5,'19%',  false, 4, 31, 13,'41.94%'),
  row(H,'5', 'G2','G3',              21,0, 20,0,  1,'5%',   false, 5, 45,  5,'11.11%'),
  row(H,'6', 'G3','G4',              43,0, 39,0,  4,'9%',   false, 6, 38, 12,'31.58%'),
  row(H,'7', 'G4','G5',              29,0, 27,0,  2,'7%',   false, 7, 40,  5,'12.50%'),
  row(H,'8', 'G5','G6',              35,0, 29,0,  6,'17%',  false, 8, 49,  4,'8.16%'),
  row(H,'9', 'G6','G7',              50,0, 38,0, 12,'24%',  false, 9, 45, 14,'31.11%'),
  row(H,'10','G7','G8',              33,0, 29,0,  4,'12%',  false,10, 51,  9,'17.65%'),
  row(H,'11','G8','G9',              47,0, 43,0,  4,'9%',   false,11, 47,  8,'17.02%'),
  row(H,'12','G9','G10',             41,0, 41,0,  0,'0%',   false,12, 33,  1,'3.03%'),
  row(H,'13','G10','G11',            32,0,  0,0, 32,'100%', false,13,null,null,''),
  row(H,'', 'VELLS HSR','Grand Total',349,0,304,0,45,'13%', true,99,406, 74,'18.23%'),
]);

// ── 4. OIS Dindigul ───────────────────────────────────────────────────────────
const D = 'OIS Dindigul';
run([
  row(D,'1', 'Toddler','Nursery',     7, 2,  4, 1, 2,'29%', false, 1,  7,  0,'0.00%'),
  row(D,'2', 'Nursery','LKG',        23, 7, 20, 0, 3,'13%', false, 2, 14,  6,'42.86%'),
  row(D,'3', 'LKG','UKG',            34, 5, 29, 1, 4,'12%', false, 3, 21,  3,'14.29%'),
  row(D,'4', 'UKG','G1',             36, 1, 28, 2, 6,'17%', false, 4, 34,  6,'17.65%'),
  row(D,'5', 'G1','G2',              53, 2, 48, 1, 4,'8%',  false, 5, 42,  9,'21.43%'),
  row(D,'6', 'G2','G3',              51, 7, 37, 1,13,'25%', false, 6, 55, 11,'20.00%'),
  row(D,'7', 'G3','G4',              34, 2, 32, 1, 1,'3%',  false, 7, 49, 17,'34.69%'),
  row(D,'8', 'G4','G5',              31, 1, 25, 1, 5,'16%', false, 8, 36, 14,'38.89%'),
  row(D,'9', 'G5','G6',              17, 1, 14, 1, 2,'12%', false, 9, 28, 13,'46.43%'),
  row(D,'10','G6','G7',              23, 1, 17, 1, 5,'22%', false,10, 20,  3,'15.00%'),
  row(D,'11','G7','G8',              22, 2, 18, 1, 3,'14%', false,11, 24,  8,'33.33%'),
  row(D,'12','G8','G9',              17, 1, 12, 1, 4,'24%', false,12, 23,  8,'34.78%'),
  row(D,'13','G9','G10',             16, 0, 14, 2, 0,'0%',  false,13, 21,  9,'42.86%'),
  row(D,'14','G10','G11',            10, 0,  8, 1, 1,'10%', false,14,  9,  0,'0.00%'),
  row(D,'15','G11','G12',            11, 1, 10, 1, 0,'0%',  false,15,  8,  1,'12.50%'),
  row(D,'', 'Dindugal','Grand Total',374,31,306,15,53,'14%', true,99,391,108,'27.62%'),
]);

// ── 5. OIS Arkere (no yet_to_decide) ─────────────────────────────────────────
const A = 'OIS Arkere';
run([
  row(A,'1', 'Pre Nursery','Nur',     5,0,  3,0, 2,'40%', false, 1,  3,  0,'0.00%'),
  row(A,'2', 'Nur','LKG',            16,0, 13,0, 3,'19%', false, 2,  5,  2,'40.00%'),
  row(A,'3', 'LKG','UKG',            10,0,  8,0, 2,'20%', false, 3, 11,  1,'9.09%'),
  row(A,'4', 'UKG','G1',             15,0, 15,0, 0,'0%',  false, 4, 13,  2,'15.38%'),
  row(A,'5', 'G1','G2',              46,0, 38,0, 8,'17%', false, 5, 30,  5,'16.67%'),
  row(A,'6', 'G2','G3',              34,0, 32,0, 2,'6%',  false, 6, 28,  3,'10.71%'),
  row(A,'7', 'G3','G4',              32,0, 29,0, 3,'9%',  false, 7, 17,  1,'5.88%'),
  row(A,'8', 'G4','G5',              19,0, 16,0, 3,'16%', false, 8, 33,  6,'18.18%'),
  row(A,'9', 'G5','G6',              33,0, 29,0, 4,'12%', false, 9, 31,  4,'12.90%'),
  row(A,'10','G6','G7',              30,0, 24,0, 6,'20%', false,10, 38,  5,'13.16%'),
  row(A,'11','G7','G8',              36,0, 30,0, 6,'17%', false,11, 35,  4,'11.43%'),
  row(A,'12','G8','G9',              33,0, 27,0, 6,'18%', false,12, 31, 13,'41.94%'),
  row(A,'13','G9','G10',             19,0, 19,0, 0,'0%',  false,13, 20,  0,'0.00%'),
  row(A,'', 'Arakere','Grand Total', 328,0,283,0,45,'14%', true,99,295, 46,'15.59%'),
]);

// ── 6. OIS Marathalli ─────────────────────────────────────────────────────────
const MA = 'OIS Marathalli';
run([
  row(MA,'1', 'NUR','KG1',            9, 3,  2,0, 0,'0%',   false, 1,  5,  0,'0%'),
  row(MA,'2', 'KG1','KG2',           16, 0, 11,0, 1,'6%',   false, 2,  8,  1,'13%'),
  row(MA,'3', 'KG2','G1',            20, 6,  8,0, 0,'0%',   false, 3, 11,  2,'18%'),
  row(MA,'4', 'G1','G2',             40,10, 33,0, 4,'10%',  false, 4, 32,  2,'6%'),
  row(MA,'5', 'G2','G3',             31, 9, 22,0, 7,'23%',  false, 5, 38,  8,'21%'),
  row(MA,'6', 'G3','G4',             28,10, 19,0, 8,'29%',  false, 6, 44,  5,'11%'),
  row(MA,'7', 'G4','G5',             40,15, 34,3, 2,'5%',   false, 7, 28,  6,'21%'),
  row(MA,'8', 'G5','G6',             25, 7, 21,0, 3,'12%',  false, 8, 30,  6,'20%'),
  row(MA,'9', 'G6','G7',             27, 5, 23,0, 4,'15%',  false, 9, 41,  2,'5%'),
  row(MA,'10','G7','G8',             38, 8, 26,5, 7,'18%',  false,10, 24,  6,'25%'),
  row(MA,'11','G8','G9',             18, 4, 15,1, 2,'11%',  false,11, 27,  7,'26%'),
  row(MA,'12','G9','G10',            22,11, 22,0, 0,'-',    false,12, 22,  2,'9%'),
  row(MA,'13','G10','G11',           21, 0,  0,0,21,'100%', false,13, 30, 30,'100%'),
  row(MA,'', 'VELLS Marathalli','Grand Total',314,88,236,9,38,'12%',true,99,310,47,'15%'),
]);

// ── 7. OIS Hesarghatta (special: no grade_next, total = int+ni) ───────────────
const HE = 'OIS Hesarghatta';
run([
  row(HE,'','Nursery','',        8,0,  7,0,1,'12.50%',false, 1,  7, 1,'14.29%'),
  row(HE,'','K1','',            21,0, 17,0,4,'19.05%',false, 2, 14, 3,'21.43%'),
  row(HE,'','K2','',            19,0, 16,0,3,'15.79%',false, 3, 21, 7,'33.33%'),
  row(HE,'','GRADE 1','',       23,0, 20,0,3,'13.04%',false, 4, 33, 6,'18.18%'),
  row(HE,'','GRADE 2','',       31,0, 23,0,8,'25.81%',false, 5, 29, 3,'10.34%'),
  row(HE,'','GRADE 3','',       29,0, 26,0,3,'10.34%',false, 6, 33, 4,'12.12%'),
  row(HE,'','GRADE 4','',       30,0, 26,0,4,'13.33%',false, 7, 31, 4,'12.90%'),
  row(HE,'','GRADE 5','',       30,0, 25,0,5,'16.67%',false, 8, 27, 2,'7.41%'),
  row(HE,'','GRADE 6','',       25,0, 23,0,2,'8.00%', false, 9, 29, 8,'27.59%'),
  row(HE,'','GRADE 7','',       22,0, 20,0,2,'9.09%', false,10, 31, 3,'9.68%'),
  row(HE,'','GRADE 8','',       32,0, 30,0,2,'6.25%', false,11, 23, 5,'21.74%'),
  row(HE,'','GRADE 9','',       21,0, 18,0,3,'14.29%',false,12, 41, 3,'7.32%'),
  row(HE,'','Hessarghatta Total','',283,0,244,0,39,'13.78%',true,99,312,48,'15.38%'),
]);

// ── 8. OIS Rayasandara (no yet_to_decide) ────────────────────────────────────
const R = 'OIS Rayasandara';
run([
  row(R,'1', 'Prenursery','Nursery',  8,0,  7,0, 1,'12.50%',false, 1, 38,  0,'0.00%'),
  row(R,'2', 'Nursery','K1',         20,0, 15,0, 5,'25.00%',false, 2, 32,  0,'0.00%'),
  row(R,'3', 'K1','K2',              35,0, 26,0, 9,'25.71%',false, 3, 39, 13,'33.30%'),
  row(R,'4', 'K2','G1',              34,0, 26,0, 8,'23.53%',false, 4, 35,  6,'17.10%'),
  row(R,'5', 'G1','G2',              34,0, 30,0, 4,'11.76%',false, 5, 36, 11,'30.60%'),
  row(R,'6', 'G2','G3',              32,0, 25,0, 7,'21.88%',false, 6, 35,  5,'14.30%'),
  row(R,'7', 'G3','G4',              31,0, 27,0, 4,'12.90%',false, 7, 27,  1,'3.70%'),
  row(R,'8', 'G4','G5',              35,0, 29,0, 6,'17.14%',false, 8, 15,  1,'6.70%'),
  row(R,'9', 'G5','G6',              22,0, 19,0, 3,'13.64%',false, 9, 11,  0,'0.00%'),
  row(R,'10','G6','G7',              18,0, 17,0, 1,'5.56%', false,10,  1,  1,'100.00%'),
  row(R,'11','G7','G8',              12,0, 11,0, 1,'8.33%', false,11,  3,  0,'0.00%'),
  row(R,'12','G8','G9',               0,0,  0,0, 0,'0.00%', false,12,null, 0,'-'),
  row(R,'13','G9','G10',              4,0,  4,0, 0,'0.00%', false,13,null, 0,'-'),
  row(R,'', 'Siddhanta','Grand Total',281,0,232,0,49,'17.44%',true,99,272,38,'14.00%'),
]);

// ── 9. OIS Kumbagodu (Tatva) ──────────────────────────────────────────────────
const T = 'OIS Kumbagodu (Tatva)';
run([
  row(T,'1', 'Nursery','KG1',        19,0, 16, 0, 3,'16%', false, 1, 15,null,''),
  row(T,'2', 'K1','KG2',             27,0, 26, 0, 1,'4%',  false, 2, 16,null,''),
  row(T,'3', 'K2','G1',              14,0, 10, 2, 2,'14%', false, 3, 13,   7,'53.85%'),
  row(T,'4', 'G1','G2',              44,0, 40, 1, 3,'7%',  false, 4, 53,   3,'5.66%'),
  row(T,'5', 'G2','G3',              53,0, 41, 0,12,'23%', false, 5, 66,   9,'13.64%'),
  row(T,'6', 'G3','G4',              64,0, 56, 2, 9,'14%', false, 6, 47,  14,'29.79%'),
  row(T,'7', 'G4','G5',              49,0, 40, 3, 6,'12%', false, 7, 54,   5,'9.26%'),
  row(T,'8', 'G5','G6',              53,0, 42, 3, 8,'15%', false, 8, 57,   7,'12.28%'),
  row(T,'9', 'G6','G7',              56,0, 49, 2, 5,'9%',  false, 9, 50,  12,'24.00%'),
  row(T,'10','G7','G8',              52,0, 47, 1, 4,'8%',  false,10, 62,   4,'6.45%'),
  row(T,'11','G8','G9',              69,0, 67, 1, 1,'1%',  false,11, 63,   7,'11.11%'),
  row(T,'12','G9','G10',             63,0, 61, 0, 1,'2%',  false,12, 54,   5,'9.26%'),
  row(T,'13','G10','G11',            55,0,  5,39,11,'20%', false,13, 53,null,''),
  row(T,'', 'Tatva','Grand Total',  563,0,495,15,55,'10%', true,99,550,  73,'13.27%'),
]);

// ── 10. Dharwad ───────────────────────────────────────────────────────────────
const DW = 'Dharwad';
run([
  row(DW,'1', 'Nursery','K1',        17,0,  9, 7, 1,'6%',  false, 1, 11,  1,'9%'),
  row(DW,'2', 'K1','K2',             26,0, 13, 9, 4,'15%', false, 2, 16,  4,'25%'),
  row(DW,'3', 'K2','G1',             27,0,  8, 2, 2,'7%',  false, 3, 24,  6,'25%'),
  row(DW,'4', 'G1','G2',             43,0, 37, 5, 1,'2%',  false, 4, 30,  6,'20%'),
  row(DW,'5', 'G2','G3',             27,0, 22, 2, 3,'11%', false, 5, 24,  1,'4%'),
  row(DW,'6', 'G3','G4',             27,0, 16,10, 1,'4%',  false, 6, 44,  8,'18%'),
  row(DW,'7', 'G4','G5',             41,0, 30,11, 0,'0%',  false, 7, 37,  7,'19%'),
  row(DW,'8', 'G5','G6',             34,0, 10, 8, 3,'9%',  false, 8, 43,  6,'14%'),
  row(DW,'9', 'G6','G7',             44,0, 31,11, 2,'5%',  false, 9, 38,  3,'8%'),
  row(DW,'10','G7','G8',             40,0, 34, 4, 2,'5%',  false,10, 68,  9,'13%'),
  row(DW,'11','G8','G9',             62,0, 49,13, 0,'0%',  false,11, 43,  4,'9%'),
  row(DW,'12','G9','G10',            45,0, 40, 4, 1,'2%',  false,12, 28,  2,'7%'),
  row(DW,'', 'Dharwad','Grand Total',433,0,299,86,20,'5%', true,99,406, 57,'14%'),
]);

// ── 11. St. Theressa ─────────────────────────────────────────────────────────
const ST = 'St. Theressa';
run([
  row(ST,'1', 'Pre Nursery','Nursery', 2, 1,  2, 0, 0,'0%',  false, 1,  4,  0,'0.00%'),
  row(ST,'2', 'Nursery','LKG',        10, 4,  7, 0, 3,'50%', false, 2, 10,  0,'0.00%'),
  row(ST,'3', 'K1','UKG',             13, 4, 11, 0, 1,'23%', false, 3, 24,  0,'0.00%'),
  row(ST,'4', 'K2','G1',              20, 6, 14, 1, 3,'25%', false, 4, 23,  0,'0.00%'),
  row(ST,'5', 'G1','G2',              21, 8, 17, 3, 1,'5%',  false, 5, 24,  7,'29.17%'),
  row(ST,'6', 'G2','G3',              18, 3, 14, 1, 3,'17%', false, 6, 17,  4,'23.53%'),
  row(ST,'7', 'G3','G4',              14, 8, 12, 2, 0,'0%',  false, 7, 34,  8,'23.53%'),
  row(ST,'8', 'G4','G5',              27, 9, 27, 0, 0,'0%',  false, 8, 18,  7,'38.89%'),
  row(ST,'9', 'G5','G6',              11, 2,  7, 0, 1,'36%', false, 9, 13,  4,'30.77%'),
  row(ST,'10','G6','G7',              10, 0,  5, 1, 4,'40%', false,10, 18,  3,'16.67%'),
  row(ST,'11','G7','G8',              16, 0, 13, 1, 2,'13%', false,11, 10,  3,'30.00%'),
  row(ST,'12','G8','G9',               7, 5,  6, 0, 1,'14%', false,12,  5,  1,'20.00%'),
  row(ST,'13','G9','G10',              5, 0,  4, 0, 0,'20%', false,13,  9,  0,'0.00%'),
  row(ST,'', 'St. Theressa','Grand Total',174,50,139,9,19,'17%',true,99,209,null,'17.70%'),
]);

// ── 12. Jain ─────────────────────────────────────────────────────────────────
const J = 'Jain';
run([
  row(J,'1', 'Nursery','K1',         30,null, 26, 2, 2,'7%',  false, 1, null,null,''),
  row(J,'2', 'K1','K2',              45,null, 39, 1, 3,'11%', false, 2, null,null,''),
  row(J,'3', 'K2','G1',              54,null, 38, 3, 6,'24%', false, 3, null,null,''),
  row(J,'4', 'G1','G2',              49,null, 33,10, 4,'12%', false, 4, null,null,''),
  row(J,'5', 'G2','G3',              33,null, 33, 2, 0,'3%',  false, 5, null,null,''),
  row(J,'6', 'G3','G4',              47,null, 32, 4, 1,'15%', false, 6, null,null,''),
  row(J,'7', 'G4','G5',              53,null, 33,13, 0,'13%', false, 7, null,null,''),
  row(J,'8', 'G5','G6',              50,null, 37, 4, 0,'18%', false, 8, null,null,''),
  row(J,'9', 'G6','G7',              36,null, 33, 0, 0,'8%',  false, 9, null,null,''),
  row(J,'10','G7','G8',              48,null, 43, 1, 2,'8%',  false,10, null,null,''),
  row(J,'11','G8','G9',              36,null, 17, 8, 0,'31%', false,11, null,null,''),
  row(J,'12','G9','G10',             47,null,  0, 0, 0,'0%',  false,12, null,null,''),
  row(J,'13','G10','G11',            38,null,  0, 0, 0,'0%',  false,13, null,null,''),
  row(J,'', 'Jain','Grand Total',   528,null,364,48,18,'13%', true,99, null,null,''),
]);

const count = db.prepare('SELECT COUNT(*) as c FROM retention_detail').get().c;
console.log(`Done! ${count} rows inserted across 12 schools.`);
