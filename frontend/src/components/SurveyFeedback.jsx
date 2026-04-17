import { useState } from 'react';
import { SURVEY_DATA, SCHOOLS } from './surveyData';
import { MessageSquare, AlertTriangle } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
function scoreColor(v) {
  if (v >= 4.0) return 'text-green-700 bg-green-50';
  if (v >= 3.5) return 'text-blue-700 bg-blue-50';
  if (v >= 3.0) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}
function ratingColor(r) {
  return { 1: 'bg-red-500', 2: 'bg-orange-400', 3: 'bg-amber-400', 4: 'bg-lime-500', 5: 'bg-green-500' }[r] || 'bg-gray-300';
}
function pct(n, total) { return total > 0 ? (n / total) * 100 : 0; }
function sum(arr) { return arr.reduce((s, x) => s + (x.n ?? 0), 0); }
function avgRating(arr) {
  const t = sum(arr); if (!t) return 0;
  return arr.reduce((s, x) => s + x.r * x.n, 0) / t;
}

// ── Focus items per card key ──────────────────────────────────────────────────
function getCardFocus(d, tab, cardKey) {
  const items = [];
  if (tab === 'Pre-Primary' && d.prePrimary) {
    if (cardKey === 'areasOfImprovement') {
      [...d.prePrimary.areasOfImprovement].sort((a,b)=>b.n-a.n).slice(0,2)
        .forEach(x => x.n > 0 && items.push(`Needs focus: "${x.name}"`));
    }
  }
  if (tab === 'G1-G5' && d.g1g5) {
    if (cardKey === 'grades') {
      d.g1g5.grades.filter(g => Math.min(g.academicStd, g.teachingQuality, g.learningGaps) < 3.0)
        .forEach(g => items.push(`${g.grade} has score(s) below 3.0`));
    }
    if (cardKey === 'remarks') {
      d.g1g5.remarks.filter(x => x.name !== 'None').sort((a,b)=>b.n-a.n).slice(0,2)
        .forEach(x => x.n >= 3 && items.push(`"${x.name}" raised by ${x.n} parents`));
    }
  }
  if (tab === 'G6-G8' && d.g6g8) {
    if (cardKey === 'ratings') {
      const { teacherKnowledge, doubtSolving, academicRigor } = d.g6g8;
      if (avgRating(teacherKnowledge) < 3.5) items.push(`Teacher knowledge avg low: ${avgRating(teacherKnowledge).toFixed(1)}/5`);
      if (avgRating(doubtSolving) < 3.5)     items.push(`Doubt-solving avg low: ${avgRating(doubtSolving).toFixed(1)}/5`);
      if (avgRating(academicRigor) < 3.5)    items.push(`Academic rigor avg low: ${avgRating(academicRigor).toFixed(1)}/5`);
    }
    if (cardKey === 'majorIssues') {
      d.g6g8.majorIssues.filter(x => x.name !== 'None').sort((a,b)=>b.n-a.n).slice(0,2)
        .forEach(x => x.n >= 2 && items.push(`"${x.name}" — ${x.n} responses`));
    }
    if (cardKey === 'areasOfImprovement') {
      const top = d.g6g8.areasOfImprovement.sort((a,b)=>b.n-a.n)[0];
      if (top?.n >= 5) items.push(`Top priority: "${top.name}" (${top.n} responses)`);
    }
  }
  if (tab === 'G9-G10' && d.g9g10) {
    if (cardKey === 'grades') {
      d.g9g10.grades.filter(g => Math.min(g.boardPrep, g.teachingQuality, g.timeManagement) < 3.0)
        .forEach(g => items.push(`${g.grade} has score(s) below 3.0`));
    }
    if (cardKey === 'majorIssues') {
      d.g9g10.majorIssues.filter(x => x.name !== 'None').sort((a,b)=>b.n-a.n).slice(0,2)
        .forEach(x => x.n >= 2 && items.push(`"${x.name}" — ${x.n} responses`));
    }
  }
  return items;
}

function InlineFocus({ items }) {
  if (!items.length) return null;
  return (
    <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-amber-700 flex items-start gap-1.5">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Pie chart (pure SVG, no deps) ────────────────────────────────────────────
const PIE_PALETTE = [
  '#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#84cc16','#ec4899','#64748b',
];

function PieChart({ data, size = 160 }) {
  const total = sum(data);
  if (!total) return null;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  let angle = -Math.PI / 2;
  const slices = data.filter(x => x.n > 0).map((x, i) => {
    const sweep = (x.n / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...x, x1, y1, x2, y2, large, color: PIE_PALETTE[i % PIE_PALETTE.length], sweep };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i}
          d={`M${cx},${cy} L${s.x1},${s.y1} A${r},${r} 0 ${s.large},1 ${s.x2},${s.y2} Z`}
          fill={s.color} stroke="white" strokeWidth={1.5}>
          <title>{s.name}: {s.n} ({pct(s.n, total).toFixed(1)}%)</title>
        </path>
      ))}
    </svg>
  );
}

// ── Pie + bar combo card ──────────────────────────────────────────────────────
function PieCard({ title, accent, data, color, isIssue, focusItems = [] }) {
  const total = sum(data);
  const pieData = data.filter(x => x.n > 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-100 border-l-4 ${accent}`}>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div className="shrink-0">
            <PieChart data={pieData} size={140} />
          </div>
          <div className="flex-1 w-full space-y-0.5">
            {data.map((x) => (
              <div key={x.name} className="flex items-center gap-2 py-0.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: x.n > 0 ? PIE_PALETTE[pieData.findIndex(p=>p.name===x.name) % PIE_PALETTE.length] : '#e5e7eb' }} />
                <div className="w-32 text-xs text-gray-600 shrink-0 truncate" title={x.name}>{x.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full ${isIssue && x.name !== 'None' ? 'bg-rose-400' : (color || 'bg-indigo-500')}`}
                    style={{ width: `${pct(x.n, total)}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-20 shrink-0 text-right">
                  {x.n} <span className="text-gray-400">({pct(x.n, total).toFixed(1)}%)</span>
                </span>
              </div>
            ))}
            <p className="text-xs text-gray-400 pt-1 text-right">Total: {total}</p>
          </div>
        </div>
        <InlineFocus items={focusItems} />
      </div>
    </div>
  );
}

function Card({ title, accent = 'border-indigo-400', focusItems = [], children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-100 border-l-4 ${accent}`}>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-4 py-3">
        {children}
        <InlineFocus items={focusItems} />
      </div>
    </div>
  );
}

function RatingBar({ label, data }) {
  const total = sum(data);
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-gray-600 w-52 shrink-0 leading-tight">{label}</div>
      <div className="flex-1 flex rounded overflow-hidden h-6 bg-gray-100">
        {[1, 2, 3, 4, 5].map(r => {
          const item = data.find(d => d.r === r);
          const n = item?.n || 0;
          const w = pct(n, total);
          return w > 0 ? (
            <div key={r}
              className={`${ratingColor(r)} flex items-center justify-center text-[10px] text-white font-semibold`}
              style={{ width: `${w}%` }}
              title={`Rating ${r}: ${n} (${w.toFixed(1)}%)`}>
              {w > 10 ? `${n}` : ''}
            </div>
          ) : null;
        })}
      </div>
      <div className="text-xs text-gray-500 w-10 shrink-0 text-right font-medium">
        {avgRating(data).toFixed(1)}<span className="text-gray-400">/5</span>
      </div>
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────────────────
function PrePrimaryTab({ d }) {
  const { cocurricular, academicFocus, areasOfImprovement } = d.prePrimary;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PieCard title="Co-curricular Activities" accent="border-purple-400" data={cocurricular} color="bg-purple-500" />
      <PieCard title="Academic Focus Areas"      accent="border-blue-400"   data={academicFocus}       color="bg-blue-500" />
      <PieCard title="Areas of Improvement"      accent="border-rose-400"   data={areasOfImprovement}  color="bg-rose-500" isIssue
        focusItems={getCardFocus(d, 'Pre-Primary', 'areasOfImprovement')} />
    </div>
  );
}

function G1G5Tab({ d }) {
  const { areas, grades, subjects, activities, remarks, academicPriorities } = d.g1g5;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieCard title="Areas needing improvement" accent="border-indigo-400" data={areas} color="bg-indigo-500" />
        <Card title="Grade-wise Scores (Avg out of 5)" accent="border-teal-400"
          focusItems={getCardFocus(d, 'G1-G5', 'grades')}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase">
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-center">Academic Std.</th>
                  <th className="px-3 py-2 text-center">Teaching Quality</th>
                  <th className="px-3 py-2 text-center">Learning Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {grades.map(g => (
                  <tr key={g.grade} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 font-medium text-gray-700">{g.grade}</td>
                    <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded font-semibold ${scoreColor(g.academicStd)}`}>{g.academicStd.toFixed(2)}</span></td>
                    <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded font-semibold ${scoreColor(g.teachingQuality)}`}>{g.teachingQuality.toFixed(2)}</span></td>
                    <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded font-semibold ${scoreColor(g.learningGaps)}`}>{g.learningGaps.toFixed(2)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {[['≥4.0','bg-green-500'],['≥3.5','bg-blue-500'],['≥3.0','bg-amber-400'],['<3.0','bg-red-400']].map(([l,c])=>(
              <span key={l} className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className={`w-3 h-3 rounded ${c} inline-block`}/>{l}
              </span>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieCard title="Subjects needing maximum focus"       accent="border-green-400" data={subjects}   color="bg-green-500" />
        <PieCard title="Co-curricular activities to strengthen" accent="border-amber-400" data={activities} color="bg-amber-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {academicPriorities && (
          <PieCard title="Academic Priorities" accent="border-violet-400" data={academicPriorities} color="bg-violet-500" />
        )}
        <PieCard title="Major Issues" accent="border-gray-400" data={remarks} color="bg-rose-400" isIssue
          focusItems={getCardFocus(d, 'G1-G5', 'remarks')} />
      </div>
    </div>
  );
}

function G6G8Tab({ d }) {
  const { teacherKnowledge, doubtSolving, academicRigor, majorIssues, areasOfImprovement } = d.g6g8;
  return (
    <div className="space-y-4">
      <Card title="Satisfaction Ratings (1 = Very Low → 5 = Excellent) — avg shown on right" accent="border-indigo-400"
        focusItems={getCardFocus(d, 'G6-G8', 'ratings')}>
        <div className="space-y-3 mt-1">
          <RatingBar label="Teacher subject knowledge & classroom effectiveness" data={teacherKnowledge} />
          <RatingBar label="Effectiveness of doubt-solving & academic support"   data={doubtSolving} />
          <RatingBar label="Academic rigor and challenge provided"               data={academicRigor} />
        </div>
        <div className="flex gap-3 mt-3 flex-wrap">
          {[1,2,3,4,5].map(r => (
            <span key={r} className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className={`w-3 h-3 rounded ${ratingColor(r)} inline-block`}/> {r}
            </span>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieCard title="Major Issues Raised"  accent="border-rose-400"  data={majorIssues}       color="bg-rose-500"  isIssue
          focusItems={getCardFocus(d, 'G6-G8', 'majorIssues')} />
        <PieCard title="Areas of Improvement" accent="border-amber-400" data={areasOfImprovement} color="bg-amber-500"
          focusItems={getCardFocus(d, 'G6-G8', 'areasOfImprovement')} />
      </div>
    </div>
  );
}

function G9G10Tab({ d }) {
  const { grades, majorIssues, academicPriorities } = d.g9g10;
  return (
    <div className="space-y-4">
      <Card title="Grade-wise Scores (Avg out of 5)" accent="border-teal-400"
        focusItems={getCardFocus(d, 'G9-G10', 'grades')}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase">
                <th className="px-3 py-2 text-left">Grade</th>
                <th className="px-3 py-2 text-center">Board Exam Prep</th>
                <th className="px-3 py-2 text-center">Teaching Quality</th>
                <th className="px-3 py-2 text-center">Time Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {grades.map(g => (
                <tr key={g.grade} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-700">{g.grade}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded font-semibold ${scoreColor(g.boardPrep)}`}>{Number(g.boardPrep).toFixed(2)}</span></td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded font-semibold ${scoreColor(g.teachingQuality)}`}>{Number(g.teachingQuality).toFixed(2)}</span></td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded font-semibold ${scoreColor(g.timeManagement)}`}>{Number(g.timeManagement).toFixed(2)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          {[['≥4.0','bg-green-500'],['≥3.5','bg-blue-500'],['≥3.0','bg-amber-400'],['<3.0','bg-red-400']].map(([l,c])=>(
            <span key={l} className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className={`w-3 h-3 rounded ${c} inline-block`}/>{l}
            </span>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieCard title="Major Issues Raised"     accent="border-rose-400"   data={majorIssues}       color="bg-rose-500"   isIssue
          focusItems={getCardFocus(d, 'G9-G10', 'majorIssues')} />
        <PieCard title="Key Academic Priorities" accent="border-violet-400" data={academicPriorities} color="bg-violet-500" />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function SurveyFeedback() {
  const [school, setSchool] = useState(SCHOOLS[0]);
  const [tab, setTab]       = useState('Pre-Primary');

  const d = SURVEY_DATA[school];
  const tabs = [
    ...(d?.prePrimary ? ['Pre-Primary'] : []),
    'G1-G5', 'G6-G8',
    ...(d?.g9g10 ? ['G9-G10'] : []),
  ];
  const activeTab = tabs.includes(tab) ? tab : tabs[0];

  return (
    <div className="space-y-5">
      {/* Header + dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-600" /> Survey Form: Parents Feedback
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Parent satisfaction and feedback analysis by grade band</p>
        </div>
        {/* Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 shrink-0">School:</label>
          <select
            value={school}
            onChange={e => { setSchool(e.target.value); setTab('Pre-Primary'); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[160px]"
          >
            {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* School button pills (still visible for quick switching) */}
      <div className="flex flex-wrap gap-2">
        {SCHOOLS.map(s => (
          <button key={s}
            onClick={() => { setSchool(s); setTab('Pre-Primary'); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              school === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Tab bar + content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                ${activeTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'Pre-Primary' && <PrePrimaryTab d={d} />}
          {activeTab === 'G1-G5'      && <G1G5Tab d={d} />}
          {activeTab === 'G6-G8'      && <G6G8Tab d={d} />}
          {activeTab === 'G9-G10'     && d.g9g10 && <G9G10Tab d={d} />}
        </div>
      </div>
    </div>
  );
}
