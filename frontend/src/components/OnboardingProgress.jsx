const ONBOARDING = [
  { branch: 'OIS Kumbalagodu, Bangalore', teachers: 66, principals: 2, supportStaff: 0, admin: 14, salesMarketing: 6, drivers: 8, total: 96 },
  { branch: 'OIS Thirumudivakkam', teachers: 34, principals: 0, supportStaff: 18, admin: 4, salesMarketing: 0, drivers: 5, total: 61 },
  { branch: 'OIS DINDIGUL', teachers: 25, principals: 0, supportStaff: 23, admin: 0, salesMarketing: 0, drivers: 9, total: 57 },
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

const TOTALS = { teachers: 246, principals: 6, supportStaff: 121, admin: 39, salesMarketing: 8, drivers: 69, total: 489 };

const COLS = [
  { key: 'teachers', label: 'Teachers', color: 'text-blue-700 font-medium' },
  { key: 'principals', label: 'Principals', color: 'text-purple-700 font-medium' },
  { key: 'supportStaff', label: 'Support Staff', color: 'text-teal-700 font-medium' },
  { key: 'admin', label: 'Admin', color: 'text-orange-700 font-medium' },
  { key: 'salesMarketing', label: 'Sales & Mktg', color: 'text-pink-700 font-medium' },
  { key: 'drivers', label: 'Drivers', color: 'text-gray-600 font-medium' },
];

function cell(val) {
  if (val === 0) return <span className="text-gray-300">—</span>;
  return val;
}

export default function OnboardingProgress() {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-indigo-600 text-white rounded-xl px-4 py-3 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{TOTALS.total}</div>
          <div className="text-xs opacity-80 mt-0.5">Total Staff</div>
        </div>
        {COLS.map(({ key, label }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex flex-col items-center">
            <div className="text-xl font-bold text-gray-800">{TOTALS[key]}</div>
            <div className="text-[10px] text-gray-400 text-center mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[200px]">Branch Name</th>
              {COLS.map(({ key, label }) => (
                <th key={key} className="text-right px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">{label}</th>
              ))}
              <th className="text-right px-4 py-3 font-semibold text-gray-800">Total</th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING.map((row) => (
              <tr key={row.branch} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-800">{row.branch}</td>
                {COLS.map(({ key, color }) => (
                  <td key={key} className={`px-3 py-2.5 text-right ${color}`}>{cell(row[key])}</td>
                ))}
                <td className="px-4 py-2.5 text-right font-bold text-gray-800">{row.total}</td>
              </tr>
            ))}
            {/* Grand Total */}
            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-4 py-3 font-bold text-indigo-800">Grand Total</td>
              {COLS.map(({ key }) => (
                <td key={key} className="px-3 py-3 text-right font-bold text-indigo-700">{TOTALS[key]}</td>
              ))}
              <td className="px-4 py-3 text-right font-bold text-indigo-800 text-base">{TOTALS.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
