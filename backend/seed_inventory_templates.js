/**
 * Seeds inventory_templates from all subsheets of the Tattva Inventory spreadsheet.
 * New sheet format: Lab Category, Product Name, Specification, Standard Qty, Unit Price, Gst, Total With Gst, Amt
 */
const db = require('./database');
const https = require('https');

const SHEET_ID = '1zKCceqzQCStY2uvYHZFgTUKHp9BwtN0OS1aG7XhN8Uw';

const SHEETS = [
  { gid: '57733823',   category: 'All Inventory' },
  { gid: '1699272706', category: 'Library' },
  { gid: '1133528725', category: 'Diy Lab' },
  { gid: '1625129457', category: 'Computer Lab' },
  { gid: '1290017248', category: 'Music' },
  { gid: '708307770',  category: 'Composite Lab' },
  { gid: '145800246',  category: 'Maths Lab' },
  { gid: '306459983',  category: 'Prem Phy Lab' },
  { gid: '1691814799', category: 'Prem Chem Lab' },
  { gid: '301451520',  category: 'Prem Bio Lab' },
  { gid: '1164396049', category: 'Day Care Set' },
  { gid: '1114600246', category: 'Robotics' },
  { gid: '870271458',  category: 'Coding Lab' },
  { gid: '2143280004', category: 'Astronomy Lab' },
  { gid: '621795807',  category: 'Dance' },
  { gid: '1482706841', category: 'Theater' },
  { gid: '227699711',  category: 'Art Lab Dry' },
  { gid: '392002030',  category: 'Art Lab Wet' },
  { gid: '1569173837', category: 'Staff Room' },
  { gid: '2122400491', category: 'Infirmary Room' },
];

function fetchCSV(sheetId, gid) {
  return new Promise((resolve, reject) => {
    const follow = (u) => {
      https.get(u, (res) => {
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
  }).filter(r => r.some(f => f));
}

// Standard format: Lab Category, Product Name, Specification, Standard Qty, Unit Price, Gst, Total With Gst, Amt
function parseRows(rows, category) {
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(f => !f)) continue;
    const name = (r[1] || '').trim();
    if (!name || name === 'Product Name' || name === 'COMMON INFRA ITEMS') continue;
    // Skip header-like rows
    if (name.toLowerCase() === 'product name') continue;
    items.push({
      category,
      product_name: name,
      specification: (r[2] || '').trim(),
      standard_qty: (r[3] || '').trim(),
      unit_price: (r[4] || '').trim(),
      drive_link: '',
      sort_order: i,
    });
  }
  return items;
}

const insertTemplate = db.prepare(`
  INSERT OR IGNORE INTO inventory_templates (category, product_name, specification, standard_qty, unit_price, drive_link, sort_order)
  VALUES (@category, @product_name, @specification, @standard_qty, @unit_price, @drive_link, @sort_order)
`);
const clearTemplates = db.prepare(`DELETE FROM inventory_templates WHERE category = ?`);

async function seed() {
  let total = 0;
  for (const sheet of SHEETS) {
    try {
      console.log(`Fetching ${sheet.category} (gid=${sheet.gid})...`);
      const csv = await fetchCSV(SHEET_ID, sheet.gid);
      if (csv.includes('DOCTYPE')) { console.warn('  ⚠ Not accessible (got HTML)'); continue; }
      const rows = parseCSV(csv);
      if (rows.length < 2) { console.warn('  ⚠ No data rows'); continue; }
      console.log(`  Header: ${rows[0].slice(0, 5).join(' | ')}`);
      const items = parseRows(rows, sheet.category);
      db.transaction(() => {
        clearTemplates.run(sheet.category);
        items.forEach(i => insertTemplate.run(i));
      })();
      console.log(`  ✓ ${items.length} templates`);
      total += items.length;
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
    }
  }
  console.log(`\nDone! ${total} inventory templates seeded.`);
}

seed();
