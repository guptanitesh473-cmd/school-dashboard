const db = require('./database');

const retentionData = [
  {
    school_name: 'Colour (Kelambakkam)', state: 'Tamil Nadu', location: 'Kelambakkam',
    owner: 'Sharada', calling_status: 'Completed', bla_status: 'Scheduled',
    exam_start_date: '2026-02-16', exam_end_date: '2026-02-20', tentative_bla_date: '2026-04-03',
    retention_data_link: 'Color CIS Students List', bla_scorecard_link: '',
    notes: "No teachers are present and all the non-teaching staffs are calling, they have so far connected with 190+ parents and recieved a confirmation. The calling will be done by 7th Feb",
  },
  {
    school_name: 'Oragadam (TIPS)', state: 'Tamil Nadu', location: 'Oragadam',
    owner: 'Nanda Kumar', calling_status: 'Completed', bla_status: 'Marks Received',
    exam_start_date: '2026-03-18', exam_end_date: '2026-03-27', tentative_bla_date: '2026-03-13',
    retention_data_link: 'ORG Interested Students Details', bla_scorecard_link: "OIS-BLA-MAR' 2026",
    notes: '',
  },
  {
    school_name: 'Dindigul Campus (TIPS)', state: 'Tamil Nadu', location: 'Dindigul',
    owner: 'Lakshmi', calling_status: 'Completed', bla_status: 'Marks Received',
    exam_start_date: '2026-03-16', exam_end_date: '2026-03-26', tentative_bla_date: '2026-03-13',
    retention_data_link: 'Student admission status 2026-27', bla_scorecard_link: 'TIPS DINDIGUL_BLA_Scorecard',
    notes: '',
  },
  {
    school_name: 'Vijayshree Hessarghatta', state: 'Karnataka', location: 'Bangalore',
    owner: 'Latha', calling_status: 'Completed', bla_status: 'Scheduled',
    exam_start_date: '2026-03-09', exam_end_date: '2026-03-28', tentative_bla_date: '2026-03-28',
    retention_data_link: 'TC DATA', bla_scorecard_link: '',
    notes: '',
  },
  {
    school_name: 'Dharwad', state: 'Karnataka', location: 'Dharwad',
    owner: 'Ashwani', calling_status: 'Completed', bla_status: 'Scheduled',
    exam_start_date: '2026-03-05', exam_end_date: '2026-03-18', tentative_bla_date: '2026-03-16',
    retention_data_link: 'Retention sheet-OIS Dharwad', bla_scorecard_link: '',
    notes: '',
  },
  {
    school_name: 'VELS Arkere', state: 'Karnataka', location: 'Bangalore',
    owner: 'Deepa', calling_status: 'Completed', bla_status: 'Marks Received',
    exam_start_date: '2026-03-04', exam_end_date: '2026-03-18', tentative_bla_date: '2026-03-18',
    retention_data_link: 'VELLS ARAKERE Student data', bla_scorecard_link: 'VELS GLOBAL SCHOOL ARAKERE',
    notes: 'BLA date is pending',
  },
  {
    school_name: 'Siddhanta', state: 'Karnataka', location: 'Bangalore',
    owner: 'Deepika', calling_status: 'Completed', bla_status: 'Marks Received',
    exam_start_date: '2026-03-09', exam_end_date: '2026-03-25', tentative_bla_date: '2026-03-16',
    retention_data_link: 'TC Details + Retention.xlsx', bla_scorecard_link: 'BLA Marksheet-OIS_Rayasandra.xlsx',
    notes: '',
  },
  {
    school_name: 'VELS Marathalli', state: 'Karnataka', location: 'Bangalore',
    owner: 'Vineetha', calling_status: 'Completed', bla_status: 'Marks Received',
    exam_start_date: '2026-03-06', exam_end_date: '2026-03-18', tentative_bla_date: '2026-03-04',
    retention_data_link: 'VELS Marathalli', bla_scorecard_link: 'ORCHID MARATHAHALLI _BLA_SCORECARD',
    notes: 'Have shared BLA QPs',
  },
  {
    school_name: 'VELS HSR', state: 'Karnataka', location: 'Bangalore',
    owner: 'HSR Principal', calling_status: 'Completed', bla_status: 'Marks Received',
    exam_start_date: '2026-03-06', exam_end_date: '2026-03-18', tentative_bla_date: '2026-03-04',
    retention_data_link: 'VELLS HSR Student Data', bla_scorecard_link: 'HSR Consolidated BLA Marksheet.xlsx',
    notes: 'Have shared BLA QPs',
  },
  {
    school_name: 'ST. Theresa', state: 'Karnataka', location: 'Bangalore',
    owner: 'Soumya', calling_status: 'Completed', bla_status: '',
    exam_start_date: '2026-03-05', exam_end_date: '2026-03-30', tentative_bla_date: '2026-06-08',
    retention_data_link: 'STS STUDENTS SHEET', bla_scorecard_link: '',
    notes: "They are having workshop, couldn't speak with the principal",
  },
  {
    school_name: 'Tatva', state: '', location: 'Bangalore',
    owner: 'Savitha', calling_status: 'Completed', bla_status: 'Scheduled',
    exam_start_date: '2026-03-11', exam_end_date: '2026-03-25', tentative_bla_date: '2026-04-08',
    retention_data_link: 'Tatva Student data', bla_scorecard_link: '',
    notes: '',
  },
];

const progressData = [
  { school_name: 'Oragadam', admission_status: 'Interested', total_students: 332 },
  { school_name: 'Oragadam', admission_status: 'Not Interested', total_students: 27 },
  { school_name: 'Oragadam', admission_status: 'Yet to Decide', total_students: 14 },
  { school_name: 'Kelambakkam', admission_status: 'Total Strength (excl. Dropout)', total_students: 225 },
  { school_name: 'Kelambakkam', admission_status: 'Application Fee Paid', total_students: 77 },
  { school_name: 'Kelambakkam', admission_status: 'Interested', total_students: 43 },
  { school_name: 'Kelambakkam', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'Kelambakkam', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'Siddhanta', admission_status: 'Interested', total_students: 0 },
  { school_name: 'Siddhanta', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'Siddhanta', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'Dindugal', admission_status: 'Interested', total_students: 0 },
  { school_name: 'Dindugal', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'Dindugal', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'Hessarghatta', admission_status: 'Interested', total_students: 0 },
  { school_name: 'Hessarghatta', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'Hessarghatta', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'VELS Marathalli', admission_status: 'Interested', total_students: 0 },
  { school_name: 'VELS Marathalli', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'VELS Marathalli', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'VELS HSR', admission_status: 'Interested', total_students: 0 },
  { school_name: 'VELS HSR', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'VELS HSR', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'VELS Arkere', admission_status: 'Interested', total_students: 0 },
  { school_name: 'VELS Arkere', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'VELS Arkere', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'St. Theresa', admission_status: 'Interested', total_students: 0 },
  { school_name: 'St. Theresa', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'St. Theresa', admission_status: 'Yet to Decide', total_students: 0 },
  { school_name: 'Dharwad', admission_status: 'Interested', total_students: 0 },
  { school_name: 'Dharwad', admission_status: 'Not Interested', total_students: 0 },
  { school_name: 'Dharwad', admission_status: 'Yet to Decide', total_students: 0 },
];

const insertRetention = db.prepare(`
  INSERT OR REPLACE INTO retention_report
  (school_name, state, location, owner, calling_status, bla_status, exam_start_date, exam_end_date, tentative_bla_date, retention_data_link, bla_scorecard_link, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertProgress = db.prepare(`
  INSERT OR REPLACE INTO project_progress (school_name, admission_status, total_students)
  VALUES (?, ?, ?)
`);

const seedAll = db.transaction(() => {
  for (const r of retentionData) {
    insertRetention.run(r.school_name, r.state, r.location, r.owner, r.calling_status,
      r.bla_status, r.exam_start_date, r.exam_end_date, r.tentative_bla_date,
      r.retention_data_link, r.bla_scorecard_link, r.notes);
  }
  for (const p of progressData) {
    insertProgress.run(p.school_name, p.admission_status, p.total_students);
  }
});

seedAll();
console.log(`Seeded ${retentionData.length} retention records and ${progressData.length} progress records.`);
