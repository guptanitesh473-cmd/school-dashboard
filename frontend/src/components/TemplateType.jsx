import { useState } from 'react';
import { Languages } from 'lucide-react';
import { TEMPLATE_DEFS, TEMPLATE_SCHOOLS } from './templateData';

// ── colour maps ──────────────────────────────────────────────────────────────
const BADGE = {
  1: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  2: 'bg-blue-100   text-blue-700   border border-blue-200',
  3: 'bg-purple-100 text-purple-700 border border-purple-200',
  4: 'bg-violet-100 text-violet-700 border border-violet-200',
  bilingual: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const LEGEND_BG = {
  1: 'bg-indigo-50 border-indigo-200',
  2: 'bg-blue-50   border-blue-200',
  3: 'bg-purple-50 border-purple-200',
  4: 'bg-violet-50 border-violet-200',
};
const LEGEND_TEXT = {
  1: 'text-indigo-700',
  2: 'text-blue-700',
  3: 'text-purple-700',
  4: 'text-violet-700',
};

function TypeBadge({ t }) {
  if (t === 'bilingual') {
    return (
      <span className={`${BADGE.bilingual} text-[11px] font-semibold px-2 py-0.5 rounded-full`}>
        Bilingual
      </span>
    );
  }
  return (
    <span className={`${BADGE[t]} text-[11px] font-semibold px-2 py-0.5 rounded-full`}>
      T{t}
    </span>
  );
}

// ── summary stats ─────────────────────────────────────────────────────────────
function countSchoolsWithType(type) {
  return TEMPLATE_SCHOOLS.filter(s =>
    s.grades.some(g => g.types.includes(type))
  ).length;
}

// ── main component ────────────────────────────────────────────────────────────
export default function TemplateType() {
  const [zoneFilter, setZoneFilter] = useState('All');

  const zones = ['All', ...new Set(TEMPLATE_SCHOOLS.map(s => s.zone))];

  const filtered =
    zoneFilter === 'All'
      ? TEMPLATE_SCHOOLS
      : TEMPLATE_SCHOOLS.filter(s => s.zone === zoneFilter);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Template Type</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Language template assignment per school — Bangalore Zone
        </p>
      </div>

      {/* Template legend */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Languages size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-gray-800">Template Definitions</span>
          <span className="text-xs text-gray-400 ml-1">(L1 = Mother tongue, L2 = Second language, L3 = Third language)</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATE_DEFS.map(t => (
            <div
              key={t.id}
              className={`rounded-xl border p-3 ${LEGEND_BG[t.id]}`}
            >
              <div className={`font-bold text-sm ${LEGEND_TEXT[t.id]}`}>
                Template {t.id}
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-gray-700">
                <div><span className="font-medium w-6 inline-block">L1:</span> {t.l1}</div>
                <div><span className="font-medium w-6 inline-block">L2:</span> {t.l2}</div>
                <div><span className="font-medium w-6 inline-block">L3:</span> {t.l3}</div>
              </div>
            </div>
          ))}
        </div>

        {/* quick counts */}
        <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          {[1, 2, 3, 4].map(n => (
            <span key={n} className={`${BADGE[n]} text-xs px-3 py-1 rounded-full`}>
              T{n} — {countSchoolsWithType(n)} schools
            </span>
          ))}
          <span className={`${BADGE.bilingual} text-xs px-3 py-1 rounded-full`}>
            Bilingual — {TEMPLATE_SCHOOLS.filter(s => s.grades.some(g => g.types.includes('bilingual'))).length} schools
          </span>
        </div>
      </div>

      {/* Zone filter */}
      <div className="flex gap-2 flex-wrap">
        {zones.map(z => (
          <button
            key={z}
            onClick={() => setZoneFilter(z)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              zoneFilter === z
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Languages size={15} className="text-indigo-600" />
          <span className="font-semibold text-sm text-gray-800">School Templates</span>
          <span className="ml-1 text-xs text-gray-400">({filtered.length} schools)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[220px]">School Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[130px]">Zone</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type of Template</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((school, idx) => (
                <tr key={school.name} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{school.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{school.zone}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      {school.grades.map((g, gi) => (
                        <div key={gi} className="flex items-center gap-1.5">
                          {gi > 0 && (
                            <span className="text-gray-200 select-none">|</span>
                          )}
                          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                            {g.range}:
                          </span>
                          <div className="flex gap-1">
                            {g.types.map(t => (
                              <TypeBadge key={t} t={t} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400">
        * G4 is an L1-introduction year (Kannada/Hindi L1 only, no L2/L3 yet). French as L2 or L3 begins from Grade 5.
        "Bilingual" indicates Kannada+Hindi only with no French offering.
      </p>
    </div>
  );
}
