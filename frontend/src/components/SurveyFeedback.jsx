import { useState } from 'react';
import { SURVEY_DATA, SCHOOLS } from './surveyData';
import { MessageSquare } from 'lucide-react';

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

// ── shared UI ─────────────────────────────────────────────────────────────────
function Card({ title, accent = 'border-indigo-400', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-100 border-l-4 ${accent}`}>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function HBar({ name, n, total, color = 'bg-indigo-500' }) {
  const w = Math.max(total > 0 ? 2 : 0, pct(n, total));
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-44 text-xs text-gray-600 shrink-0 text-right leading-tight truncate" title={name}>{name}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden min-w-0">
        <div className={`${color} h-full rounded-full flex items-center justify-end px-2`} style={{ width: `${w}%` }}>
          {w >= 12 && <span className="text-white text-[10px] font-semibold">{n}</span>}
        </div>
      </div>
      {w < 12 && <span className="text-xs text-gray-400 w-6 shrink-0">{n}</span>}
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
            <div
              key={r}
              className={`${ratingColor(r)} flex items-center justify-center text-[10px] text-white font-semibold`}
              style={{ width: `${w}%` }}
              title={`Rating ${r}: ${n}`}
            >
              {w > 8 ? n : ''}
            </div>
          ) : null;
        })}
      </div>
      <div className="flex gap-1 shrink-0">
        {[1,2,3,4,5].map(r => {
          const n = data.find(d => d.r === r)?.n || 0;
          return n > 0 ? (
            <span key={r} className={`text-[10px] px-1 rounded ${ratingColor(r)} text-white`}>{r}:{n}</span>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────────────────
function PrePrimaryTab({ d }) {
  const { cocurricular, academicFocus, areasOfImprovement } = d.prePrimary;
  const totCC = sum(cocurricular);
  const totAF = sum(academicFocus);
  const totAI = sum(areasOfImprovement);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Co-curricular Activities" accent="border-purple-400">
        {cocurricular.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totCC} color="bg-purple-500" />)}
        <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totCC}</p>
      </Card>
      <Card title="Academic Focus" accent="border-blue-400">
        {academicFocus.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totAF} color="bg-blue-500" />)}
        <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totAF}</p>
      </Card>
      <Card title="Areas of Improvement" accent="border-rose-400">
        {areasOfImprovement.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totAI} color="bg-rose-500" />)}
        <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totAI}</p>
      </Card>
    </div>
  );
}

function G1G5Tab({ d }) {
  const { areas, grades, subjects, activities, remarks, academicPriorities } = d.g1g5;
  const totA = sum(areas);
  const totS = sum(subjects);
  const totAct = sum(activities);
  const totR = sum(remarks);
  return (
    <div className="space-y-4">
      {/* Satisfaction Areas + Grade Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Satisfaction Areas" accent="border-indigo-400">
          {areas.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totA} color="bg-indigo-500" />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totA}</p>
        </Card>
        <Card title="Grade-wise Scores (Avg out of 5)" accent="border-teal-400">
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

      {/* Subjects + Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Preferred Subjects" accent="border-green-400">
          {subjects.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totS} color="bg-green-500" />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totS}</p>
        </Card>
        <Card title="Preferred Activities" accent="border-amber-400">
          {activities.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totAct} color="bg-amber-500" />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totAct}</p>
        </Card>
      </div>

      {/* Academic Priorities (if any) + Remarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {academicPriorities && (
          <Card title="Academic Priorities" accent="border-violet-400">
            {academicPriorities.map(x => <HBar key={x.name} name={x.name} n={x.n} total={sum(academicPriorities)} color="bg-violet-500" />)}
            <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {sum(academicPriorities)}</p>
          </Card>
        )}
        <Card title="Parent Remarks" accent="border-gray-400">
          {remarks.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totR} color={x.name === 'None' ? 'bg-gray-400' : 'bg-rose-400'} />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totR}</p>
        </Card>
      </div>
    </div>
  );
}

function G6G8Tab({ d }) {
  const { teacherKnowledge, doubtSolving, academicRigor, majorIssues, areasOfImprovement } = d.g6g8;
  const totMI = sum(majorIssues);
  const totAI = sum(areasOfImprovement);
  return (
    <div className="space-y-4">
      {/* Rating distributions */}
      <Card title="Satisfaction Ratings (1 = Very Low → 5 = Excellent)" accent="border-indigo-400">
        <div className="space-y-3 mt-1">
          <RatingBar label="Teacher subject knowledge & classroom effectiveness" data={teacherKnowledge} />
          <RatingBar label="Effectiveness of doubt-solving & academic support" data={doubtSolving} />
          <RatingBar label="Academic rigor and challenge provided" data={academicRigor} />
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
        <Card title="Major Issues Raised" accent="border-rose-400">
          {majorIssues.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totMI} color={x.name === 'None' ? 'bg-gray-400' : 'bg-rose-500'} />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totMI}</p>
        </Card>
        <Card title="Areas of Improvement" accent="border-amber-400">
          {areasOfImprovement.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totAI} color="bg-amber-500" />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totAI}</p>
        </Card>
      </div>
    </div>
  );
}

function G9G10Tab({ d }) {
  const { grades, majorIssues, academicPriorities } = d.g9g10;
  const totMI = sum(majorIssues);
  const totAP = sum(academicPriorities);
  return (
    <div className="space-y-4">
      <Card title="Grade-wise Scores (Avg out of 5)" accent="border-teal-400">
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
        <Card title="Major Issues Raised" accent="border-rose-400">
          {majorIssues.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totMI} color={x.name === 'None' ? 'bg-gray-400' : 'bg-rose-500'} />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totMI}</p>
        </Card>
        <Card title="Key Academic Priorities" accent="border-violet-400">
          {academicPriorities.map(x => <HBar key={x.name} name={x.name} n={x.n} total={totAP} color="bg-violet-500" />)}
          <p className="text-xs text-gray-400 mt-2 text-right">Total responses: {totAP}</p>
        </Card>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function SurveyFeedback() {
  const [school, setSchool] = useState(SCHOOLS[0]);
  const [tab, setTab] = useState('Pre-Primary');

  const d = SURVEY_DATA[school];
  const tabs = ['Pre-Primary', 'G1-G5', 'G6-G8', ...(d?.g9g10 ? ['G9-G10'] : [])];

  // Reset tab if current tab doesn't exist for selected school
  const activeTab = tabs.includes(tab) ? tab : tabs[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" /> Survey Form: Parents Feedback
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Parent satisfaction and feedback analysis by grade band</p>
      </div>

      {/* School selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-600 shrink-0">School:</span>
        <div className="flex flex-wrap gap-2">
          {SCHOOLS.map(s => (
            <button
              key={s}
              onClick={() => { setSchool(s); setTab('Pre-Primary'); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                school === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                ${activeTab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
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
