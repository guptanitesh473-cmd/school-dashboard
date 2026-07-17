const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'school_dashboard.db');
const seedPath = path.join(__dirname, 'seed.db');

// If no database exists yet, copy the pre-built seed database
if (!fs.existsSync(dbPath) && fs.existsSync(seedPath)) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.copyFileSync(seedPath, dbPath);
  console.log('Database initialized from seed.db');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Ensure all tables exist (safe for both fresh and existing DBs)
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS offerings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(category_id, name)
  );

  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    location TEXT,
    city TEXT,
    state TEXT,
    acquired_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS school_offerings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    offering_id INTEGER NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'No' CHECK(status IN ('Yes', 'No', 'In Future')),
    condition_notes TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(school_id, offering_id)
  );

  CREATE TABLE IF NOT EXISTS retention_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT NOT NULL,
    sno TEXT DEFAULT '',
    grade_current TEXT DEFAULT '',
    grade_next TEXT DEFAULT '',
    total_strength INTEGER DEFAULT 0,
    app_fees_paid INTEGER,
    interested INTEGER DEFAULT 0,
    yet_to_decide INTEGER DEFAULT 0,
    not_interested INTEGER DEFAULT 0,
    pct_not_interested TEXT DEFAULT '',
    is_grand_total INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS retention_report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT NOT NULL,
    state TEXT DEFAULT '',
    location TEXT DEFAULT '',
    owner TEXT DEFAULT '',
    calling_status TEXT DEFAULT '',
    bla_status TEXT DEFAULT '',
    exam_start_date TEXT DEFAULT '',
    exam_end_date TEXT DEFAULT '',
    tentative_bla_date TEXT DEFAULT '',
    retention_data_link TEXT DEFAULT '',
    bla_scorecard_link TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    product_name TEXT DEFAULT '',
    specification TEXT DEFAULT '',
    standard_qty TEXT DEFAULT '',
    available_count TEXT DEFAULT '',
    condition TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    size TEXT DEFAULT '',
    unit_price TEXT DEFAULT '',
    drive_link TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inventory_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL DEFAULT '',
    specification TEXT DEFAULT '',
    standard_qty TEXT DEFAULT '',
    unit_price TEXT DEFAULT '',
    drive_link TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS school_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES inventory_templates(id) ON DELETE CASCADE,
    available_count TEXT DEFAULT '',
    condition_notes TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(school_id, template_id)
  );

  CREATE TABLE IF NOT EXISTS project_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT NOT NULL,
    admission_status TEXT NOT NULL,
    total_students INTEGER DEFAULT 0,
    toddler INTEGER DEFAULT 0,
    nursery INTEGER DEFAULT 0,
    lkg INTEGER DEFAULT 0,
    ukg INTEGER DEFAULT 0,
    g1 INTEGER DEFAULT 0,
    g2 INTEGER DEFAULT 0,
    g3 INTEGER DEFAULT 0,
    g4 INTEGER DEFAULT 0,
    g5 INTEGER DEFAULT 0,
    g6 INTEGER DEFAULT 0,
    g7 INTEGER DEFAULT 0,
    g8 INTEGER DEFAULT 0,
    g9 INTEGER DEFAULT 0,
    g10 INTEGER DEFAULT 0,
    g11 INTEGER DEFAULT 0,
    g12 INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(school_name, admission_status)
  );

  CREATE TABLE IF NOT EXISTS mau_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    total_students INTEGER DEFAULT 0,
    app_login INTEGER DEFAULT 0,
    used_last_week INTEGER DEFAULT 0,
    used_last_month INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(school_name, grade)
  );

  CREATE TABLE IF NOT EXISTS monthly_meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    school_name TEXT NOT NULL,
    target TEXT DEFAULT '',
    outcome TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    school_name TEXT NOT NULL,
    dept_planned TEXT DEFAULT '',
    agenda_planned TEXT DEFAULT '',
    timeline TEXT DEFAULT '',
    designation_planned TEXT DEFAULT '',
    auditor_name TEXT DEFAULT '',
    erp TEXT DEFAULT '',
    designation_executed TEXT DEFAULT '',
    dept_executed TEXT DEFAULT '',
    date_of_auditing TEXT DEFAULT '',
    agenda_executed TEXT DEFAULT '',
    audit_report TEXT DEFAULT '',
    issues_tagged TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT DEFAULT '',
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS erp_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin', 'employee')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    subject TEXT DEFAULT '',
    grade TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Ensure default admin user exists
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  db.prepare(`INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)`)
    .run('OnlyNitesh', 'OnlyNitesh', 'Administrator', 'admin');
  console.log('Default user created: OnlyNitesh / OnlyNitesh');
}

// Ensure default BLA Dashboard (ERP) admin exists
const erpAdminCount = db.prepare("SELECT COUNT(*) as c FROM erp_users WHERE role = 'admin'").get().c;
if (erpAdminCount === 0) {
  db.prepare(`INSERT INTO erp_users (name, email, password, role, status) VALUES (?, ?, ?, 'admin', 'approved')`)
    .run('Administrator', 'admin@banyanacademy.edu', 'Banyan@Admin2026');
  console.log('Default BLA Dashboard admin created: admin@banyanacademy.edu / Banyan@Admin2026');
}

// Migrations — safe to run multiple times
const migrations = [
  `ALTER TABLE retention_detail ADD COLUMN prev_total_strength INTEGER DEFAULT NULL`,
  `ALTER TABLE retention_detail ADD COLUMN prev_tc_requested INTEGER DEFAULT NULL`,
  `ALTER TABLE retention_detail ADD COLUMN prev_tc_pct TEXT DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN school_name TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN principal_name TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN zbh_name TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN academic_start_month TEXT DEFAULT 'June'`,
  `ALTER TABLE schools ADD COLUMN school_type TEXT DEFAULT 'existing'`,
  `ALTER TABLE schools ADD COLUMN spoc_teacher_training TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN spoc_clicker TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN cod1 TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN cod2 TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN principal_erp TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN principal_email TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN principal_mobile TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN zbh_mobile TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN spoc_training_erp TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN spoc_training_mobile TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN cod1_erp TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN cod1_mobile TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN cod2_erp TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN cod2_mobile TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN spoc_clicker_erp TEXT DEFAULT ''`,
  `ALTER TABLE schools ADD COLUMN spoc_clicker_mobile TEXT DEFAULT ''`,
  `ALTER TABLE monthly_meetings ADD COLUMN discussion_points TEXT DEFAULT ''`,
  `ALTER TABLE monthly_meetings ADD COLUMN tagged_department TEXT DEFAULT ''`,
  `ALTER TABLE monthly_meetings ADD COLUMN responsible_person TEXT DEFAULT ''`,
  `ALTER TABLE monthly_meetings ADD COLUMN progress_update TEXT DEFAULT ''`,
];
for (const sql of migrations) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

// Set school_type for New Building schools
db.prepare(`UPDATE schools SET school_type='new_building' WHERE name LIKE '%-New building%' AND school_type != 'new_building'`).run();

// Set April academic start for known schools
const aprilNames = ['OIS Thirumudivakkam', 'OIS Kumbalgodu', 'OIS Dindigul', 'OIS Oragadam'];
for (const name of aprilNames) {
  db.prepare(`UPDATE schools SET academic_start_month='April' WHERE name LIKE ?`).run(`${name}%`);
}

module.exports = db;
