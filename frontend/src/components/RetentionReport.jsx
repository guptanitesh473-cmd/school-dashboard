import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

const HESARGHATTA = 'OIS Hesarghatta';
const KELAMBAKKAM = 'OIS Kelambakkam';

function pctColor(pct) {
  const n = parseFloat(pct);
  if (isNaN(n)) return '';
  if (n === 0) return 'text-green-600 font-semibold';
  if (n <= 15) return 'text-amber-600';
  if (n <= 30) return 'text-orange-600';
  return 'text-red-600 font-semibold';
}

export default function RetentionReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editCell, setEditCell] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getRetentionDetail().then(setData).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async (field, value) => {
    if (!editCell) return;
    await api.updateRetentionDetail(editCell.id, { [field]: value === '' ? 0 : Number(value) });
    setEditCell(null);
    load();
  };

  if (loading) return <Spinner />;
  if (!data) return null;

  const { schools, summary } = data;
  const retPct = summary.total_students > 0
    ? ((summary.total_interested / summary.total_students) * 100).toFixed(2) : 0;
  const ytdPct = summary.total_students > 0
    ? ((summary.total_yet_to_decide / summary.total_students) * 100).toFixed(2) : 0;
  const niPct = summary.total_students > 0
    ? ((summary.total_not_interested / summary.total_students) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-4">
      {/* Overall summary banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Students" value={summary.total_students} color="bg-indigo-600" />
        <SummaryCard label={`Retained / Interested`} value={`${summary.total_interested}`} sub={`${retPct}%`} color="bg-green-600" />
        <SummaryCard label="Yet to Decide" value={`${summary.total_yet_to_decide}`} sub={`${ytdPct}%`} color="bg-amber-500" />
        <SummaryCard label="Not Interested" value={`${summary.total_not_interested}`} sub={`${niPct}%`} color="bg-red-500" />
      </div>

      {/* Per-school tables */}
      {schools.map(({ school_name, rows }) => {
        const isHesarghatta = school_name === HESARGHATTA;
        const isKelambakkam = school_name === KELAMBAKKAM;

        return (
          <div key={school_name} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* School header */}
            <div className="px-5 py-3 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-wide">{school_name}</h3>
              {!isHesarghatta && (() => {
                const grand = rows.find(r => r.is_grand_total);
                if (!grand) return null;
                const pct = grand.total_strength > 0
                  ? ((grand.interested / grand.total_strength) * 100).toFixed(0) : 0;
                return (
                  <div className="flex items-center gap-4 text-xs text-indigo-100">
                    <span>Total: <strong className="text-white">{grand.total_strength}</strong></span>
                    <span>Interested: <strong className="text-green-300">{grand.interested} ({pct}%)</strong></span>
                    <span>Not Int.: <strong className="text-red-300">{grand.not_interested} ({grand.pct_not_interested})</strong></span>
                  </div>
                );
              })()}
            </div>

            <div className="overflow-x-auto">
              {isHesarghatta ? (
                /* Hesarghatta: different columns */
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                      <th className="px-4 py-2.5 text-left">Grade</th>
                      <th className="px-4 py-2.5 text-center bg-green-50 text-green-700">Continuation</th>
                      <th className="px-4 py-2.5 text-center bg-red-50 text-red-700">Discontinuation</th>
                      <th className="px-4 py-2.5 text-center">% Discontinuation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id} className={`border-b border-gray-50 ${row.is_grand_total ? 'bg-gray-100 font-semibold border-t-2 border-gray-300' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-2 text-gray-700 font-medium">{row.grade_current}</td>
                        <EditableCell row={row} field="interested" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-green-700 bg-green-50/30" />
                        <EditableCell row={row} field="not_interested" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-red-600 bg-red-50/30" />
                        <td className={`px-4 py-2 text-center text-xs ${pctColor(row.pct_not_interested)}`}>{row.pct_not_interested || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* Standard table */
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                      <th className="px-3 py-2.5 text-center w-10">S.No</th>
                      <th className="px-4 py-2.5 text-left">Grade (2025-26)</th>
                      <th className="px-4 py-2.5 text-left">Grade (2026-27)</th>
                      <th className="px-4 py-2.5 text-center bg-indigo-50 text-indigo-600">Total Strength</th>
                      {isKelambakkam && (
                        <th className="px-4 py-2.5 text-center bg-blue-50 text-blue-600">App. Fee Paid</th>
                      )}
                      <th className="px-4 py-2.5 text-center bg-green-50 text-green-700">Interested</th>
                      <th className="px-4 py-2.5 text-center bg-amber-50 text-amber-700">Yet to Decide</th>
                      <th className="px-4 py-2.5 text-center bg-red-50 text-red-700">Not Interested</th>
                      <th className="px-4 py-2.5 text-center">% Not Int.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-50 ${
                          row.is_grand_total
                            ? 'bg-gray-100 font-semibold border-t-2 border-gray-300'
                            : 'hover:bg-indigo-50/20'
                        }`}
                      >
                        <td className="px-3 py-2 text-center text-gray-400 text-xs">{row.sno || ''}</td>
                        <td className="px-4 py-2 text-gray-800 font-medium">{row.grade_current}</td>
                        <td className="px-4 py-2 text-gray-500">{row.grade_next || '—'}</td>
                        <EditableCell row={row} field="total_strength" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-indigo-700 bg-indigo-50/30" />
                        {isKelambakkam && (
                          <EditableCell row={row} field="app_fees_paid" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-blue-700 bg-blue-50/30" />
                        )}
                        <EditableCell row={row} field="interested" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-green-700 bg-green-50/30" />
                        <EditableCell row={row} field="yet_to_decide" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-amber-700 bg-amber-50/30" />
                        <EditableCell row={row} field="not_interested" editCell={editCell} setEditCell={setEditCell} saveEdit={saveEdit} className="text-red-600 bg-red-50/30" />
                        <td className={`px-4 py-2 text-center text-xs ${pctColor(row.pct_not_interested)}`}>
                          {row.pct_not_interested || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })}

      {/* Grand total footer row */}
      <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-bold text-gray-800 text-base">Grand Total (All Schools)</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
            <span className="text-gray-500">Students:</span>
            <strong className="text-indigo-700">{summary.total_students}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
            <span className="text-gray-500">Interested:</span>
            <strong className="text-green-700">{summary.total_interested}</strong>
            <span className="text-green-600 font-semibold">({retPct}%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-gray-500">Yet to Decide:</span>
            <strong className="text-amber-700">{summary.total_yet_to_decide}</strong>
            <span className="text-amber-600 font-semibold">({ytdPct}%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="text-gray-500">Not Interested:</span>
            <strong className="text-red-700">{summary.total_not_interested}</strong>
            <span className="text-red-600 font-semibold">({niPct}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function EditableCell({ row, field, editCell, setEditCell, saveEdit, className = '' }) {
  const isEditing = editCell?.id === row.id && editCell?.field === field;
  const val = row[field];

  if (isEditing) {
    return (
      <td className={`px-2 py-1.5 text-center ${className}`}>
        <input
          type="number"
          defaultValue={editCell.value}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter') saveEdit(field, e.target.value);
            if (e.key === 'Escape') setEditCell(null);
          }}
          onBlur={e => saveEdit(field, e.target.value)}
          className="w-16 text-center text-xs border border-indigo-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </td>
    );
  }

  return (
    <td
      className={`px-4 py-2 text-center cursor-pointer hover:opacity-80 ${className}`}
      onClick={() => !row.is_grand_total && setEditCell({ id: row.id, field, value: val ?? 0 })}
      title={row.is_grand_total ? '' : 'Click to edit'}
    >
      {val != null ? val : '—'}
    </td>
  );
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className={`${color} text-white rounded-2xl p-4`}>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-sm font-semibold opacity-90">{sub}</div>}
      <div className="text-xs opacity-75 mt-0.5">{label}</div>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}
