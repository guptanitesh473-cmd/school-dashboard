import { useState } from 'react';
import { SURVEY_DATA } from './surveyData';
import { MessageSquare, ChevronDown } from 'lucide-react';

const SCHOOLS = Object.keys(SURVEY_DATA);
const TABS = ['Overview', 'Co-curricular & Focus', 'Grade Satisfaction', 'PP Report'];

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreColor(v) {
  if (v >= 4.0) return 'text-green-700 bg-green-50';
  if (v >= 3.5) return 'text-blue-700 bg-blue-50';
  if (v >= 3.0) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}
function scoreBg(v) {
  if (v >= 4.0) return 'bg-green-500';
  if (v >= 3.5) return 'bg-blue-500';
  if (v >= 3.0) return 'bg-amber-400';
  return 'bg-red-400';
}
function ratingColor(r) {
  const map = { 1: 'bg-red-500', 2: 'bg-orange-400', 3: 'bg-amber-400', 4: 'bg-lime-500', 5: 'bg-green-500' };
  return map[r] || 'bg-gray-300';
}

// ── sub-components ────────────────────────────────────────────────────────────

function HBar({ name, pct, count, color = 'bg-indigo-500', maxPct = 100 }) {
  const w = Math.max(2, (pct / maxPct) * 100);
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-44 text-xs text-gray-600 shrink-0 text-right leading-tight">{name}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div className={`${color} h-full rounded-full flex items-center justify-end px-2 transition-all`}
          style={{ width: `${w}%` }}>
          {pct >= 8 && <span className="text-white text-[10px] font-semibold">{pct.toFixed(1)}%</span>}
        </div>
      </div>
      {pct < 8 && <span className="text-xs text-gray-500 w-10 shrink-0">{pct.toFixed(1)}%</span>}
      <span className="text-xs text-gray-400 w-7 shrink-0 text-right">{count}</span>
    </div>
  );
}

function SectionCard({ title, children, accent = 'border-indigo-400' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden`}>
      <div className={`px-5 py-3 border-b border-gray-100 border-l-4 ${accent}`}>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

function StatCard({ label, value, sub, color = 'bg-indigo-50 text-indigo-700' }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}

function RatingStack({ label, ratings, total }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-600 mb-2">{label}</div>
      <div className="flex h-8 rounded-lg overflow-hidden gap-0.5">
        {ratings.map(({ r, n }) => {
          const pct = total ? (n / total) * 100 : 0;
          return (
            <div key={r} className={`${ratingColor(r)} flex items-center justify-center relative group transition-all`}
              style={{ width: `${pct}%` }} title={`Rating ${r}: ${n} (${pct.toFixed(0)}%)`}>
              {pct >= 10 && <span className="text-white text-[10px] font-bold">{r}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-1.5 flex-wrap">
        {ratings.filter(r => r.n > 0).map(({ r, n }) => (
          <span key={r} className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className={`w-2 h-2 rounded-full inline-block ${ratingColor(r)}`} />
            {r}★ — {n} ({total ? ((n / total) * 100).toFixed(0) : 0}%)
          </span>
        ))}
      </div>
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────────────────

function OverviewTab({ d }) {
  const totalCo = d.cocurricular.reduce((s, x) => s + x.count, 0);
  const totalImp = d.areasOfImprovement.reduce((s, x) => s + x.count, 0);
  const avgGrade = d.gradeSatisfaction.length
    ? (d.gradeSatisfaction.reduce((s, g) => s + g.academic + g.teaching + g.gaps, 0) / (d.gradeSatisfaction.length * 3)).toFixed(2)
    : '-';
  const topCo = [...d.cocurricular].sort((a, b) => b.count - a.count)[0];
  const topImp = [...d.areasOfImprovement].sort((a, b) => b.count - a.count)[0];
  const topSat = [...d.satisfactionAreas].sort((a, b) => b.pct - a.pct)[0];
  const satisfiedPct = d.remarks.find(r => r.name.startsWith('None'))?.pct || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Avg. Grade Satisfaction" value={avgGrade} sub="out of 5" color="bg-indigo-50 text-indigo-700" />
        <StatCard label="Top Co-curricular" value={topCo?.name} sub={`${topCo?.pct.toFixed(0)}% prefer`} color="bg-violet-50 text-violet-700" />
        <StatCard label="Top Area to Improve" value={topImp?.name} sub={`${topImp?.pct.toFixed(0)}% flagged`} color="bg-amber-50 text-amber-700" />
        <StatCard label="Parents Satisfied" value={`${satisfiedPct.toFixed(0)}%`} sub="no concerns raised" color="bg-green-50 text-green-700" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Top Satisfaction Areas" accent="border-l-green-400">
          {d.satisfactionAreas.map(x => (
            <HBar key={x.area} name={x.area} pct={x.pct} count={x.count} color="bg-green-500"
              maxPct={Math.max(...d.satisfactionAreas.map(i => i.pct))} />
          ))}
        </SectionCard>
        <SectionCard title="Parent Remarks / Feedback Tags" accent="border-l-violet-400">
          {d.remarks.filter(r => r.count > 0).map(x => (
            <HBar key={x.name} name={x.name} pct={x.pct} count={x.count}
              color={x.name.startsWith('None') ? 'bg-green-500' : 'bg-violet-500'}
              maxPct={Math.max(...d.remarks.map(i => i.pct))} />
          ))}
        </SectionCard>
      </div>

      {/* Academic Priorities (Marathalli / HSR) */}
      {d.academicPriorities && (
        <SectionCard title="Key Academic Priorities" accent="border-l-blue-400">
          <div className="grid sm:grid-cols-2 gap-x-6">
            {d.academicPriorities.map(x => (
              <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-blue-500"
                maxPct={Math.max(...d.academicPriorities.map(i => i.pct))} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function CoCurricularTab({ d }) {
  const maxCo = Math.max(...d.cocurricular.map(x => x.pct));
  const maxAc = Math.max(...d.academicFocus.map(x => x.pct));
  const maxImp = Math.max(...d.areasOfImprovement.map(x => x.pct));
  const maxSub = Math.max(...d.subjects.map(x => x.pct));
  const maxAct = Math.max(...d.activities.map(x => x.pct));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Co-curricular Activity Preferences" accent="border-l-indigo-400">
          {[...d.cocurricular].sort((a, b) => b.pct - a.pct).filter(x => x.count > 0).map(x => (
            <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-indigo-500" maxPct={maxCo} />
          ))}
        </SectionCard>
        <SectionCard title="Academic Focus Areas" accent="border-l-blue-400">
          {[...d.academicFocus].sort((a, b) => b.pct - a.pct).map(x => (
            <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-blue-500" maxPct={maxAc} />
          ))}
        </SectionCard>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Areas of Improvement" accent="border-l-amber-400">
          {[...d.areasOfImprovement].sort((a, b) => b.pct - a.pct).filter(x => x.count > 0).map(x => (
            <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-amber-500" maxPct={maxImp} />
          ))}
        </SectionCard>
        <div className="space-y-4">
          <SectionCard title="Subject Preferences" accent="border-l-teal-400">
            {[...d.subjects].sort((a, b) => b.pct - a.pct).map(x => (
              <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-teal-500" maxPct={maxSub} />
            ))}
          </SectionCard>
          <SectionCard title="Activity Preferences" accent="border-l-pink-400">
            {[...d.activities].sort((a, b) => b.pct - a.pct).map(x => (
              <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-pink-500" maxPct={maxAct} />
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function GradeSatisfactionTab({ d }) {
  const allGrades = [...d.gradeSatisfaction];
  if (d.ppG9G12?.gradeSatisfaction) allGrades.push(...d.ppG9G12.gradeSatisfaction);

  return (
    <div className="space-y-4">
      <SectionCard title="Grade-wise Satisfaction Scores (out of 5)" accent="border-l-purple-400">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-semibold">Grade</th>
                <th className="text-center py-2 px-3 font-semibold">Academic Standards</th>
                <th className="text-center py-2 px-3 font-semibold">Teaching Quality</th>
                <th className="text-center py-2 px-3 font-semibold">Learning Gaps</th>
                <th className="text-center py-2 px-3 font-semibold">Avg</th>
              </tr>
            </thead>
            <tbody>
              {allGrades.map((g) => {
                const avg = ((g.academic + g.teaching + g.gaps) / 3).toFixed(2);
                return (
                  <tr key={g.grade} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 pr-4 font-medium text-gray-800 whitespace-nowrap">{g.grade}</td>
                    {[g.academic, g.teaching, g.gaps].map((v, i) => (
                      <td key={i} className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className={`${scoreBg(v)} h-full rounded-full`} style={{ width: `${(v / 5) * 100}%` }} />
                          </div>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${scoreColor(v)}`}>{v.toFixed(2)}</span>
                        </div>
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${scoreColor(parseFloat(avg))}`}>{avg}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-gray-400">
          {[['bg-green-500','≥ 4.0 Excellent'],['bg-blue-500','≥ 3.5 Good'],['bg-amber-400','≥ 3.0 Average'],['bg-red-400','< 3.0 Needs Improvement']].map(([c,l])=>(
            <span key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c}`}/>{l}</span>
          ))}
        </div>
      </SectionCard>

      {/* G9-G12 STEM + Academic Priorities */}
      {d.ppG9G12 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <SectionCard title="G9-G12 Key Academic Priorities" accent="border-l-indigo-400">
            {d.ppG9G12.academicPriorities.map(x => (
              <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-indigo-500"
                maxPct={Math.max(...d.ppG9G12.academicPriorities.map(i => i.pct))} />
            ))}
          </SectionCard>
          <SectionCard title="G9-G12 STEM Program Interest" accent="border-l-violet-400">
            {d.ppG9G12.stemPrograms.map(x => (
              <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-violet-500"
                maxPct={Math.max(...d.ppG9G12.stemPrograms.map(i => i.pct))} />
            ))}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function PPReportTab({ d }) {
  const pp6 = d.ppG6G8;
  const pp9 = d.ppG9G12;

  return (
    <div className="space-y-4">
      {/* G6-G8 */}
      {pp6 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Grades 6 – 8  ·  {pp6.total} responses
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <SectionCard title="Teacher Knowledge & Effectiveness" accent="border-l-indigo-400">
              <RatingStack label="Rating Distribution (1–5)" ratings={pp6.teacherKnowledge} total={pp6.total} />
            </SectionCard>
            <SectionCard title="Doubt-Solving & Academic Support" accent="border-l-blue-400">
              <RatingStack label="Rating Distribution (1–5)" ratings={pp6.doubtSolving} total={pp6.total} />
            </SectionCard>
            <SectionCard title="Academic Rigor & Challenge" accent="border-l-teal-400">
              <RatingStack label="Rating Distribution (1–5)" ratings={pp6.academicRigor} total={pp6.total} />
            </SectionCard>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <SectionCard title="G6-G8 Parent Feedback Tags" accent="border-l-violet-400">
              {pp6.nTagging.map(x => (
                <HBar key={x.name} name={x.name} pct={x.pct} count={x.count}
                  color={x.name === 'None' ? 'bg-green-500' : 'bg-violet-500'}
                  maxPct={Math.max(...pp6.nTagging.map(i => i.pct))} />
              ))}
            </SectionCard>
            <SectionCard title="G6-G8 Areas of Improvement" accent="border-l-amber-400">
              {pp6.improvements.map(x => (
                <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-amber-500"
                  maxPct={Math.max(...pp6.improvements.map(i => i.pct))} />
              ))}
            </SectionCard>
          </div>
        </div>
      )}

      {/* G9-G12 */}
      {pp9 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Grades 9 – 12
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard title="Academic Priorities" accent="border-l-orange-400">
              {pp9.academicPriorities.map(x => (
                <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-orange-500"
                  maxPct={Math.max(...pp9.academicPriorities.map(i => i.pct))} />
              ))}
            </SectionCard>
            <SectionCard title="STEM Program Interest" accent="border-l-rose-400">
              {pp9.stemPrograms.map(x => (
                <HBar key={x.name} name={x.name} pct={x.pct} count={x.count} color="bg-rose-500"
                  maxPct={Math.max(...pp9.stemPrograms.map(i => i.pct))} />
              ))}
            </SectionCard>
          </div>
        </div>
      )}

      {!pp6 && !pp9 && (
        <div className="text-center py-12 text-gray-400 text-sm">No PP Report data available for this school.</div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SurveyFeedback() {
  const [school, setSchool] = useState('JPS');
  const [tab, setTab] = useState(0);

  const d = SURVEY_DATA[school];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-600" /> Survey Form: Parents Feedback
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Analysis of parent survey responses by school</p>
        </div>
        {/* School selector */}
        <div className="relative">
          <select
            value={school}
            onChange={e => { setSchool(e.target.value); setTab(0); }}
            className="text-sm border border-gray-300 rounded-xl px-4 py-2 bg-white appearance-none pr-8 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {SCHOOLS.map(k => <option key={k} value={k}>{SURVEY_DATA[k].label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === i ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 0 && <OverviewTab d={d} />}
      {tab === 1 && <CoCurricularTab d={d} />}
      {tab === 2 && <GradeSatisfactionTab d={d} />}
      {tab === 3 && <PPReportTab d={d} />}
    </div>
  );
}
