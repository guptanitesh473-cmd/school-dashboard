import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, Calculator, Users, TrendingUp, ChevronDown } from 'lucide-react';

const ENG_CATS = ['Reading & Literacy', 'Grammar & Writing', 'Writing'];
const MATH_CATS = ['Numbers & Operations', 'Fractions', 'Measurement & Data', 'Geometry & Patterns'];

function pctColor(pct) {
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function pctTextColor(pct) {
  if (pct >= 75) return 'text-green-700 bg-green-50';
  if (pct >= 50) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

function Bar({ pct }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-9 text-right">{pct}%</span>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function BLA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [section, setSection] = useState('All');
  const [sort, setSort] = useState({ key: 'no', dir: 1 });
  const [expand, setExpand] = useState(null); // expanded student row

  useEffect(() => {
    setLoading(true);
    api.getBLA(3)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600 p-6">{error}</div>;
  if (!data) return null;

  const { students, summary } = data;

  const filtered = section === 'All' ? students : students.filter(s => s.section === section);

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if (sort.key === 'no') { av = a.no; bv = b.no; }
    else if (sort.key === 'name') { av = a.name; bv = b.name; }
    else if (sort.key === 'english') { av = a.english.total; bv = b.english.total; }
    else if (sort.key === 'math') { av = a.math.total; bv = b.math.total; }
    else if (sort.key === 'total') { av = a.total; bv = b.total; }
    else { av = 0; bv = 0; }
    if (av < bv) return -sort.dir;
    if (av > bv) return sort.dir;
    return 0;
  });

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: -1 });
  };

  const sortIcon = (key) => sort.key === key ? (sort.dir === -1 ? ' ↓' : ' ↑') : '';

  // Filtered averages
  const avg = (arr, fn) => arr.length ? Math.round(arr.reduce((s, x) => s + fn(x), 0) / arr.length * 10) / 10 : 0;
  const avgEng = avg(filtered, s => s.english.total);
  const avgMath = avg(filtered, s => s.math.total);
  const avgTotal = avg(filtered, s => s.total);
  const engMax = filtered[0]?.english.max || 26;
  const mathMax = filtered[0]?.math.max || 21;
  const totalMax = engMax + mathMax;

  const engCatAvgs = ENG_CATS.map(cat => ({
    cat,
    avg: avg(filtered, s => s.english.categories[cat]?.score || 0),
    max: filtered[0]?.english.categories[cat]?.max || 0,
    avgPct: avg(filtered, s => s.english.categories[cat]?.pct || 0),
  }));
  const mathCatAvgs = MATH_CATS.map(cat => ({
    cat,
    avg: avg(filtered, s => s.math.categories[cat]?.score || 0),
    max: filtered[0]?.math.categories[cat]?.max || 0,
    avgPct: avg(filtered, s => s.math.categories[cat]?.pct || 0),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BLA Dashboard — Grade 3</h1>
          <p className="text-sm text-gray-500 mt-0.5">Baseline Learning Assessment · {summary.total} students</p>
        </div>
        {/* Section filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Section:</span>
          <div className="flex gap-1">
            {['All', ...summary.sections].map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  section === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} color="bg-indigo-600" label="Students" value={filtered.length} sub={section !== 'All' ? `Section ${section}` : 'All sections'} />
        <StatCard icon={BookOpen} color="bg-blue-500" label="Avg English" value={`${avgEng}/${engMax}`} sub={`${Math.round(avgEng/engMax*100)}%`} />
        <StatCard icon={Calculator} color="bg-violet-500" label="Avg Math" value={`${avgMath}/${mathMax}`} sub={`${Math.round(avgMath/mathMax*100)}%`} />
        <StatCard icon={TrendingUp} color="bg-green-600" label="Avg Total" value={`${avgTotal}/${totalMax}`} sub={`${Math.round(avgTotal/totalMax*100)}%`} />
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* English */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">English — Category Averages</h3>
          </div>
          <div className="space-y-4">
            {engCatAvgs.map(({ cat, avg: a, max, avgPct }) => (
              <div key={cat}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-700 font-medium">{cat}</span>
                  <span className="text-xs text-gray-500">{a}/{max}</span>
                </div>
                <Bar pct={avgPct} />
              </div>
            ))}
          </div>
        </div>

        {/* Math */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-violet-500" />
            <h3 className="font-semibold text-gray-800">Math — Category Averages</h3>
          </div>
          <div className="space-y-4">
            {mathCatAvgs.map(({ cat, avg: a, max, avgPct }) => (
              <div key={cat}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-700 font-medium">{cat}</span>
                  <span className="text-xs text-gray-500">{a}/{max}</span>
                </div>
                <Bar pct={avgPct} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Student-wise Scores</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click any row to expand category details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10 cursor-pointer select-none" onClick={() => toggleSort('no')}>#{ sortIcon('no')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none min-w-[160px]" onClick={() => toggleSort('name')}>Name{sortIcon('name')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Sec</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('english')}>English{sortIcon('english')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('math')}>Math{sortIcon('math')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('total')}>Total{sortIcon('total')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(student => (
                <>
                  <tr
                    key={student.no}
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => setExpand(expand === student.no ? null : student.no)}
                  >
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{student.no}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{student.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{student.section || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ScoreBadge score={student.english.total} max={student.english.max} />
                    </td>
                    <td className="px-4 py-2.5">
                      <ScoreBadge score={student.math.total} max={student.math.max} />
                    </td>
                    <td className="px-4 py-2.5">
                      <ScoreBadge score={student.total} max={student.totalMax} bold />
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">
                      <ChevronDown size={14} className={`transition-transform ${expand === student.no ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {expand === student.no && (
                    <tr key={`exp-${student.no}`} className="bg-indigo-50/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* English breakdown */}
                          <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">English</p>
                            <div className="space-y-2">
                              {ENG_CATS.map(cat => {
                                const c = student.english.categories[cat];
                                return (
                                  <div key={cat} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-36 shrink-0">{cat}</span>
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${pctColor(c.pct)}`} style={{ width: `${c.pct}%` }} />
                                    </div>
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${pctTextColor(c.pct)}`}>{c.score}/{c.max}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {/* Math breakdown */}
                          <div>
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">Math</p>
                            <div className="space-y-2">
                              {MATH_CATS.map(cat => {
                                const c = student.math.categories[cat];
                                return (
                                  <div key={cat} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-36 shrink-0">{cat}</span>
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${pctColor(c.pct)}`} style={{ width: `${c.pct}%` }} />
                                    </div>
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${pctTextColor(c.pct)}`}>{c.score}/{c.max}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score, max, bold }) {
  const pct = Math.round((score / max) * 100);
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-${bold ? 'bold' : 'medium'} ${pctTextColor(pct)}`}>
      {score}/{max}
      <span className="text-[10px] opacity-70">({pct}%)</span>
    </span>
  );
}

function Spinner() {
  return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}
