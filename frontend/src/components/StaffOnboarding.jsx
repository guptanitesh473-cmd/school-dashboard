const DEPT_COLORS = {
  Teachers: 'bg-blue-100 text-blue-800',
  Principals: 'bg-purple-100 text-purple-800',
  'Support Staff': 'bg-teal-100 text-teal-800',
  Admin: 'bg-orange-100 text-orange-800',
  'Sales and Marketing': 'bg-pink-100 text-pink-800',
  Drivers: 'bg-gray-100 text-gray-700',
};

const STAFF_DATA = [
  { branch: 'OIS Kumbalagodu, Bangalore', depts: [{ dept: 'Teachers', count: 66 }, { dept: 'Principals', count: 2 }, { dept: 'Admin', count: 14 }, { dept: 'Sales and Marketing', count: 6 }, { dept: 'Drivers', count: 8 }], total: 96 },
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

const GRAND_TOTAL = 489;

export default function StaffOnboarding() {
  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-indigo-600 text-white rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80">Total Staff Strength</div>
          <div className="text-3xl font-bold">{GRAND_TOTAL}</div>
        </div>
        <div className="text-right text-sm opacity-80">
          <div>{STAFF_DATA.length} Branches</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-64">Branch Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Department</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 w-24">Count</th>
            </tr>
          </thead>
          <tbody>
            {STAFF_DATA.map(({ branch, depts, total }) =>
              depts.map(({ dept, count }, i) => (
                <tr key={`${branch}-${dept}`} className="border-b border-gray-100 hover:bg-gray-50">
                  {i === 0 ? (
                    <td rowSpan={depts.length + 1} className="px-4 py-2 font-medium text-gray-800 align-top border-r border-gray-100 leading-snug">
                      {branch}
                    </td>
                  ) : null}
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEPT_COLORS[dept] || 'bg-gray-100 text-gray-700'}`}>
                      {dept}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-gray-700">{count}</td>
                </tr>
              )).concat(
                <tr key={`${branch}-total`} className="bg-gray-50 border-b border-gray-300">
                  <td className="px-4 py-2 text-sm font-semibold text-gray-600 italic">Total</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-800">{total}</td>
                </tr>
              )
            )}
            {/* Grand Total */}
            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-4 py-3 font-bold text-indigo-800">Grand Total</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right font-bold text-indigo-800 text-base">{GRAND_TOTAL}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
