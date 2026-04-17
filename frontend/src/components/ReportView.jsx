import { useState, useMemo } from 'react';
import { SCHOOLS, CATEGORIES } from './academicData';

const STATUS_CFG = {
  Y: { dot: 'bg-green-500',  ring: 'ring-green-200',  label: 'Yes',       text: 'text-green-700' },
  N: { dot: 'bg-red-400',    ring: 'ring-red-200',    label: 'No',        text: 'text-red-600'   },
  F: { dot: 'bg-amber-400',  ring: 'ring-amber-200',  label: 'In Future', text: 'text-amber-600' },
  '':{ dot: 'bg-gray-200',   ring: '',                label: '—',         text: 'text-gray-300'  },
};

function pct(arr, type, schoolIndices) {
  const slice = schoolIndices.map(i => arr[i]);
  if (!slice.length) return 0;
  return Math.round((slice.filter(s => s === type).length / slice.length) * 100);
}

function schoolScore(schoolIdx) {
  let yes = 0, total = 0;
  CATEGORIES.forEach(cat => cat.offerings.forEach(off => {
    const s = off.statuses[schoolIdx];
    if (s === 'Y' || s === 'N') { total++; if (s === 'Y') yes++; }
    if (s === 'F') total++;
  }));
  return total ? Math.round((yes / total) * 100) : 0;
}

export default function ReportView() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  const visibleSchools = useMemo(() =>
    SCHOOLS.map((s, i) => ({ ...s, idx: i }))
      .filter(s => typeFilter === 'all' || s.type === typeFilter),
  [typeFilter]);

  const visibleCats = catFilter === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.name === catFilter);
  const schoolIdxs = visibleSchools.map(s => s.idx);

  // Summary stats
  const totalCells = visibleSchools.length * CATEGORIES.reduce((a, c) => a + c.offerings.length, 0);
  let yes = 0, no = 0, future = 0;
  CATEGORIES.forEach(cat => cat.offerings.forEach(off => {
    schoolIdxs.forEach(i => {
      if (off.statuses[i] === 'Y') yes++;
      else if (off.statuses[i] === 'N') no++;
      else if (off.statuses[i] === 'F') future++;
    });
  }));

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-indigo-600 text-white rounded-xl p-4">
          <div className="text-2xl font-bold">{visibleSchools.length}</div>
          <div className="text-xs opacity-80 mt-0.5">Schools</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-700">{yes}</div>
          <div className="text-xs text-green-600 mt-0.5">Available</div>
          <div className="text-[10px] text-green-400">{Math.round((yes/totalCells)*100)}% of offerings</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{no}</div>
          <div className="text-xs text-red-500 mt-0.5">Not Available</div>
          <div className="text-[10px] text-red-300">{Math.round((no/totalCells)*100)}% of offerings</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-600">{future}</div>
          <div className="text-xs text-amber-600 mt-0.5">In Future</div>
          <div className="text-[10px] text-amber-400">{Math.round((future/totalCells)*100)}% of offerings</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {[['all','All Schools'],['existing','Existing'],['new_building','New Building']].map(([val,label]) => (
            <button key={val} onClick={() => setTypeFilter(val)}
              className={`px-3 py-1.5 font-medium transition-colors ${typeFilter===val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* School completion cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
        {visibleSchools.map(s => {
          const score = schoolScore(s.idx);
          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-800 leading-tight mb-2 line-clamp-2">{s.name}</div>
              {s.note && <div className="text-[10px] text-amber-600 mb-1 font-medium">{s.note}</div>}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${score}%` }} />
                </div>
                <span className={`text-xs font-bold ${score >= 80 ? 'text-green-700' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 capitalize">{s.type.replace('_',' ')}</div>
            </div>
          );
        })}
      </div>

      {/* Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 z-10 text-left px-3 py-2.5 font-semibold text-gray-600 border-r border-gray-200 min-w-[130px]">Category</th>
                <th className="sticky left-[130px] bg-gray-50 z-10 text-left px-3 py-2.5 font-semibold text-gray-600 border-r border-gray-200 min-w-[160px]">Offering</th>
                {visibleSchools.map(s => (
                  <th key={s.id} className="text-center px-2 py-2 font-medium text-gray-600 min-w-[80px] whitespace-nowrap border-r border-gray-100">
                    <div className="text-[10px] leading-tight">{s.name.replace('OIS ','').replace('OCSE ','')}</div>
                    {s.note && <div className="text-[9px] text-amber-500 font-normal">{s.note}</div>}
                    <div className={`text-[9px] mt-0.5 font-normal ${s.type === 'existing' ? 'text-indigo-400' : 'text-teal-400'}`}>
                      {s.type === 'existing' ? 'existing' : 'new bldg'}
                    </div>
                  </th>
                ))}
                <th className="text-center px-2 py-2 font-semibold text-gray-600 min-w-[60px] bg-gray-50">Score</th>
              </tr>
            </thead>
            <tbody>
              {visibleCats.map((cat, ci) =>
                cat.offerings.map((off, oi) => {
                  const yCount = schoolIdxs.filter(i => off.statuses[i] === 'Y').length;
                  const rowPct = schoolIdxs.length ? Math.round((yCount / schoolIdxs.length) * 100) : 0;
                  return (
                    <tr key={`${cat.name}-${off.name}`}
                      className={`border-b border-gray-100 hover:bg-indigo-50/20 ${oi === 0 && ci > 0 ? 'border-t-2 border-t-gray-200' : ''}`}>
                      {oi === 0 && (
                        <td rowSpan={cat.offerings.length}
                          className="sticky left-0 bg-white z-10 px-3 py-2 border-r border-gray-200 align-middle">
                          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white ${cat.color}`}>
                            {cat.name}
                          </div>
                        </td>
                      )}
                      <td className="sticky left-[130px] bg-white z-10 px-3 py-2 text-gray-700 font-medium border-r border-gray-100 whitespace-nowrap">{off.name}</td>
                      {visibleSchools.map(s => {
                        const st = off.statuses[s.idx] || '';
                        const cfg = STATUS_CFG[st];
                        return (
                          <td key={s.id} className="text-center px-2 py-2 border-r border-gray-100">
                            <div className="flex items-center justify-center">
                              <span title={cfg.label}
                                className={`inline-block w-3.5 h-3.5 rounded-full ${cfg.dot} ring-2 ${cfg.ring}`} />
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center px-2 py-2 bg-gray-50">
                        <span className={`text-[10px] font-bold ${rowPct === 100 ? 'text-green-600' : rowPct >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                          {rowPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
          {Object.entries(STATUS_CFG).filter(([k]) => k !== '').map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${v.dot}`} />
              {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
