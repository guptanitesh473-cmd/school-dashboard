import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUS_STYLES = {
  Yes:       { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  icon: CheckCircle2, dot: 'bg-green-500' },
  No:        { bg: 'bg-red-100',    text: 'text-red-600',    border: 'border-red-300',    icon: XCircle,      dot: 'bg-red-400'   },
  'In Future': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: Clock,        dot: 'bg-amber-400' },
};

export default function MatrixView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  // activeCell: { schoolId, offeringId } | null
  const [activeCell, setActiveCell] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await api.getMatrix()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic update — no full reload
  const handleCellChange = useCallback(async (schoolId, offeringId, status, condition_notes) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        matrix: prev.matrix.map(cat => ({
          ...cat,
          offerings: cat.offerings.map(off => {
            if (off.offering.id !== offeringId) return off;
            return {
              ...off,
              schools: off.schools.map(sc =>
                sc.school_id === schoolId ? { ...sc, status, condition_notes } : sc
              ),
            };
          }),
        })),
      };
    });
    try {
      await api.updateOffering(schoolId, offeringId, { status, condition_notes });
    } catch {
      load(); // revert on error
    }
  }, [load]);

  if (loading) return <Loader />;
  if (error) return <ErrorView msg={error} onRetry={load} />;
  if (!data) return null;

  const { schools: allSchools, matrix } = data;
  const schools = filterSchool === 'all' ? allSchools : allSchools.filter(s => s.id === Number(filterSchool));
  const categories = filterCategory === 'all' ? matrix : matrix.filter(m => m.category.id === Number(filterCategory));
  const schoolIds = new Set(schools.map(s => s.id));
  const filteredMatrix = categories.map(cat => ({
    ...cat,
    offerings: cat.offerings
      .filter(off => filterStatus === 'all' || off.schools.some(s => schoolIds.has(s.school_id) && s.status === filterStatus))
      .map(off => ({ ...off, schools: off.schools.filter(s => schoolIds.has(s.school_id)) })),
  })).filter(cat => cat.offerings.length > 0);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Offerings Matrix</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white min-w-[160px]">
            <option value="all">All Schools</option>
            {allSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
            <option value="all">All Categories</option>
            {matrix.map(m => <option key={m.category.id} value={m.category.id}>{m.category.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
            <option value="all">All Statuses</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="In Future">In Future</option>
          </select>
          <button onClick={load} className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">Click any badge to change status · click notes to edit</p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold border-b border-gray-200 min-w-[160px]">Category</th>
              <th className="sticky left-[160px] bg-gray-50 px-4 py-3 text-left font-semibold border-b border-gray-200 min-w-[180px]">Offering</th>
              {schools.map(s => (
                <th key={s.id} className="px-3 py-3 text-center font-semibold border-b border-gray-200 min-w-[150px] whitespace-nowrap">
                  {s.name}
                  <div className="text-[10px] font-normal text-gray-400 normal-case">{s.code}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMatrix.map((catRow, ci) =>
              catRow.offerings.map((offRow, oi) => (
                <tr key={`${catRow.category.id}-${offRow.offering.id}`}
                  className={`border-b border-gray-100 hover:bg-indigo-50/20 transition-colors ${oi === 0 && ci > 0 ? 'border-t-2 border-t-gray-200' : ''}`}>
                  {oi === 0 && (
                    <td rowSpan={catRow.offerings.length}
                      className="sticky left-0 bg-white px-4 py-3 font-semibold text-indigo-700 text-xs border-r border-gray-200 align-top">
                      {catRow.category.name}
                    </td>
                  )}
                  <td className="sticky left-[160px] bg-white px-4 py-3 text-gray-700 border-r border-gray-100 font-medium">
                    {offRow.offering.name}
                  </td>
                  {offRow.schools.map(sc => (
                    <CellEditor
                      key={sc.school_id}
                      sc={sc}
                      offeringId={offRow.offering.id}
                      isActive={activeCell?.schoolId === sc.school_id && activeCell?.offeringId === offRow.offering.id}
                      onActivate={() => setActiveCell({ schoolId: sc.school_id, offeringId: offRow.offering.id })}
                      onDeactivate={() => setActiveCell(null)}
                      onChange={(status, notes) => handleCellChange(sc.school_id, offRow.offering.id, status, notes)}
                    />
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellEditor({ sc, offeringId, isActive, onActivate, onDeactivate, onChange }) {
  const [notes, setNotes] = useState(sc.condition_notes || '');
  const notesRef = useRef(null);
  const wrapRef = useRef(null);

  // Sync notes if parent data changes externally
  useEffect(() => { setNotes(sc.condition_notes || ''); }, [sc.condition_notes]);

  // Close on outside click
  useEffect(() => {
    if (!isActive) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onDeactivate();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isActive, onDeactivate]);

  const commitNotes = () => {
    if (notes !== (sc.condition_notes || '')) onChange(sc.status, notes);
  };

  const style = STATUS_STYLES[sc.status] || STATUS_STYLES['No'];
  const Icon = style.icon;

  return (
    <td className="px-2 py-2 text-center align-top" ref={wrapRef}>
      <div className="flex flex-col items-center gap-1.5">
        {/* Status dropdown */}
        <div className="relative">
          <select
            value={sc.status}
            onChange={e => { onChange(e.target.value, notes); if (!isActive) onActivate(); }}
            onClick={e => e.stopPropagation()}
            className={`appearance-none text-xs font-semibold px-2.5 py-1 pr-5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 ${style.bg} ${style.text} ${style.border}`}
          >
            <option value="Yes">✓ Yes</option>
            <option value="No">✗ No</option>
            <option value="In Future">⏱ In Future</option>
          </select>
          <span className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] ${style.text}`}>▾</span>
        </div>

        {/* Notes: click to open popover */}
        {!isActive ? (
          sc.condition_notes ? (
            <span
              onClick={onActivate}
              className="text-[10px] text-gray-400 leading-tight text-center max-w-[130px] line-clamp-2 cursor-text hover:text-gray-600 hover:underline underline-offset-2"
            >
              {sc.condition_notes}
            </span>
          ) : (
            <span
              onClick={onActivate}
              className="text-[10px] text-gray-300 italic cursor-text hover:text-gray-400"
            >
              add note…
            </span>
          )
        ) : (
          <div className="w-full" onClick={e => e.stopPropagation()}>
            <textarea
              ref={notesRef}
              autoFocus
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={commitNotes}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitNotes(); notesRef.current?.blur(); }
                if (e.key === 'Escape') { setNotes(sc.condition_notes || ''); onDeactivate(); }
              }}
              rows={2}
              placeholder="Add note…"
              className="w-full min-w-[120px] text-[11px] border border-indigo-300 rounded-md px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}
      </div>
    </td>
  );
}

function Loader() {
  return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;
}
function ErrorView({ msg, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-700 font-medium">{msg}</p>
      <button onClick={onRetry} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
    </div>
  );
}
