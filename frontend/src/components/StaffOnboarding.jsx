import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

// ── Sheet URLs ────────────────────────────────────────────────────────────
const SHEET_ID = '1RCauqoUxZfYpCtG08JHEVc5nMGOHrkUUIHMDvsiFF4Q';
const ONBOARDING_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Onboarding`;
const T1ON1_URL      = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Teachers%201on1`;

// ── Styling constants ─────────────────────────────────────────────────────
const DEPT_COLORS = {
  Teachers: 'bg-blue-100 text-blue-800',
  Principals: 'bg-purple-100 text-purple-800',
  'Support Staff': 'bg-teal-100 text-teal-800',
  Admin: 'bg-orange-100 text-orange-800',
  'Sales and Marketing': 'bg-pink-100 text-pink-800',
  Drivers: 'bg-gray-100 text-gray-700',
};

const ONBOARDING_COLS = [
  { key: 'teachers',      label: 'Teachers',      color: 'text-blue-700' },
  { key: 'principals',    label: 'Principals',    color: 'text-purple-700' },
  { key: 'supportStaff',  label: 'Support Staff', color: 'text-teal-700' },
  { key: 'admin',         label: 'Admin',         color: 'text-orange-700' },
  { key: 'salesMarketing',label: 'Sales & Mktg',  color: 'text-pink-700' },
  { key: 'drivers',       label: 'Drivers',       color: 'text-gray-600' },
];

const DEPT_KEY_TO_LABEL = {
  teachers: 'Teachers', principals: 'Principals', supportStaff: 'Support Staff',
  admin: 'Admin', salesMarketing: 'Sales and Marketing', drivers: 'Drivers',
};

// ── CSV parser ────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { field += '"'; i++; } else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      row.push(field.trim()); field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQ) {
      row.push(field.trim()); rows.push(row); row = []; field = '';
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else { field += ch; }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows.filter(r => r.some(Boolean));
}

// ── Sheet parsers ─────────────────────────────────────────────────────────
function parseOnboarding(rows) {
  const data = [];
  let totals = { teachers: 0, principals: 0, supportStaff: 0, admin: 0, salesMarketing: 0, drivers: 0, total: 0 };
  for (let r = 1; r < rows.length; r++) {
    const [branch, teachers, principals, supportStaff, admin, salesMarketing, drivers, total] = rows[r];
    if (!branch) continue;
    const row = {
      branch, teachers: +teachers || 0, principals: +principals || 0,
      supportStaff: +supportStaff || 0, admin: +admin || 0,
      salesMarketing: +salesMarketing || 0, drivers: +drivers || 0, total: +total || 0,
    };
    if (branch === 'Grand Total') {
      totals = { teachers: row.teachers, principals: row.principals, supportStaff: row.supportStaff,
        admin: row.admin, salesMarketing: row.salesMarketing, drivers: row.drivers, total: row.total };
    } else {
      data.push(row);
    }
  }
  // Derive branch-dept format from flat onboarding rows
  const branchDept = data
    .map(row => ({
      branch: row.branch,
      depts: Object.keys(DEPT_KEY_TO_LABEL)
        .filter(k => row[k] > 0)
        .map(k => ({ dept: DEPT_KEY_TO_LABEL[k], count: row[k] })),
      total: row.total,
    }))
    .filter(b => b.depts.length > 0);
  return { onboarding: data, totals, branchDept };
}

function parseTeachers1on1(rows) {
  const data = [];
  let totals = { total: 0, done: 0, recommended: 0 };
  for (let r = 1; r < rows.length; r++) {
    const [school, total, done, recommended] = rows[r];
    if (!school) continue;
    if (school === 'Grand Total') {
      totals = { total: +total || 0, done: +done || 0, recommended: +recommended || 0 };
    } else {
      data.push({ school, total: +total || 0, done: +done || 0, recommended: +recommended || 0 });
    }
  }
  return { data, totals };
}

// ── Sub-components ────────────────────────────────────────────────────────
function BranchDeptTab({ branchDept, grandTotal }) {
  return (
    <div className="space-y-3">
      <div className="bg-indigo-600 text-white rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium opacity-80">Total Staff Strength</div>
          <div className="text-3xl font-bold">{grandTotal}</div>
        </div>
        <div className="text-right text-sm opacity-80">{branchDept.length} Branches</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-56">Branch Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Department</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 w-20">Count</th>
            </tr>
          </thead>
          <tbody>
            {branchDept.map(({ branch, depts, total }) => [
              ...depts.map(({ dept, count }, i) => (
                <tr key={`${branch}-${dept}`} className="border-b border-gray-100 hover:bg-gray-50">
                  {i === 0 && (
                    <td rowSpan={depts.length + 1} className="px-4 py-2 font-medium text-gray-800 align-top border-r border-gray-100 leading-snug">
                      {branch}
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEPT_COLORS[dept] || 'bg-gray-100 text-gray-700'}`}>{dept}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-gray-700">{count}</td>
                </tr>
              )),
              <tr key={`${branch}-total`} className="bg-gray-50 border-b border-gray-300">
                <td className="px-4 py-2 text-xs font-semibold text-gray-500 italic">Total</td>
                <td className="px-4 py-2 text-right font-bold text-gray-800">{total}</td>
              </tr>,
            ])}
            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-4 py-3 font-bold text-indigo-800">Grand Total</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right font-bold text-indigo-800 text-base">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OnboardingTab({ onboarding, totals }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-indigo-600 text-white rounded-xl px-4 py-3 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{totals.total}</div>
          <div className="text-xs opacity-80 mt-0.5">Total Staff</div>
        </div>
        {ONBOARDING_COLS.map(({ key, label }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex flex-col items-center">
            <div className="text-xl font-bold text-gray-800">{totals[key]}</div>
            <div className="text-[10px] text-gray-400 text-center mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[200px]">Branch Name</th>
              {ONBOARDING_COLS.map(({ key, label }) => (
                <th key={key} className="text-right px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">{label}</th>
              ))}
              <th className="text-right px-4 py-3 font-semibold text-gray-800">Total</th>
            </tr>
          </thead>
          <tbody>
            {onboarding.map(row => (
              <tr key={row.branch} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-800">{row.branch}</td>
                {ONBOARDING_COLS.map(({ key, color }) => (
                  <td key={key} className={`px-3 py-2.5 text-right ${color} font-medium`}>
                    {row[key] === 0 ? <span className="text-gray-300">—</span> : row[key]}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-bold text-gray-800">{row.total}</td>
              </tr>
            ))}
            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-4 py-3 font-bold text-indigo-800">Grand Total</td>
              {ONBOARDING_COLS.map(({ key }) => (
                <td key={key} className="px-3 py-3 text-right font-bold text-indigo-700">{totals[key]}</td>
              ))}
              <td className="px-4 py-3 text-right font-bold text-indigo-800 text-base">{totals.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Teachers1on1Tab({ t1on1, totals }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Teachers', val: totals.total, cls: 'bg-indigo-600 text-white' },
          { label: '1on1 Done',      val: totals.done,  cls: 'bg-green-50 border border-green-200 text-green-800' },
          { label: 'Recommended',    val: totals.recommended, cls: 'bg-blue-50 border border-blue-200 text-blue-800' },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`rounded-xl px-4 py-3 flex flex-col items-center ${cls}`}>
            <div className="text-2xl font-bold">{val}</div>
            <div className="text-xs opacity-80 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">School Name</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Total</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Done</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Recommended</th>
              <th className="px-4 py-3 font-semibold text-gray-700 w-40">Progress</th>
            </tr>
          </thead>
          <tbody>
            {t1on1.map(({ school, total, done, recommended }) => {
              const donePct = total > 0 ? Math.round((done / total) * 100) : 0;
              const recPct  = total > 0 ? Math.round((recommended / total) * 100) : 0;
              return (
                <tr key={school} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{school}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{total}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-green-700">{done}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-blue-700">{recommended}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${donePct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-9 text-right">{donePct}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${recPct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-9 text-right">{recPct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-4 py-3 font-bold text-indigo-800">Grand Total</td>
              <td className="px-4 py-3 text-right font-bold text-indigo-800">{totals.total}</td>
              <td className="px-4 py-3 text-right font-bold text-green-700">{totals.done}</td>
              <td className="px-4 py-3 text-right font-bold text-blue-700">{totals.recommended}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.round((totals.done / totals.total) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-9 text-right">
                    {Math.round((totals.done / totals.total) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-green-500 inline-block" /> Done</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-blue-400 inline-block" /> Recommended</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
const TABS = [
  { key: 'branch',       label: 'Branch-Dept Count' },
  { key: 'onboarding',   label: 'Onboarding' },
  { key: 'teachers1on1', label: 'Teachers 1on1' },
];

export default function StaffOnboarding() {
  const [tab, setTab]           = useState('branch');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const load = () => {
    setLoading(true); setError('');
    Promise.all([
      fetch(ONBOARDING_URL).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }),
      fetch(T1ON1_URL).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }),
    ])
      .then(([onbText, t1on1Text]) => {
        const { onboarding, totals, branchDept } = parseOnboarding(parseCSV(onbText));
        const { data: t1on1, totals: t1on1Totals } = parseTeachers1on1(parseCSV(t1on1Text));
        setSheetData({ branchDept, onboarding, totals, t1on1, t1on1Totals });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
    </div>
  );
  if (error) return (
    <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm">
      Failed to load: {error}
      <button onClick={load} className="ml-3 underline">Retry</button>
    </div>
  );
  if (!sheetData) return null;

  const { branchDept, onboarding, totals, t1on1, t1on1Totals } = sheetData;

  return (
    <div>
      <div className="flex gap-2 mb-5 border-b border-gray-200 items-center">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
        <button onClick={load} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-1">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      {tab === 'branch'       && <BranchDeptTab branchDept={branchDept} grandTotal={totals.total} />}
      {tab === 'onboarding'   && <OnboardingTab onboarding={onboarding} totals={totals} />}
      {tab === 'teachers1on1' && <Teachers1on1Tab t1on1={t1on1} totals={t1on1Totals} />}
    </div>
  );
}
