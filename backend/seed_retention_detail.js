const db = require('./database');

// school_type: 'kelambakkam' | 'hesarghatta' | 'standard'
// For hesarghatta: interested=continuation, not_interested=discontinuation
const schools = [
  {
    name: 'OIS Kelambakkam',
    rows: [
      { sno:'1',  gc:'Nursery', gn:'K1',   total:7,   app:3,  int:0,  ytd:0, ni:4,  pct:'57%' },
      { sno:'2',  gc:'K1',     gn:'K2',   total:34,  app:19, int:2,  ytd:0, ni:13, pct:'38%' },
      { sno:'3',  gc:'K2',     gn:'G1',   total:35,  app:19, int:3,  ytd:0, ni:13, pct:'37%' },
      { sno:'4',  gc:'G1',     gn:'G2',   total:40,  app:21, int:2,  ytd:0, ni:17, pct:'43%' },
      { sno:'5',  gc:'G2',     gn:'G3',   total:36,  app:26, int:0,  ytd:0, ni:10, pct:'28%' },
      { sno:'6',  gc:'G3',     gn:'G4',   total:33,  app:19, int:0,  ytd:0, ni:14, pct:'42%' },
      { sno:'7',  gc:'G4',     gn:'G5',   total:35,  app:20, int:1,  ytd:0, ni:14, pct:'40%' },
      { sno:'8',  gc:'G5',     gn:'G6',   total:29,  app:16, int:2,  ytd:0, ni:11, pct:'38%' },
      { sno:'9',  gc:'G6',     gn:'G7',   total:25,  app:14, int:0,  ytd:0, ni:11, pct:'44%' },
      { sno:'10', gc:'G7',     gn:'G8',   total:26,  app:18, int:0,  ytd:0, ni:8,  pct:'31%' },
      { sno:'11', gc:'G8',     gn:'G9',   total:11,  app:7,  int:0,  ytd:0, ni:4,  pct:'36%' },
      { sno:'12', gc:'G9',     gn:'G10',  total:19,  app:17, int:0,  ytd:0, ni:2,  pct:'11%' },
      { sno:'13', gc:'G10',    gn:'G11',  total:8,   app:1,  int:2,  ytd:0, ni:5,  pct:'63%' },
      { sno:'14', gc:'G11',    gn:'G12',  total:14,  app:12, int:0,  ytd:0, ni:2,  pct:'14%' },
      { sno:'',   gc:'Grand Total', gn:'', total:352, app:212,int:12, ytd:0, ni:128,pct:'36%', grand:1 },
    ],
  },
  {
    name: 'OIS Oragadam',
    rows: [
      { sno:'1',  gc:'Toddler', gn:'Pre KG', total:9,   int:9,   ytd:0, ni:0,  pct:'0%' },
      { sno:'2',  gc:'Pre KG',  gn:'KG1',    total:10,  int:10,  ytd:0, ni:0,  pct:'0%' },
      { sno:'3',  gc:'KG1',     gn:'KG2',    total:19,  int:15,  ytd:0, ni:4,  pct:'21%' },
      { sno:'4',  gc:'KG2',     gn:'G1',     total:31,  int:30,  ytd:0, ni:1,  pct:'3%' },
      { sno:'5',  gc:'G1',      gn:'G2',     total:33,  int:31,  ytd:1, ni:1,  pct:'3%' },
      { sno:'6',  gc:'G2',      gn:'G3',     total:32,  int:16,  ytd:0, ni:2,  pct:'6%' },
      { sno:'7',  gc:'G3',      gn:'G4',     total:25,  int:25,  ytd:0, ni:0,  pct:'0%' },
      { sno:'8',  gc:'G4',      gn:'G5',     total:17,  int:15,  ytd:1, ni:1,  pct:'6%' },
      { sno:'9',  gc:'G5',      gn:'G6',     total:12,  int:10,  ytd:1, ni:1,  pct:'8%' },
      { sno:'10', gc:'G6',      gn:'G7',     total:20,  int:15,  ytd:0, ni:5,  pct:'25%' },
      { sno:'11', gc:'G7',      gn:'G8',     total:9,   int:7,   ytd:0, ni:2,  pct:'22%' },
      { sno:'12', gc:'G8',      gn:'G9',     total:9,   int:5,   ytd:1, ni:3,  pct:'33%' },
      { sno:'13', gc:'G9',      gn:'G10',    total:6,   int:5,   ytd:0, ni:1,  pct:'17%' },
      { sno:'',   gc:'Grand Total', gn:'',   total:223, int:184, ytd:4, ni:21, pct:'9%', grand:1 },
    ],
  },
  {
    name: 'OIS HSR',
    rows: [
      { sno:'1',  gc:'PreKG',  gn:'KG1',  total:2,   int:0,   ytd:0, ni:2,  pct:'100%' },
      { sno:'2',  gc:'KG1',    gn:'KG2',  total:9,   int:5,   ytd:0, ni:4,  pct:'44%' },
      { sno:'3',  gc:'KG2',    gn:'G1',   total:12,  int:10,  ytd:0, ni:2,  pct:'17%' },
      { sno:'4',  gc:'G1',     gn:'G2',   total:27,  int:20,  ytd:1, ni:6,  pct:'22%' },
      { sno:'5',  gc:'G2',     gn:'G3',   total:21,  int:20,  ytd:0, ni:1,  pct:'5%' },
      { sno:'6',  gc:'G3',     gn:'G4',   total:43,  int:38,  ytd:0, ni:5,  pct:'12%' },
      { sno:'7',  gc:'G4',     gn:'G5',   total:29,  int:26,  ytd:0, ni:3,  pct:'10%' },
      { sno:'8',  gc:'G5',     gn:'G6',   total:35,  int:28,  ytd:0, ni:7,  pct:'20%' },
      { sno:'9',  gc:'G6',     gn:'G7',   total:50,  int:37,  ytd:0, ni:13, pct:'26%' },
      { sno:'10', gc:'G7',     gn:'G8',   total:33,  int:30,  ytd:0, ni:3,  pct:'9%' },
      { sno:'11', gc:'G8',     gn:'G9',   total:47,  int:43,  ytd:0, ni:4,  pct:'9%' },
      { sno:'12', gc:'G9',     gn:'G10',  total:41,  int:41,  ytd:0, ni:0,  pct:'0%' },
      { sno:'13', gc:'G10',    gn:'G11',  total:32,  int:0,   ytd:0, ni:32, pct:'100%' },
      { sno:'',   gc:'Grand Total', gn:'',total:381, int:298, ytd:1, ni:82, pct:'22%', grand:1 },
    ],
  },
  {
    name: 'OIS Dindigul',
    rows: [
      { sno:'1',  gc:'Toddler', gn:'Nursery', total:7,   int:4,   ytd:1,  ni:2,  pct:'29%' },
      { sno:'2',  gc:'Nursery', gn:'LKG',     total:23,  int:23,  ytd:0,  ni:0,  pct:'0%' },
      { sno:'3',  gc:'LKG',     gn:'UKG',     total:34,  int:31,  ytd:1,  ni:2,  pct:'6%' },
      { sno:'4',  gc:'UKG',     gn:'G1',      total:36,  int:32,  ytd:2,  ni:2,  pct:'6%' },
      { sno:'5',  gc:'G1',      gn:'G2',      total:54,  int:50,  ytd:2,  ni:2,  pct:'4%' },
      { sno:'6',  gc:'G2',      gn:'G3',      total:51,  int:47,  ytd:1,  ni:3,  pct:'6%' },
      { sno:'7',  gc:'G3',      gn:'G4',      total:34,  int:33,  ytd:1,  ni:0,  pct:'0%' },
      { sno:'8',  gc:'G4',      gn:'G5',      total:29,  int:28,  ytd:-1, ni:2,  pct:'7%' },
      { sno:'9',  gc:'G5',      gn:'G6',      total:17,  int:13,  ytd:1,  ni:3,  pct:'18%' },
      { sno:'10', gc:'G6',      gn:'G7',      total:23,  int:18,  ytd:1,  ni:4,  pct:'17%' },
      { sno:'11', gc:'G7',      gn:'G8',      total:22,  int:19,  ytd:1,  ni:2,  pct:'9%' },
      { sno:'12', gc:'G8',      gn:'G9',      total:17,  int:14,  ytd:1,  ni:2,  pct:'12%' },
      { sno:'13', gc:'G9',      gn:'G10',     total:16,  int:14,  ytd:2,  ni:0,  pct:'0%' },
      { sno:'14', gc:'G10',     gn:'G11',     total:10,  int:6,   ytd:1,  ni:3,  pct:'30%' },
      { sno:'15', gc:'G11',     gn:'G12',     total:11,  int:10,  ytd:1,  ni:0,  pct:'0%' },
      { sno:'',   gc:'Grand Total', gn:'',    total:373, int:332, ytd:14, ni:27, pct:'7%', grand:1 },
    ],
  },
  {
    name: 'OIS Arkere',
    rows: [
      { sno:'1',  gc:'Pre Nursery', gn:'Nur', total:5,   int:3,   ytd:0, ni:2,  pct:'40%' },
      { sno:'2',  gc:'Nur',   gn:'LKG',  total:16,  int:13,  ytd:0, ni:3,  pct:'19%' },
      { sno:'3',  gc:'LKG',   gn:'UKG',  total:10,  int:9,   ytd:0, ni:1,  pct:'10%' },
      { sno:'4',  gc:'UKG',   gn:'G1',   total:15,  int:15,  ytd:0, ni:0,  pct:'0%' },
      { sno:'5',  gc:'G1',    gn:'G2',   total:46,  int:36,  ytd:0, ni:10, pct:'22%' },
      { sno:'6',  gc:'G2',    gn:'G3',   total:34,  int:32,  ytd:0, ni:2,  pct:'6%' },
      { sno:'7',  gc:'G3',    gn:'G4',   total:32,  int:27,  ytd:0, ni:5,  pct:'16%' },
      { sno:'8',  gc:'G4',    gn:'G5',   total:19,  int:17,  ytd:0, ni:2,  pct:'11%' },
      { sno:'9',  gc:'G5',    gn:'G6',   total:33,  int:28,  ytd:0, ni:5,  pct:'15%' },
      { sno:'10', gc:'G6',    gn:'G7',   total:30,  int:25,  ytd:0, ni:5,  pct:'17%' },
      { sno:'11', gc:'G7',    gn:'G8',   total:36,  int:32,  ytd:0, ni:3,  pct:'8%' },
      { sno:'12', gc:'G8',    gn:'G9',   total:33,  int:29,  ytd:0, ni:4,  pct:'12%' },
      { sno:'13', gc:'G9',    gn:'G10',  total:19,  int:19,  ytd:0, ni:0,  pct:'0%' },
      { sno:'',   gc:'Grand Total', gn:'',total:328, int:285, ytd:0, ni:42, pct:'13%', grand:1 },
    ],
  },
  {
    name: 'OIS Marathalli',
    rows: [
      { sno:'1',  gc:'NUR',  gn:'KG1',  total:2,   int:2,   ytd:0, ni:0,  pct:'0%' },
      { sno:'2',  gc:'KG1',  gn:'KG2',  total:12,  int:11,  ytd:0, ni:1,  pct:'8%' },
      { sno:'3',  gc:'KG2',  gn:'G1',   total:8,   int:8,   ytd:0, ni:0,  pct:'0%' },
      { sno:'4',  gc:'G1',   gn:'G2',   total:36,  int:33,  ytd:0, ni:3,  pct:'8%' },
      { sno:'5',  gc:'G2',   gn:'G3',   total:29,  int:21,  ytd:0, ni:8,  pct:'28%' },
      { sno:'6',  gc:'G3',   gn:'G4',   total:27,  int:19,  ytd:0, ni:8,  pct:'30%' },
      { sno:'7',  gc:'G4',   gn:'G5',   total:39,  int:35,  ytd:3, ni:1,  pct:'3%' },
      { sno:'8',  gc:'G5',   gn:'G6',   total:24,  int:21,  ytd:0, ni:3,  pct:'13%' },
      { sno:'9',  gc:'G6',   gn:'G7',   total:27,  int:23,  ytd:0, ni:4,  pct:'15%' },
      { sno:'10', gc:'G7',   gn:'G8',   total:37,  int:26,  ytd:5, ni:6,  pct:'16%' },
      { sno:'11', gc:'G8',   gn:'G9',   total:17,  int:15,  ytd:1, ni:1,  pct:'6%' },
      { sno:'12', gc:'G9',   gn:'G10',  total:22,  int:22,  ytd:0, ni:0,  pct:'-' },
      { sno:'13', gc:'G10',  gn:'G11',  total:21,  int:0,   ytd:0, ni:21, pct:'100%' },
      { sno:'',   gc:'Grand Total', gn:'',total:301, int:236, ytd:9, ni:56, pct:'19%', grand:1 },
    ],
  },
  {
    name: 'OIS Hesarghatta',
    hesarghatta: true,
    rows: [
      { gc:'K1',      int:17, ni:4,  pct:'19.05%' },
      { gc:'K2',      int:16, ni:3,  pct:'15.79%' },
      { gc:'NUR',     int:7,  ni:1,  pct:'12.50%' },
      { gc:'Grade 1', int:20, ni:3,  pct:'13.04%' },
      { gc:'Grade 2', int:23, ni:8,  pct:'25.81%' },
      { gc:'Grade 3', int:26, ni:3,  pct:'10.34%' },
      { gc:'Grade 4', int:26, ni:4,  pct:'13.33%' },
      { gc:'Grade 5', int:25, ni:5,  pct:'16.67%' },
      { gc:'Grade 6', int:23, ni:2,  pct:'8.00%' },
      { gc:'Grade 7', int:20, ni:2,  pct:'9.09%' },
      { gc:'Grade 8', int:30, ni:2,  pct:'6.25%' },
      { gc:'Grade 9', int:18, ni:3,  pct:'14.29%' },
      { gc:'Total',   int:251,ni:40, pct:'13.75%', grand:1 },
    ],
  },
  {
    name: 'OIS Rayasandara',
    rows: [
      { sno:'1',  gc:'Nur',  gn:'LKG',  total:8,   int:7,   ytd:0, ni:1,  pct:'13%' },
      { sno:'2',  gc:'LKG',  gn:'UKG',  total:20,  int:15,  ytd:0, ni:5,  pct:'25%' },
      { sno:'3',  gc:'UKG',  gn:'G1',   total:35,  int:25,  ytd:3, ni:5,  pct:'14%' },
      { sno:'4',  gc:'G1',   gn:'G2',   total:32,  int:21,  ytd:4, ni:6,  pct:'19%' },
      { sno:'5',  gc:'G2',   gn:'G3',   total:34,  int:30,  ytd:1, ni:3,  pct:'9%' },
      { sno:'6',  gc:'G3',   gn:'G4',   total:32,  int:27,  ytd:0, ni:4,  pct:'13%' },
      { sno:'7',  gc:'G4',   gn:'G5',   total:31,  int:25,  ytd:4, ni:2,  pct:'6%' },
      { sno:'8',  gc:'G5',   gn:'G6',   total:35,  int:29,  ytd:0, ni:6,  pct:'17%' },
      { sno:'9',  gc:'G6',   gn:'G7',   total:22,  int:19,  ytd:0, ni:3,  pct:'14%' },
      { sno:'10', gc:'G7',   gn:'G8',   total:18,  int:16,  ytd:1, ni:1,  pct:'6%' },
      { sno:'11', gc:'G8',   gn:'G9',   total:12,  int:11,  ytd:0, ni:1,  pct:'8%' },
      { sno:'12', gc:'G9',   gn:'G10',  total:0,   int:0,   ytd:0, ni:0,  pct:'-' },
      { sno:'13', gc:'G10',  gn:'G11',  total:4,   int:4,   ytd:0, ni:0,  pct:'0%' },
      { sno:'',   gc:'Grand Total', gn:'',total:279, int:225, ytd:13, ni:37, pct:'13%', grand:1 },
    ],
  },
  {
    name: 'OIS Kumbagodu (Tatva)',
    rows: [
      { sno:'1',  gc:'PreKG', gn:'KG1',  total:19,  int:16,  ytd:0,  ni:3,  pct:'16%' },
      { sno:'2',  gc:'KG1',   gn:'KG2',  total:27,  int:26,  ytd:0,  ni:1,  pct:'4%' },
      { sno:'3',  gc:'KG2',   gn:'G1',   total:14,  int:10,  ytd:2,  ni:2,  pct:'14%' },
      { sno:'4',  gc:'G1',    gn:'G2',   total:44,  int:41,  ytd:0,  ni:3,  pct:'7%' },
      { sno:'5',  gc:'G2',    gn:'G3',   total:53,  int:46,  ytd:0,  ni:7,  pct:'13%' },
      { sno:'6',  gc:'G3',    gn:'G4',   total:64,  int:55,  ytd:4,  ni:4,  pct:'6%' },
      { sno:'7',  gc:'G4',    gn:'G5',   total:49,  int:40,  ytd:5,  ni:5,  pct:'10%' },
      { sno:'8',  gc:'G5',    gn:'G6',   total:53,  int:43,  ytd:6,  ni:4,  pct:'8%' },
      { sno:'9',  gc:'G6',    gn:'G7',   total:56,  int:49,  ytd:2,  ni:5,  pct:'9%' },
      { sno:'10', gc:'G7',    gn:'G8',   total:52,  int:48,  ytd:2,  ni:2,  pct:'4%' },
      { sno:'11', gc:'G8',    gn:'G9',   total:69,  int:68,  ytd:0,  ni:1,  pct:'1%' },
      { sno:'12', gc:'G9',    gn:'G10',  total:63,  int:62,  ytd:0,  ni:0,  pct:'0%' },
      { sno:'13', gc:'G10',   gn:'G11',  total:55,  int:5,   ytd:39, ni:11, pct:'20%' },
      { sno:'',   gc:'Grand Total', gn:'',total:618, int:509, ytd:60, ni:48, pct:'8%', grand:1 },
    ],
  },
  {
    name: 'Dharwad',
    rows: [
      { sno:'1',  gc:'Nur',  gn:'K1',  total:17,  int:8,   ytd:8,  ni:1,  pct:'6%' },
      { sno:'2',  gc:'K1',   gn:'K2',  total:26,  int:11,  ytd:11, ni:4,  pct:'15%' },
      { sno:'3',  gc:'K2',   gn:'G1',  total:27,  int:20,  ytd:5,  ni:2,  pct:'7%' },
      { sno:'4',  gc:'G1',   gn:'G2',  total:42,  int:33,  ytd:8,  ni:1,  pct:'2%' },
      { sno:'5',  gc:'G2',   gn:'G3',  total:27,  int:22,  ytd:2,  ni:3,  pct:'11%' },
      { sno:'6',  gc:'G3',   gn:'G4',  total:26,  int:13,  ytd:12, ni:1,  pct:'4%' },
      { sno:'7',  gc:'G4',   gn:'G5',  total:41,  int:29,  ytd:12, ni:0,  pct:'0%' },
      { sno:'8',  gc:'G5',   gn:'G6',  total:34,  int:22,  ytd:9,  ni:3,  pct:'9%' },
      { sno:'9',  gc:'G6',   gn:'G7',  total:44,  int:27,  ytd:15, ni:2,  pct:'5%' },
      { sno:'10', gc:'G7',   gn:'G8',  total:40,  int:30,  ytd:8,  ni:2,  pct:'5%' },
      { sno:'11', gc:'G8',   gn:'G9',  total:62,  int:47,  ytd:15, ni:0,  pct:'0%' },
      { sno:'12', gc:'G9',   gn:'G10', total:45,  int:39,  ytd:5,  ni:1,  pct:'2%' },
      { sno:'',   gc:'Grand Total', gn:'',total:431,int:301,ytd:110,ni:20, pct:'5%', grand:1 },
    ],
  },
];

db.exec('DELETE FROM retention_detail');

const insert = db.prepare(`
  INSERT INTO retention_detail
    (school_name, sno, grade_current, grade_next, total_strength, app_fees_paid,
     interested, yet_to_decide, not_interested, pct_not_interested, is_grand_total, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const seedAll = db.transaction(() => {
  let order = 0;
  for (const school of schools) {
    for (const r of school.rows) {
      insert.run(
        school.name,
        r.sno ?? '',
        r.gc ?? '',
        r.gn ?? '',
        r.total ?? null,
        r.app ?? null,
        r.int ?? 0,
        r.ytd ?? 0,
        r.ni ?? 0,
        r.pct ?? '',
        r.grand ? 1 : 0,
        order++
      );
    }
  }
});

seedAll();
console.log('Retention detail seeded for', schools.length, 'schools.');
