import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2, X, Save, Smartphone } from 'lucide-react';

const GRADES = [
  'Toddler', 'Nursery', 'LKG', 'UKG',
  'KG 1', 'KG 2',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12',
];

function Spinner() {
  return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}

function F({ label, children }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

export default function MAU() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api.getSchools().then(s => {
      const active = s.filter(sc => sc.status === 'active');
      setSchools(active);
      if (active.length > 0) setSelectedSchool(active[0].name);
    });
  }, []);

  const load = useCallback(() => {
    if (!selectedSchool) return;
    setLoading(true);
    api.getMAU(selectedSchool).then(setRows).finally(() => setLoading(false));
  }, [selectedSchool]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this row?')) return;
    await api.deleteMAU(id);
    load();
  };

  const totals = {
    students: rows.reduce((s, r) => s + (r.total_students || 0), 0),
    login: rows.reduce((s, r) => s + (r.app_login || 0), 0),
    week: rows.reduce((s, r) => s + (r.used_last_week || 0), 0),
    month: rows.reduce((s, r) => s + (r.used_last_month || 0), 0),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Smartphone size={20} className="text-indigo-600" /> MAU Data
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Monthly Active Users — App engagement by grade</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={!selectedSchool}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          <Plus size={15} /> Add Grade
        </button>
      </div>

      {/* School dropdown */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600 shrink-0">School:</label>
        <select
          value={selectedSchool}
          onChange={e => setSelectedSchool(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white min-w-[220px]"
        >
          {schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Students"     value={totals.students} color="bg-indigo-50 text-indigo-700" />
          <StatCard label="App Login"          value={totals.login}    color="bg-blue-50 text-blue-700" />
          <StatCard label="Used (Last Week)"   value={totals.week}     color="bg-amber-50 text-amber-700" />
          <StatCard label="Used (Last Month)"  value={totals.month}    color="bg-green-50 text-green-700" />
        </div>
      )}

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Smartphone size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No MAU data for {selectedSchool}</p>
              <p className="text-sm mt-1">Click "Add Grade" to start entering data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-right">Total Students</th>
                    <th className="px-4 py-3 text-right">App Login</th>
                    <th className="px-4 py-3 text-right">Used Last 1 Week</th>
                    <th className="px-4 py-3 text-right">Used Last 1 Month</th>
                    <th className="px-4 py-3 text-right">Week %</th>
                    <th className="px-4 py-3 text-right">Month %</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const weekPct = row.app_login ? Math.round((row.used_last_week / row.app_login) * 100) : 0;
                    const monthPct = row.app_login ? Math.round((row.used_last_month / row.app_login) * 100) : 0;
                    const pctColor = p => p >= 60 ? 'text-green-700 bg-green-50' : p >= 30 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';
                    return (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.grade}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.total_students ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.app_login ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.used_last_week ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.used_last_month ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pctColor(weekPct)}`}>{weekPct}%</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pctColor(monthPct)}`}>{monthPct}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-center">
                            <button onClick={() => setEditRow(row)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={13} /></button>
                            <button onClick={() => handleDelete(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="bg-gray-50 font-semibold text-gray-700 border-t border-gray-200">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{totals.students}</td>
                    <td className="px-4 py-3 text-right">{totals.login}</td>
                    <td className="px-4 py-3 text-right">{totals.week}</td>
                    <td className="px-4 py-3 text-right">{totals.month}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        {totals.login ? Math.round((totals.week / totals.login) * 100) : 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        {totals.login ? Math.round((totals.month / totals.login) * 100) : 0}%
                      </span>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(editRow || showAdd) && (
        <MAUModal
          row={editRow}
          schoolName={selectedSchool}
          existingGrades={rows.map(r => r.grade)}
          onClose={() => { setEditRow(null); setShowAdd(false); }}
          onSave={async (data) => {
            if (editRow) await api.updateMAU(editRow.id, data);
            else await api.createMAU({ ...data, school_name: selectedSchool });
            setEditRow(null); setShowAdd(false); load();
          }}
        />
      )}
    </div>
  );
}

function MAUModal({ row, schoolName, existingGrades, onClose, onSave }) {
  const [form, setForm] = useState({
    grade: row?.grade || '',
    total_students: row?.total_students ?? '',
    app_login: row?.app_login ?? '',
    used_last_week: row?.used_last_week ?? '',
    used_last_month: row?.used_last_month ?? '',
  });
  const [saving, setSaving] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const availableGrades = row ? GRADES : GRADES.filter(g => !existingGrades.includes(g));

  const handleSave = async () => {
    if (!form.grade) return alert('Select a grade');
    setSaving(true);
    try {
      await onSave({
        ...form,
        total_students: form.total_students === '' ? 0 : parseInt(form.total_students) || 0,
        app_login: form.app_login === '' ? 0 : parseInt(form.app_login) || 0,
        used_last_week: form.used_last_week === '' ? 0 : parseInt(form.used_last_week) || 0,
        used_last_month: form.used_last_month === '' ? 0 : parseInt(form.used_last_month) || 0,
      });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold">{row ? 'Edit MAU Entry' : `Add Grade — ${schoolName}`}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <F label="Grade *">
            {row ? (
              <input value={form.grade} disabled className="input bg-gray-50" />
            ) : (
              <select value={form.grade} onChange={set('grade')} className="input">
                <option value="">Select grade...</option>
                {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Total Students">
              <input type="number" min="0" value={form.total_students} onChange={set('total_students')} className="input" />
            </F>
            <F label="App Login">
              <input type="number" min="0" value={form.app_login} onChange={set('app_login')} className="input" />
            </F>
            <F label="Used Last 1 Week">
              <input type="number" min="0" value={form.used_last_week} onChange={set('used_last_week')} className="input" />
            </F>
            <F label="Used Last 1 Month">
              <input type="number" min="0" value={form.used_last_month} onChange={set('used_last_month')} className="input" />
            </F>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5">
            <Save size={14} />{saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
