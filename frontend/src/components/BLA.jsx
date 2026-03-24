import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, Calculator, Users, TrendingUp, ChevronDown } from 'lucide-react';

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
        <div className={`h-full rounded-full transition-all ${pctColor(pct)}`} style={{ width: `${Math.min(100, pct)}%` }} />
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

function ScoreBadge({ score, max, bold }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${bold ? 'font-bold' : 'font-medium'} ${pctTextColor(pct)}`}>
      {score}/{max}
      <span className="text-[10px] opacity-70">({pct}%)</span>
    </span>
  );
}

function Spinner() {
  return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}

export default function BLA() {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [error, setError] = useState('');
  const [section, setSection] = useState('All');
  const [sort, setSort] = useState({ key: 'no', dir: 1 });
  const [expand, setExpand] = useState(null);

  // Load grade list
  useEffect(() => {
    api.getBLAGrades()
      .then(g => { setGrades(g); if (g.length) setSelectedGrade(g[0].grade); })
      .catch(e => setError(e.message))
      .finally(() => setLoadingGrades(false));
  }, []);

  // Load grade data
  useEffect(() => {
    if (!selectedGrade) return;
    setLoading(true);
    setData(null);
    setSection('All');
    setExpand(null);
    api.getBLA(selectedGrade)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGrade]);

  if (loadingGrades) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header + Grade selector */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BLA Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Baseline Learning Assessment — select a grade</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {grades.map(g => (
            <button
              key={g.grade}
              onClick={() => setSelectedGrade(g.grade)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedGrade === g.grade
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>}
      {loading && <Spinner />}
      {!loading && data && <GradeDashboard data={data} section={section} setSection={setSection} sort={sort} setSort={setSort} expand={expand} setExpand={setExpand} />}
    </div>
  );
}

function GradeDashboard({ data, section, setSection, sort, setSort, expand, setExpand }) {
  const { students, summary, label } = data;

  const filtered = section === 'All' ? students : students.filter(s => s.section === section);
  const engCatNames = Object.keys(students[0]?.english.categories || {});
  const mathCatNames = Object.keys(students[0]?.math.categories || {});

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

  const toggleSort = (key) => setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: -1 });
  const sortIcon = (key) => sort.key === key ? (sort.dir === -1 ? ' ↓' : ' ↑') : '';

  const avg = (arr, fn) => arr.length ? Math.round(arr.reduce((s, x) => s + fn(x), 0) / arr.length * 10) / 10 : 0;
  const avgEng = avg(filtered, s => s.english.total);
  const avgMath = avg(filtered, s => s.math.total);
  const avgTotal = avg(filtered, s => s.total);
  const engMax = filtered[0]?.english.max || 1;
  const mathMax = filtered[0]?.math.max || 1;
  const totalMax = engMax + mathMax;

  const engCatAvgs = summary.engCategories.map(c => ({
    ...c,
    avg: avg(filtered, s => s.english.categories[c.name]?.score || 0),
    avgPct: avg(filtered, s => s.english.categories[c.name]?.pct || 0),
  }));
  const mathCatAvgs = summary.mathCategories.map(c => ({
    ...c,
    avg: avg(filtered, s => s.math.categories[c.name]?.score || 0),
    avgPct: avg(filtered, s => s.math.categories[c.name]?.pct || 0),
  }));

  return (
    <div className="space-y-6">
      {/* Section filter + student count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{label} · {summary.total} students total</p>
        {summary.sections.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Section:</span>
            <div className="flex gap-1">
              {['All', ...summary.sections].map(s => (
                <button key={s} onClick={() => setSection(s)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    section === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} color="bg-indigo-600" label="Students" value={filtered.length}
          sub={section !== 'All' ? `Section ${section}` : 'All sections'} />
        <StatCard icon={BookOpen} color="bg-blue-500" label="Avg English" value={`${avgEng}/${engMax}`}
          sub={`${Math.round(avgEng / engMax * 100)}%`} />
        <StatCard icon={Calculator} color="bg-violet-500" label="Avg Math" value={`${avgMath}/${mathMax}`}
          sub={`${Math.round(avgMath / mathMax * 100)}%`} />
        <StatCard icon={TrendingUp} color="bg-green-600" label="Avg Total" value={`${avgTotal}/${totalMax}`}
          sub={`${Math.round(avgTotal / totalMax * 100)}%`} />
      </div>

      {/* Category charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">English — Category Averages</h3>
          </div>
          <div className="space-y-4">
            {engCatAvgs.map(({ name: cat, avg: a, max, avgPct }) => (
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-violet-500" />
            <h3 className="font-semibold text-gray-800">Math — Category Averages</h3>
          </div>
          <div className="space-y-4">
            {mathCatAvgs.map(({ name: cat, avg: a, max, avgPct }) => (
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
          <p className="text-xs text-gray-400 mt-0.5">Click a row to expand category details · Click column headers to sort</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <Th onClick={() => toggleSort('no')}># {sortIcon('no')}</Th>
                <Th onClick={() => toggleSort('name')} cls="min-w-[160px]">Name{sortIcon('name')}</Th>
                <Th cls="w-14">Sec</Th>
                <Th onClick={() => toggleSort('english')}>English{sortIcon('english')}</Th>
                <Th onClick={() => toggleSort('math')}>Math{sortIcon('math')}</Th>
                <Th onClick={() => toggleSort('total')}>Total{sortIcon('total')}</Th>
                <Th cls="w-8"></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(student => (
                <StudentRow
                  key={student.no}
                  student={student}
                  expanded={expand === student.no}
                  onToggle={() => setExpand(expand === student.no ? null : student.no)}
                  engCatNames={engCatNames}
                  mathCatNames={mathCatNames}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, onClick, cls = '' }) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${onClick ? 'cursor-pointer select-none hover:text-gray-700' : ''} ${cls}`}
    >
      {children}
    </th>
  );
}

function StudentRow({ student, expanded, onToggle, engCatNames, mathCatNames }) {
  return (
    <>
      <tr className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-2.5 text-gray-400 text-xs">{student.no}</td>
        <td className="px-4 py-2.5 font-medium text-gray-800">{student.name}</td>
        <td className="px-4 py-2.5">
          {student.section && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{student.section}</span>
          )}
        </td>
        <td className="px-4 py-2.5"><ScoreBadge score={student.english.total} max={student.english.max} /></td>
        <td className="px-4 py-2.5"><ScoreBadge score={student.math.total} max={student.math.max} /></td>
        <td className="px-4 py-2.5"><ScoreBadge score={student.total} max={student.totalMax} bold /></td>
        <td className="px-4 py-2.5 text-gray-400">
          <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-indigo-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CategoryBreakdown label="English" color="text-blue-600" cats={engCatNames} data={student.english.categories} />
              <CategoryBreakdown label="Math" color="text-violet-600" cats={mathCatNames} data={student.math.categories} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CategoryBreakdown({ label, color, cats, data }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${color}`}>{label}</p>
      <div className="space-y-2">
        {cats.map(cat => {
          const c = data[cat];
          if (!c) return null;
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-36 shrink-0 truncate" title={cat}>{cat}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pctColor(c.pct)}`} style={{ width: `${Math.min(100, c.pct)}%` }} />
              </div>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${pctTextColor(c.pct)}`}>{c.score}/{c.max}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
