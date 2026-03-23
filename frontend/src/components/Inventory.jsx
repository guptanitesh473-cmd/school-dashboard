import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Package, Search, ExternalLink, Save, CheckCircle2 } from 'lucide-react';

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getInventoryCategories(), api.getSchools()])
      .then(([cats, scs]) => { setCategories(cats); setSchools(scs); })
      .finally(() => setLoading(false));
  }, []);

  const availableCategories = categories.filter(c => c.hasData);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500 mt-0.5">School-wise equipment and materials inventory</p>
      </div>

      {/* Selector bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 text-sm font-medium shrink-0">
          <Package size={14} /> All Inventory
        </span>
        <select
          value={selectedSchool}
          onChange={e => { setSelectedSchool(e.target.value); setSelectedCategory(''); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-[200px]"
        >
          <option value="">Select school</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          disabled={!selectedSchool}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select sheet</option>
          {categories.map(c => (
            <option key={c.name} value={c.name} disabled={!c.hasData}>
              {c.name}{!c.hasData ? ' (no data)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Category tabs — shown once school is selected */}
      {selectedSchool && availableCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex gap-0 overflow-x-auto border-b border-gray-200">
            {availableCategories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                  ${selectedCategory === cat.name
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {selectedCategory
            ? <InventorySheet schoolId={selectedSchool} category={selectedCategory} />
            : <EmptyState message="Select a sheet above to view and edit inventory." />
          }
        </div>
      )}

      {selectedSchool && !selectedCategory && availableCategories.length === 0 && (
        <EmptyState message="No inventory sheets available yet." />
      )}
    </div>
  );
}

function InventorySheet({ schoolId, category }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState({});   // templateId → {available_count, condition_notes, notes}
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setDirty({});
    setSaved(false);
    setSearch('');
    api.getInventory(schoolId, category)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [schoolId, category]);

  const handleCell = useCallback((templateId, field, value) => {
    setDirty(prev => ({
      ...prev,
      [templateId]: { ...(prev[templateId] || {}), [field]: value },
    }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const bulk = rows.map(r => ({
      template_id: r.id,
      available_count: dirty[r.id]?.available_count ?? r.available_count,
      condition_notes: dirty[r.id]?.condition_notes ?? r.condition_notes,
      notes: dirty[r.id]?.notes ?? r.notes,
    }));
    try {
      await api.saveInventoryBulk(schoolId, category, bulk);
      // Merge dirty into rows
      setRows(prev => prev.map(r => ({
        ...r,
        available_count: dirty[r.id]?.available_count ?? r.available_count,
        condition_notes: dirty[r.id]?.condition_notes ?? r.condition_notes,
        notes: dirty[r.id]?.notes ?? r.notes,
      })));
      setDirty({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const hasDirty = Object.keys(dirty).length > 0;
  const filtered = rows.filter(r =>
    !search ||
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.specification?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-40"><Spinner /></div>;
  if (rows.length === 0) return <EmptyState message="No items in this sheet yet." />;

  return (
    <div>
      {/* Toolbar */}
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-100 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{rows.length} items</span>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 size={13} /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || (!hasDirty)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${hasDirty
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Save size={13} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[200px]">Item</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Specification</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Std. Qty</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center min-w-[110px]">
                Available <span className="text-indigo-500">✎</span>
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[160px]">
                Condition <span className="text-indigo-500">✎</span>
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[160px]">
                Notes <span className="text-indigo-500">✎</span>
              </th>
              <th className="px-4 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((row, idx) => {
              const d = dirty[row.id] || {};
              const availVal = d.available_count !== undefined ? d.available_count : row.available_count;
              const condVal  = d.condition_notes  !== undefined ? d.condition_notes  : row.condition_notes;
              const notesVal = d.notes            !== undefined ? d.notes            : row.notes;
              const isDirty  = !!dirty[row.id];

              return (
                <tr key={row.id} className={`transition-colors ${isDirty ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-2 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    <div className="truncate max-w-[220px]" title={row.product_name}>{row.product_name || '—'}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs max-w-[180px]">
                    <div className="truncate" title={row.specification}>{row.specification || '—'}</div>
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">{row.standard_qty || '—'}</td>

                  {/* Editable: Available count */}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={availVal}
                      onChange={e => handleCell(row.id, 'available_count', e.target.value)}
                      placeholder="—"
                      className="w-full text-center text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
                    />
                  </td>

                  {/* Editable: Condition */}
                  <td className="px-4 py-2">
                    <select
                      value={condVal}
                      onChange={e => handleCell(row.id, 'condition_notes', e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                      <option value="">Select…</option>
                      <option value="Available in good condition">Good condition</option>
                      <option value="Available - needs repair">Needs repair</option>
                      <option value="Available - not to standard">Not to standard</option>
                      <option value="Not available">Not available</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </td>

                  {/* Editable: Notes */}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={notesVal}
                      onChange={e => handleCell(row.id, 'notes', e.target.value)}
                      placeholder="Add note…"
                      className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    />
                  </td>

                  <td className="px-4 py-2">
                    {row.drive_link && (
                      <a href={row.drive_link} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-600">
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
      <Package size={32} className="mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function Spinner() {
  return <div className="animate-spin h-7 w-7 border-b-2 border-indigo-600 rounded-full" />;
}
