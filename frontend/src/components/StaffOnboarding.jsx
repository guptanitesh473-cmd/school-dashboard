import { useState } from 'react';

// ── Branch-Dept Count data ────────────────────────────────────────────────
const DEPT_COLORS = {
  Teachers: 'bg-blue-100 text-blue-800',
  Principals: 'bg-purple-100 text-purple-800',
  'Support Staff': 'bg-teal-100 text-teal-800',
  Admin: 'bg-orange-100 text-orange-800',
  'Sales and Marketing': 'bg-pink-100 text-pink-800',
  Drivers: 'bg-gray-100 text-gray-700',
};

const BRANCH_DEPT = [
  { branch: 'OIS Kumbalagodu, Bangalore', depts: [{ dept: 'Teachers', count: 33 }, { dept: 'Principals', count: 1 }, { dept: 'Admin', count: 7 }, { dept: 'Sales and Marketing', count: 3 }, { dept: 'Drivers', count: 8 }], total: 52 },
  { branch: 'OIS Thirumudivakkam', depts: [{ dept: 'Teachers', count: 34 }, { dept: 'Support Staff', count: 18 }, { dept: 'Admin', count: 4 }, { dept: 'Drivers', count: 5 }], total: 61 },
  { branch: 'OIS DINDIGUL', depts: [{ dept: 'Teachers', count: 25 }, { dept: 'Support Staff', count: 23 }, { dept: 'Drivers', count: 9 }], total: 57 },
  { branch: 'OIS Rayasandra', depts: [{ dept: 'Teachers', count: 21 }, { dept: 'Principals', count: 1 }, { dept: 'Support Staff', count: 12 }, { dept: 'Admin', count: 6 }, { dept: 'Sales and Marketing', count: 1 }, { dept: 'Drivers', count: 5 }], total: 46 },
  { branch: 'OIS HSR', depts: [{ dept: 'Teachers', count: 25 }, { dept: 'Principals', count: 1 }, { dept: 'Support Staff', count: 9 }, { dept: 'Admin', count: 2 }, { dept: 'Drivers', count: 7 }], total: 44 },
  { branch: 'OIS Arakere', depts: [{ dept: 'Teachers', count: 19 }, { dept: 'Principals', count: 1 }, { dept: 'Support Staff', count: 10 }, { dept: 'Admin', count: 7 }, { dept: 'Sales and Marketing', count: 1 }, { dept: 'Drivers', count: 3 }], total: 41 },
  { branch: 'OIS DINDIGUL ANNEX', depts: [{ dept: 'Teachers', count: 8 }, { dept: 'Support Staff', count: 15 }, { dept: 'Admin', count: 1 }, { dept: 'Drivers', count: 9 }], total: 33 },
  { branch: 'OIS ORAGADAM', depts: [{ dept: 'Teachers', count: 7 }, { dept: 'Support Staff', count: 13 }, { dept: 'Admin', count: 1 }, { dept: 'Drivers', count: 6 }], total: 27 },
  { branch: 'OIS MARATHAHALLI', depts: [{ dept: 'Teachers', count: 13 }, { dept: 'Support Staff', count: 7 }, { dept: 'Admin', count: 1 }, { dept: 'Drivers', count: 5 }], total: 26 },
  { branch: 'OIS Dharwad', depts: [{ dept: 'Teachers', count: 8 }, { dept: 'Principals', count: 1 }, { dept: 'Support Staff', count: 7 }, { dept: 'Admin', count: 1 }, { dept: 'Drivers', count: 4 }], total: 21 },
  { branch: 'OIS MAHADEVAPURA', depts: [{ dept: 'Teachers', count: 11 }, { dept: 'Support Staff', count: 5 }, { dept: 'Admin', count: 1 }], total: 17 },
  { branch: 'OIS Kumbalgodu', depts: [{ dept: 'Drivers', count: 8 }], total: 8 },
  { branch: 'OIS Kelambakkam', depts: [{ dept: 'Teachers', count: 6 }], total: 6 },
  { branch: 'OIS Ramamurthy Nagar', depts: [{ dept: 'Teachers', count: 3 }, { dept: 'Support Staff', count: 2 }], total: 5 },
  { branch: 'OIS Vandalur', depts: [{ dept: 'Admin', count: 1 }], total: 1 },
];

// ── Onboarding summary data ───────────────────────────────────────────────
const ONBOARDING_COLS = [
  { key: 'teachers', label: 'Teachers', color: 'text-blue-700' },
  { key: 'principals', label: 'Principals', color: 'text-purple-700' },
  { key: 'supportStaff', label: 'Support Staff', color: 'text-teal-700' },
  { key: 'admin', label: 'Admin', color: 'text-orange-700' },
  { key: 'salesMarketing', label: 'Sales & Mktg', color: 'text-pink-700' },
  { key: 'drivers', label: 'Drivers', color: 'text-gray-600' },
];

const ONBOARDING = [
  { branch: 'OIS Thirumudivakkam', teachers: 34, principals: 0, supportStaff: 18, admin: 4, salesMarketing: 0, drivers: 5, total: 61 },
  { branch: 'OIS DINDIGUL', teachers: 25, principals: 0, supportStaff: 23, admin: 0, salesMarketing: 0, drivers: 9, total: 57 },
  { branch: 'OIS Kumbalagodu, Bangalore', teachers: 33, principals: 1, supportStaff: 0, admin: 7, salesMarketing: 3, drivers: 8, total: 52 },
  { branch: 'OIS Rayasandra', teachers: 21, principals: 1, supportStaff: 12, admin: 6, salesMarketing: 1, drivers: 5, total: 46 },
  { branch: 'OIS HSR', teachers: 25, principals: 1, supportStaff: 9, admin: 2, salesMarketing: 0, drivers: 7, total: 44 },
  { branch: 'OIS Arakere', teachers: 19, principals: 1, supportStaff: 10, admin: 7, salesMarketing: 1, drivers: 3, total: 41 },
  { branch: 'OIS DINDIGUL ANNEX', teachers: 8, principals: 0, supportStaff: 15, admin: 1, salesMarketing: 0, drivers: 9, total: 33 },
  { branch: 'OIS ORAGADAM', teachers: 7, principals: 0, supportStaff: 13, admin: 1, salesMarketing: 0, drivers: 6, total: 27 },
  { branch: 'OIS MARATHAHALLI', teachers: 13, principals: 0, supportStaff: 7, admin: 1, salesMarketing: 0, drivers: 5, total: 26 },
  { branch: 'OIS Dharwad', teachers: 8, principals: 1, supportStaff: 7, admin: 1, salesMarketing: 0, drivers: 4, total: 21 },
  { branch: 'OIS MAHADEVAPURA', teachers: 11, principals: 0, supportStaff: 5, admin: 1, salesMarketing: 0, drivers: 0, total: 17 },
  { branch: 'OIS Kumbalgodu', teachers: 0, principals: 0, supportStaff: 0, admin: 0, salesMarketing: 0, drivers: 8, total: 8 },
  { branch: 'OIS Kelambakkam', teachers: 6, principals: 0, supportStaff: 0, admin: 0, salesMarketing: 0, drivers: 0, total: 6 },
  { branch: 'OIS Ramamurthy Nagar', teachers: 3, principals: 0, supportStaff: 2, admin: 0, salesMarketing: 0, drivers: 0, total: 5 },
  { branch: 'OIS Vandalur', teachers: 0, principals: 0, supportStaff: 0, admin: 1, salesMarketing: 0, drivers: 0, total: 1 },
];
const ONBOARDING_TOTALS = { teachers: 213, principals: 5, supportStaff: 121, admin: 32, salesMarketing: 5, drivers: 69, total: 445 };

// ── Teachers 1on1 data ────────────────────────────────────────────────────
const TEACHERS_1ON1 = [
  { school: 'OIS Arekere',      total: 21, done: 20, recommended: 20 },
  { school: 'OIS DHARWAR',      total: 27, done: 27, recommended: 9  },
  { school: 'OIS DINDIGUL',     total: 48, done: 43, recommended: 33 },
  { school: 'OIS HESSARGHATTA', total: 24, done: 20, recommended: 14 },
  { school: 'OIS HSR',          total: 29, done: 28, recommended: 26 },
  { school: 'OIS JPS',          total: 53, done: 39, recommended: 35 },
  { school: 'OIS KELAMBAKKAM',  total: 21, done: 19, recommended: 12 },
  { school: 'OIS MAHADEVPURA',  total: 16, done: 16, recommended: 14 },
  { school: 'OIS MARATHALLI',   total: 19, done: 19, recommended: 15 },
  { school: 'OIS ORAGADAM',     total: 27, done: 19, recommended: 14 },
  { school: 'OIS Sidhhanta',    total: 28, done: 27, recommended: 25 },
  { school: 'OIS TATVA',        total: 36, done: 31, recommended: 31 },
];
const T1ON1_TOTALS = { total: 349, done: 308, recommended: 248 };

// ── Sub-components ────────────────────────────────────────────────────────
function BranchDeptTab() {
  const grandTotal = 445;
  return (
    <div className="space-y-3">
      <div className="bg-indigo-600 text-white rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium opacity-80">Total Staff Strength</div>
          <div className="text-3xl font-bold">{grandTotal}</div>
        </div>
        <div className="text-right text-sm opacity-80">{BRANCH_DEPT.length} Branches</div>
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
            {BRANCH_DEPT.map(({ branch, depts, total }) => [
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

function OnboardingTab() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-indigo-600 text-white rounded-xl px-4 py-3 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{ONBOARDING_TOTALS.total}</div>
          <div className="text-xs opacity-80 mt-0.5">Total Staff</div>
        </div>
        {ONBOARDING_COLS.map(({ key, label }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex flex-col items-center">
            <div className="text-xl font-bold text-gray-800">{ONBOARDING_TOTALS[key]}</div>
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
            {ONBOARDING.map(row => (
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
                <td key={key} className="px-3 py-3 text-right font-bold text-indigo-700">{ONBOARDING_TOTALS[key]}</td>
              ))}
              <td className="px-4 py-3 text-right font-bold text-indigo-800 text-base">{ONBOARDING_TOTALS.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Teachers1on1Tab() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Teachers', val: T1ON1_TOTALS.total, cls: 'bg-indigo-600 text-white' },
          { label: '1on1 Done', val: T1ON1_TOTALS.done, cls: 'bg-green-50 border border-green-200 text-green-800' },
          { label: 'Recommended', val: T1ON1_TOTALS.recommended, cls: 'bg-blue-50 border border-blue-200 text-blue-800' },
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
            {TEACHERS_1ON1.map(({ school, total, done, recommended }) => {
              const donePct = Math.round((done / total) * 100);
              const recPct = Math.round((recommended / total) * 100);
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
              <td className="px-4 py-3 text-right font-bold text-indigo-800">{T1ON1_TOTALS.total}</td>
              <td className="px-4 py-3 text-right font-bold text-green-700">{T1ON1_TOTALS.done}</td>
              <td className="px-4 py-3 text-right font-bold text-blue-700">{T1ON1_TOTALS.recommended}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.round((T1ON1_TOTALS.done / T1ON1_TOTALS.total) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-9 text-right">
                    {Math.round((T1ON1_TOTALS.done / T1ON1_TOTALS.total) * 100)}%
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
  { key: 'branch', label: 'Branch-Dept Count' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'teachers1on1', label: 'Teachers 1on1' },
];

export default function StaffOnboarding() {
  const [tab, setTab] = useState('branch');
  return (
    <div>
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'branch'       && <BranchDeptTab />}
      {tab === 'onboarding'   && <OnboardingTab />}
      {tab === 'teachers1on1' && <Teachers1on1Tab />}
    </div>
  );
}
