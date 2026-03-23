const db = require('./database');
const https = require('https');

const SHEET_ID_OLD = '171xZFIcZbScaXmhjLXzbtng2BHJ4XgQRC6UMS8sACG8';
const SHEET_ID_NEW = '1zKCceqzQCStY2uvYHZFgTUKHp9BwtN0OS1aG7XhN8Uw';

// Sheets from old spreadsheet → mapped to new category names
const OLD_SHEETS = [
  { category: 'Computer Lab', gid: '1118012567', type: 'lab' },
  { category: 'Library',      gid: '912249285',  type: 'lab' },
  { category: 'Maths Lab',    gid: '1878089615', type: 'lab' },
  { category: 'Composite Lab',gid: '619383549',  type: 'lab_alt' },
];

// New spreadsheet: All Inventory (furniture per room)
const NEW_SHEETS = [
  { category: 'All Inventory', gid: '57733823', type: 'furniture' },
];

function fetchCSV(sheetId, gid) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const follow = (u) => {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          return follow(res.headers.location);
        }
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks).toString()));
        res.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

function parseCSV(text) {
  return text.split('\n').map(line => {
    const fields = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    fields.push(cur.trim());
    return fields;
  }).filter(r => r.some(f => f));
}

function parseRows(rows, type, category) {
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(f => !f)) continue;

    if (type === 'lab') {
      // Lab Category, Product Name, Spec-1, Spec-2, Std Qty, Available, Condition, Drive Link, Unit Price, Required
      const productName = r[1] || '';
      if (!productName || productName === 'Product Name') continue;
      const spec = [r[2], r[3]].filter(Boolean).join('; ');
      items.push({
        category, product_name: productName,
        specification: spec, standard_qty: r[4] || '',
        available_count: r[5] || '', condition: r[6] || '',
        brand: '', size: '', unit_price: r[8] || r[7] || '',
        drive_link: (r[7] || '').includes('drive') ? r[7] : '',
        notes: r[9] || '', sort_order: i,
      });
    } else if (type === 'lab_alt') {
      // Lab Category, Product Name, Available count, Condition, Spec, Std Qty, Drive Link, Unit Price, Required
      const productName = r[1] || '';
      if (!productName || productName === 'Product Name') continue;
      items.push({
        category, product_name: productName,
        specification: r[4] || '', standard_qty: r[5] || '',
        available_count: r[2] || '', condition: r[3] || '',
        brand: '', size: '', unit_price: r[7] || '',
        drive_link: (r[6] || '').includes('drive') ? r[6] : '',
        notes: r[8] || '', sort_order: i,
      });
    } else if (type === 'furniture') {
      // Row 0: row headers, Row 1: Category, COMMON INFRA ITEMS, room cols..., Total, Excess, Damaged
      // Skip first 2 rows (handled outside)
      const catName = r[0] || '';
      const itemName = r[1] || '';
      if (!itemName || itemName === 'COMMON INFRA ITEMS') continue;
      // Total is 3rd from last non-empty header
      const total = r[r.length - 4] || r[r.length - 3] || '';
      const excess = r[r.length - 3] || '';
      const damaged = r[r.length - 2] || '';
      items.push({
        category,
        product_name: itemName,
        specification: catName,
        standard_qty: '',
        available_count: total,
        condition: damaged ? `Damaged: ${damaged}` : (excess ? `Excess: ${excess}` : ''),
        brand: '', size: '', unit_price: '',
        drive_link: '',
        notes: excess ? `Excess: ${excess}` : '',
        sort_order: i,
      });
    }
  }
  return items;
}

const insert = db.prepare(`
  INSERT INTO inventory (category, product_name, specification, standard_qty, available_count, condition, brand, size, unit_price, drive_link, notes, sort_order)
  VALUES (@category, @product_name, @specification, @standard_qty, @available_count, @condition, @brand, @size, @unit_price, @drive_link, @notes, @sort_order)
`);
const clearCategory = db.prepare(`DELETE FROM inventory WHERE category = ?`);

async function seedInventory() {
  let total = 0;

  for (const sheet of OLD_SHEETS) {
    try {
      console.log(`Fetching ${sheet.category} (old sheet)...`);
      const csv = await fetchCSV(SHEET_ID_OLD, sheet.gid);
      if (csv.includes('DOCTYPE')) { console.warn('  ⚠ Not accessible'); continue; }
      const rows = parseCSV(csv);
      const items = parseRows(rows, sheet.type, sheet.category);
      db.transaction(() => { clearCategory.run(sheet.category); items.forEach(i => insert.run(i)); })();
      console.log(`  ✓ ${items.length} items`);
      total += items.length;
    } catch (e) { console.error(`  ✗ ${e.message}`); }
  }

  for (const sheet of NEW_SHEETS) {
    try {
      console.log(`Fetching ${sheet.category} (new sheet)...`);
      const csv = await fetchCSV(SHEET_ID_NEW, sheet.gid);
      if (csv.includes('DOCTYPE')) { console.warn('  ⚠ Not accessible'); continue; }
      const rawRows = parseCSV(csv);
      // First 2 rows are headers in furniture sheet
      const items = parseRows(rawRows.slice(2), sheet.type, sheet.category);
      db.transaction(() => { clearCategory.run(sheet.category); items.forEach(i => insert.run(i)); })();
      console.log(`  ✓ ${items.length} items`);
      total += items.length;
    } catch (e) { console.error(`  ✗ ${e.message}`); }
  }

  console.log(`\nDone! ${total} inventory items.`);
}

seedInventory();
