import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1mRxQfV8t1csQsxQkt9ACBRU5Kl7qvEGkry_pKQ8NSfY/gviz/tq?tqx=out:csv&sheet=Report';

// ── CSV parser ──────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      row.push(field.trim()); field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQ) {
      row.push(field.trim()); rows.push(row);
      row = []; field = '';
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else {
      field += ch;
    }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows.filter(r => r.some(Boolean));
}

// ── Sheet parser ────────────────────────────────────────────────────────────
function parseSheet(rows) {
  const nameRow = rows[0];

  // Build schools array from row 0 (starting at col 2)
  const schools = [];
  let i = 2;
  while (i < nameRow.length) {
    if (nameRow[i]) {
      const raw = nameRow[i];
      const isNew = /new building/i.test(raw);
      const note = /hold/i.test(raw) ? 'Hold' : /not this year/i.test(raw) ? 'Not This Year' : '';
      const name = raw
        .replace(/-?\s*New building.*/gi, '')
        .replace(/ Not This Year.*/gi, '')
        .replace(/-?\s*Hold.*/gi, '')
        .trim();
      // Detect span by counting consecutive empty cells after this one
      let span = 1;
      while (i + span < nameRow.length && !nameRow[i + span]) span++;
      span = Math.min(span, 4);
      schools.push({ name, raw, type: isNew ? 'new_building' : 'existing', note, startCol: i, span });
      i += span;
    } else {
      i++;
    }
  }

  // Parse data rows (rows 2+, row 1 is the sub-header)
  const catMap = {};
  const catOrder = [];

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    const category = row[0] || '';
    const offering = row[1] || '';
    if (!offering) continue;

    const key = category || '__other__';
    if (!catMap[key]) { catMap[key] = { name: category, offerings: [] }; catOrder.push(key); }

    const data = schools.map(s => ({
      status:      row[s.startCol]         || '',
      condition:   s.span >= 2 ? (row[s.startCol + 1] || '') : '',
      projectTeam: s.span >= 3 ? (row[s.startCol + 2] || '') : '',
      procurement: s.span >= 4 ? (row[s.startCol + 3] || '') : '',
    }));

    catMap[key].offerings.push({ name: offering, data });
  }

  return { schools, categories: catOrder.map(k => catMap[k]) };
}

// ── Status styling ──────────────────────────────────────────────────────────
const S_BADGE = {
  Yes:       'bg-green-100 text-green-800 border-green-300',
  No:        'bg-red-100 text-red-700 border-red-300',
  'In Future': 'bg-amber-100 text-amber-700 border-amber-300',
};
const S_ROW = {
  Yes:       'bg-green-50/40',
  No:        'bg-red-50/40',
  'In Future': 'bg-amber-50/40',
};

const CAT_COLORS = [
  'bg-emerald-600', 'bg-blue-600', 'bg-violet-600',
  'bg-pink-600',    'bg-orange-600', 'bg-teal-600',
];

// ── Main component ──────────────────────────────────────────────────────────
export default function ReportView() {
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [selectedSchools, setSelectedSchools] = useState(null); // null = not yet init
  const [catFilter, setCatFilter] = useState('all');

  const load = () => {
    setLoading(true); setError('');
    fetch(SHEET_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(text => {
        const parsed = parseSheet(parseCSV(text));
        setSheetData(parsed);
        if (!selectedSchools) {
          // Default: first 5 existing schools
          const defaults = parsed.schools.filter(s => s.type === 'existing').slice(0, 5).map(s => s.name);
          setSelectedSchools(defaults);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const visibleSchools = useMemo(() => {
    if (!sheetData || !selectedSchools) return [];
    return sheetData.schools.filter(s => selectedSchools.includes(s.name));
  }, [sheetData, selectedSchools]);

  const visibleCats = useMemo(() => {
    if (!sheetData) return [];
    return catFilter === 'all'
      ? sheetData.categories
      : sheetData.categories.filter(c => c.name === catFilter);
  }, [sheetData, catFilter]);

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
    </div>
  );
  if (error) return (
    <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm">
      Failed to load: {error}
      <button onClick={load} className="ml-3 underline">Retry</button>
    </div>
  );
  if (!sheetData || !selectedSchools) return null;

  const { schools, categories } = sheetData;
  const schoolIdx = Object.fromEntries(schools.map((s, i) => [s.name, i]));

  const toggle  = n => setSelectedSchools(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);
  const selType = t => setSelectedSchools(schools.filter(s => t === 'all' || s.type === t).map(s => s.name));

  return (
    <div className="space-y-3">
      {/* School picker */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 mr-1">Filter:</span>
          {[['all','All'],['existing','Existing'],['new_building','New Building']].map(([v, l]) => (
            <button key={v} onClick={() => selType(v)}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              {l}
            </button>
          ))}
          <span className="text-gray-300 mx-1">|</span>
          <button onClick={() => setSelectedSchools(schools.map(s => s.name))} className="text-xs text-indigo-600 hover:underline">All</button>
          <button onClick={() => setSelectedSchools([])} className="text-xs text-gray-400 hover:underline">None</button>
          <button onClick={load} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {schools.map(s => {
            const sel = selectedSchools.includes(s.name);
            return (
              <button key={s.name} onClick={() => toggle(s.name)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  sel
                    ? s.type === 'existing'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                {s.name.replace(/^OIS |^OCSE /, '')}
                {s.note && <span className="ml-1 opacity-60 text-[10px]">({s.note})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-500 font-medium">Category:</span>
        <button onClick={() => setCatFilter('all')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${catFilter==='all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>
          All
        </button>
        {categories.filter(c => c.name).map((c, ci) => (
          <button key={c.name} onClick={() => setCatFilter(c.name)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${catFilter===c.name ? `${CAT_COLORS[ci % CAT_COLORS.length]} text-white border-transparent` : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {visibleSchools.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          Select one or more schools above to view data
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse" style={{ minWidth: `${280 + visibleSchools.reduce((a,s)=>a+(s.span*110),0)}px` }}>
              <thead>
                {/* Row 1: school names */}
                <tr className="bg-slate-800 text-white">
                  <th className="sticky left-0 z-20 bg-slate-800 px-3 py-2.5 text-left border-r border-slate-600 w-[130px] font-semibold text-[11px]">
                    Category
                  </th>
                  <th className="sticky left-[130px] z-20 bg-slate-800 px-3 py-2.5 text-left border-r border-slate-600 w-[150px] font-semibold text-[11px]">
                    Offerings
                  </th>
                  {visibleSchools.map(s => (
                    <th key={s.name} colSpan={s.span}
                      className="px-3 py-2 text-center border-r border-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-[11px]">{s.name.replace(/^OIS |^OCSE /, '')}</div>
                      {s.note && <div className="text-[9px] text-slate-300 font-normal">{s.note}</div>}
                      <div className={`text-[9px] font-normal mt-0.5 ${s.type === 'existing' ? 'text-slate-400' : 'text-teal-300'}`}>
                        {s.type === 'existing' ? 'Existing' : 'New Building'}
                      </div>
                    </th>
                  ))}
                </tr>
                {/* Row 2: sub-column headers */}
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-gray-600 font-semibold">
                  <th className="sticky left-0 z-20 bg-slate-100 border-r border-gray-200 px-3 py-1.5"></th>
                  <th className="sticky left-[130px] z-20 bg-slate-100 border-r border-gray-200 px-3 py-1.5"></th>
                  {visibleSchools.map(s => (
                    <React.Fragment key={s.name}>
                      <th className="px-2 py-1.5 text-center border-r border-gray-200 w-[64px]">Status</th>
                      {s.span >= 2 && <th className="px-2 py-1.5 text-left border-r border-gray-200 min-w-[120px]">Condition</th>}
                      {s.span >= 3 && <th className="px-2 py-1.5 text-left border-r border-gray-200 min-w-[110px]">Project Team</th>}
                      {s.span >= 4 && <th className="px-2 py-1.5 text-left border-r border-gray-200 min-w-[110px]">Procurement</th>}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCats.map((cat, ci) =>
                  cat.offerings.map((off, oi) => (
                    <tr key={`${cat.name}-${off.name}-${oi}`}
                      className={`border-b border-gray-100 hover:bg-indigo-50/30 ${oi===0 && ci>0 ? 'border-t-2 border-t-gray-300' : ''}`}>
                      {oi === 0 && (
                        <td rowSpan={cat.offerings.length}
                          className="sticky left-0 z-10 bg-white px-2 py-2 border-r border-gray-200 align-middle">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white leading-tight ${CAT_COLORS[ci % CAT_COLORS.length]}`}>
                            {cat.name || 'Other'}
                          </span>
                        </td>
                      )}
                      <td className="sticky left-[130px] z-10 bg-white px-3 py-2 font-medium text-gray-800 border-r border-gray-100 whitespace-nowrap">
                        {off.name}
                      </td>
                      {visibleSchools.map(s => {
                        const d = off.data[schoolIdx[s.name]] || {};
                        return (
                          <React.Fragment key={s.name}>
                            <td className={`px-1.5 py-2 text-center border-r border-gray-100 ${S_ROW[d.status] || ''}`}>
                              {d.status
                                ? <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-semibold ${S_BADGE[d.status] || 'bg-gray-50 text-gray-400 border-gray-200'}`}>{d.status}</span>
                                : <span className="text-gray-200">—</span>
                              }
                            </td>
                            {s.span >= 2 && (
                              <td className="px-2 py-2 text-gray-600 border-r border-gray-100 text-[10px] leading-snug align-top">
                                {d.condition}
                              </td>
                            )}
                            {s.span >= 3 && (
                              <td className="px-2 py-2 text-gray-500 border-r border-gray-100 text-[10px] leading-snug align-top">
                                {d.projectTeam}
                              </td>
                            )}
                            {s.span >= 4 && (
                              <td className="px-2 py-2 text-gray-500 border-r border-gray-200 text-[10px] leading-snug align-top">
                                {d.procurement}
                              </td>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex gap-5 px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            {[['Yes','bg-green-100 text-green-800 border border-green-300'],
              ['No','bg-red-100 text-red-700 border border-red-300'],
              ['In Future','bg-amber-100 text-amber-700 border border-amber-300']
            ].map(([l, cls]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls}`}>{l}</span>
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
