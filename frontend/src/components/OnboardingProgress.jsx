import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const PATH_META = {
  M: { label: 'Central',      bg: 'bg-slate-100',   text: 'text-slate-700',   dot: 'bg-slate-500',   border: 'border-slate-300' },
  A: { label: 'School Visit', bg: 'bg-cyan-50',     text: 'text-cyan-700',    dot: 'bg-cyan-500',    border: 'border-cyan-200' },
  B: { label: 'Procurement',  bg: 'bg-green-50',    text: 'text-green-700',   dot: 'bg-green-500',   border: 'border-green-200' },
  C: { label: 'Legal/Mktg',   bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-500',  border: 'border-indigo-200' },
  D: { label: 'Branch',       bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-500',  border: 'border-violet-200' },
};

const STEPS = [
  { id: 's1',  num: '01', path: 'M', label: 'Step 1 · Acads',        title: 'Stakeholder Introduction',        dept: 'Academic Expansion',      sub: 'Central Academic Impl.',     after: [] },
  { id: 's2a', num: '2.1', path: 'A', label: 'Step 2.1 · Acads',      title: 'School Visit & Assessment',       dept: 'Academic Expansion',      sub: 'School Operations',          after: ['s1'] },
  { id: 's2b', num: '2.2', path: 'B', label: 'Step 2.2 · Procurement', title: 'Books & Uniform Procurement',     dept: 'Procurement Dept.',       sub: 'Central Procurement',        after: ['s1'] },
  { id: 's2c', num: '2.3', path: 'C', label: 'Step 2.3 · Legal',       title: 'Legal – Name Change',             dept: 'Legal Team',              sub: 'Compliance & Registrations', after: ['s1'] },
  { id: 's2d', num: '2.4', path: 'D', label: 'Step 2.4 · Branch',      title: 'Branch Onboarding',               dept: 'Branch Operations',       sub: 'Academic Config.',           after: ['s1'] },
  { id: 's3',  num: '03', path: 'A', label: 'Step 3 · Data',           title: 'Data Preparation',                dept: 'Finance & Data',          sub: 'Central Data Mgmt.',         after: ['s2a', 's2b', 's2c', 's2d'] },
  { id: 's4',  num: '04', path: 'A', label: 'Step 4 · Parents',        title: 'Parents Orientation',             dept: 'Parent Relations',        sub: 'Community Engagement',       after: ['s3'] },
  { id: 's5',  num: '05', path: 'A', label: 'Step 5 · Feedback',       title: 'Survey Form',                     dept: 'Quality & Feedback',      sub: 'Central Quality Team',       after: ['s4'] },
  { id: 's7',  num: '07', path: 'D', label: 'Step 7 · Acads',          title: 'Student Onboarding',              dept: 'Academic Expansion',      sub: 'Student Onboarding',         after: ['s2d'] },
  { id: 's8',  num: '08', path: 'A', label: 'Step 8 · Acads',          title: 'Teacher 1-on-1 & Final List',     dept: 'Academic Expansion',      sub: 'Teacher Engagement',         after: ['s5'] },
  { id: 's9',  num: '09', path: 'C', label: 'Step 9 · Marketing',      title: 'Marketing – Print & Digital',     dept: 'Marketing Department',    sub: 'Brand & Digital Team',       after: ['s2c'] },
  { id: 's10', num: '10', path: 'C', label: 'Step 10 · HR',            title: 'Sales & Admin Hiring',            dept: 'HR & Talent Acquisition', sub: 'Sales & Admin Hiring',       after: ['s9'] },
  { id: 's12', num: '12', path: 'D', label: 'Step 12 · HR',            title: 'Staff Onboarding',                dept: 'HR Department',           sub: 'Staff Onboarding',           after: ['s7'] },
  { id: 's13', num: '13', path: 'A', label: 'Step 13 · Admin',         title: 'Inventory List',                  dept: 'Administration',          sub: 'Inventory & Assets',         after: ['s8'] },
  { id: 's14', num: '14', path: 'A', label: 'Step 14 · Projects',      title: 'Project & Infra Finalisation',    dept: 'Projects & Infra',        sub: 'Project Planning',           after: ['s13'] },
  { id: 's15', num: '15', path: 'B', label: 'Step 15 · Procurement',   title: 'Teacher Books & Sample Uniform',  dept: 'Academic Expansion',      sub: 'Procurement Coord.',         after: ['s2b'] },
  { id: 's16', num: '16', path: 'A', label: 'Step 16 · Acads',         title: 'BLA Exam',                        dept: 'Academic Expansion',      sub: 'Assessment & Evaluation',    after: ['s14'] },
  { id: 's17', num: '17', path: 'A', label: 'Step 17 · CRM',           title: 'Retention Project',               dept: 'Academic & CRM',          sub: 'Retention Cell',             after: ['s16'] },
  { id: 's18', num: '18', path: 'D', label: 'Step 18 · Finance',       title: 'Fee Mapping & Promotion',         dept: 'Finance & Marketing',     sub: 'Fee Planning',               after: ['s12'] },
  { id: 's20', num: '20', path: 'A', label: 'Step 20 · HR / TA',       title: 'Teacher Hiring',                  dept: 'HR – Talent Acquisition', sub: 'Teacher Recruitment',        after: ['s17', 's18'] },
  { id: 's21', num: '21', path: 'A', label: 'Step 21 · Ops',           title: 'Template Finalisation & Sharing', dept: 'Operations',              sub: 'Template & Process',         after: ['s20'] },
  { id: 's22', num: '22', path: 'B', label: 'Step 22 · Procurement',   title: 'Clicker & Inventory Tagging',     dept: 'Procurement & IT',        sub: 'Asset Tagging',              after: ['s15'] },
  { id: 's23', num: '23', path: 'A', label: 'Step 23 · Acads',         title: 'Bridge Course',                   dept: 'Academic Expansion',      sub: 'Curriculum & Delivery',      after: ['s21'] },
  { id: 's24', num: '24', path: 'A', label: 'Step 24 · Acads',         title: 'Subject Training',                dept: 'Academic Expansion',      sub: 'Training & Development',     after: ['s23'] },
  { id: 's25', num: '25', path: 'A', label: 'Step 25 · All Depts',     title: 'Preparation for 1st Day Opening', dept: 'All Departments',         sub: 'Central Coordination',       after: ['s24'] },
];

const TOTAL = STEPS.length;

export default function OnboardingProgress() {
  const [done, setDone] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('onboarding_done') || '[]')); }
    catch { return new Set(); }
  });

  function toggle(id) {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('onboarding_done', JSON.stringify([...next]));
      return next;
    });
  }

  function unlocked(step) {
    return step.after.every(id => done.has(id));
  }

  const doneCount = done.size;
  const pct = Math.round((doneCount / TOTAL) * 100);

  const pathCounts = Object.fromEntries(
    Object.keys(PATH_META).map(p => [
      p,
      { total: STEPS.filter(s => s.path === p).length, done: STEPS.filter(s => s.path === p && done.has(s.id)).length },
    ])
  );

  return (
    <div className="space-y-5">
      {/* Header progress */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">School Onboarding Tracker</h2>
            <p className="text-xs text-gray-400 mt-0.5">M&amp;A handover → full operational readiness</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{doneCount}<span className="text-sm font-normal text-gray-400">/{TOTAL}</span></div>
              <div className="text-xs text-gray-400">Steps complete</div>
            </div>
            <div className="w-24 h-24 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={pct === 100 ? '#16a34a' : '#4f46e5'}
                  strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{pct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Path legend chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(PATH_META).map(([key, m]) => (
            <div key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${m.bg} ${m.text} ${m.border}`}>
              <span className={`w-2 h-2 rounded-full ${m.dot}`} />
              {m.label}
              <span className="opacity-60 font-normal">{pathCounts[key]?.done}/{pathCounts[key]?.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">Step</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Path</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[220px]">Title</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[180px]">Department</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[180px]">Sub-team</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Depends on</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-20">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {STEPS.map(step => {
                const isDone = done.has(step.id);
                const isLocked = !unlocked(step);
                const m = PATH_META[step.path];
                const dependsOnSteps = step.after.map(id => STEPS.find(s => s.id === id)?.num).filter(Boolean);

                return (
                  <tr
                    key={step.id}
                    className={`transition-colors ${
                      isDone ? 'bg-green-50/50' : isLocked ? 'opacity-50 bg-gray-50/30' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    {/* Step # */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${m.bg} ${m.text}`}>
                        {step.num}
                      </span>
                    </td>

                    {/* Path badge */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${m.bg} ${m.text} ${m.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                        {m.label}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-2.5">
                      <div className={`font-medium ${isDone ? 'text-green-700 line-through decoration-green-400' : 'text-gray-800'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{step.label}</div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{step.dept}</td>

                    {/* Sub-team */}
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{step.sub}</td>

                    {/* Depends on */}
                    <td className="px-4 py-2.5">
                      {dependsOnSteps.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {dependsOnSteps.map(n => (
                            <span key={n} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">{n}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">Start</span>
                      )}
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => !isLocked && toggle(step.id)}
                        disabled={isLocked}
                        title={isLocked ? 'Complete previous steps first' : isDone ? 'Mark as pending' : 'Mark as done'}
                        className={`transition-transform ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                      >
                        {isDone
                          ? <CheckCircle2 size={22} className="text-green-500" />
                          : <Circle size={22} className={isLocked ? 'text-gray-200' : 'text-gray-300 hover:text-indigo-400'} />
                        }
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer reset */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="text-xs text-gray-400">{TOTAL - doneCount} steps remaining</span>
          {doneCount > 0 && (
            <button
              onClick={() => {
                setDone(new Set());
                localStorage.removeItem('onboarding_done');
              }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Reset all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
