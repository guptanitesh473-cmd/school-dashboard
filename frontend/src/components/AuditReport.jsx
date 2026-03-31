import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useUser, useIsSchool } from '../contexts/UserContext';

const EMPTY_ROW = () => ({
  _new: true,
  month: '', dept_planned: '', agenda_planned: '', timeline: '', designation_planned: '',
  auditor_name: '', erp: '', designation_executed: '', dept_executed: '',
  date_of_auditing: '', agenda_executed: '', audit_report: '', issues_tagged: '',
});

function Spinner() {
  return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}

export default function AuditReport() {
  const user = useUser();
  const isSchool = useIsSchool();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState({});   // id/key → changed fields
  const [newRows, setNewRows] = useState([]); // unsaved new rows
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  // Load school list
  useEffect(() => {
    api.getSchools()
      .then(s => {
        const active = s.filter(sc => sc.status === 'active');
        setSchools(active);
        if (isSchool && user?.school_name) {
          setSelectedSchool(user.school_name);
        }
      })
      .finally(() => setSchoolsLoading(false));
  }, [isSchool, user?.school_name]);

  // Load rows when school changes
  const loadRows = useCallback((school) => {
    if (!school) { setRows([]); setNewRows([]); setDirty({}); return; }
    setLoading(true);
    api.getAudit(school)
      .then(r => { setRows(r); setNewRows([]); setDirty({}); setSaved(false); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadRows(selectedSchool); }, [selectedSchool, loadRows]);

  // Cell change for existing rows
  const handleCell = useCallback((id, field, value) => {
    setDirty(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    setSaved(false);
  }, []);

  // Cell change for new rows
  const handleNewCell = useCallback((idx, field, value) => {
    setNewRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    setSaved(false);
  }, []);

  const addRow = () => setNewRows(prev => [...prev, EMPTY_ROW()]);

  const removeNewRow = (idx) => setNewRows(prev => prev.filter((_, i) => i !== idx));

  const handleDeleteExisting = async (id) => {
    if (!confirm('Delete this row?')) return;
    await api.deleteAudit(id);
    loadRows(selectedSchool);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update dirty existing rows
      for (const [id, changes] of Object.entries(dirty)) {
        const original = rows.find(r => String(r.id) === String(id));
        if (original) await api.updateAudit(id, { ...original, ...changes });
      }
      // Create new rows
      for (const nr of newRows) {
        if (!nr.month) continue; // skip completely empty rows
        await api.createAudit({ ...nr, school_name: selectedSchool });
      }
      loadRows(selectedSchool);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const hasDirty = Object.keys(dirty).length > 0 || newRows.length > 0;

  const Cell = ({ value, onChange, placeholder = '', type = 'text', wide = false }) => (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white ${wide ? 'min-w-[130px]' : 'min-w-[90px]'}`}
    />
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-600" /> Audit Report
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Audit planning and execution tracking per school</p>
        </div>
      </div>

      {/* School selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 text-sm font-medium shrink-0">
          <ShieldCheck size={14} /> Audit Report
        </span>
        <select
          value={selectedSchool}
          onChange={e => setSelectedSchool(e.target.value)}
          disabled={isSchool || schoolsLoading}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-[220px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {!isSchool && <option value="">Select School</option>}
          {schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {selectedSchool && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-100 flex-wrap">
            <span className="text-sm font-medium text-gray-700">{selectedSchool}</span>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 size={13} /> Saved
                </span>
              )}
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <Plus size={13} /> Add Row
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasDirty}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${hasDirty
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Save size={13} />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  {/* Section headers */}
                  <tr className="text-xs font-semibold border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-gray-500 bg-gray-50 w-28">Tab</th>
                    <th colSpan={5} className="px-3 py-2 text-center bg-blue-100 text-blue-700 border-x border-blue-200">
                      Audit Planning and Timeline
                    </th>
                    <th colSpan={8} className="px-3 py-2 text-center bg-slate-200 text-slate-700 border-x border-slate-300">
                      Audit Execution
                    </th>
                    <th className="px-2 py-2 bg-gray-50 w-8"></th>
                  </tr>
                  {/* Column headers */}
                  <tr className="text-[11px] text-gray-500 bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left"></th>
                    <th className="px-3 py-2 text-left border-l border-blue-100 min-w-[110px]">Month</th>
                    <th className="px-3 py-2 text-left min-w-[120px]">Department</th>
                    <th className="px-3 py-2 text-left min-w-[140px]">Agenda</th>
                    <th className="px-3 py-2 text-left min-w-[120px]">Timeline</th>
                    <th className="px-3 py-2 text-left min-w-[120px]">Designation</th>
                    <th className="px-3 py-2 text-left border-l border-slate-200 min-w-[120px]">Name</th>
                    <th className="px-3 py-2 text-left min-w-[90px]">ERP</th>
                    <th className="px-3 py-2 text-left min-w-[120px]">Designation</th>
                    <th className="px-3 py-2 text-left min-w-[120px]">Department</th>
                    <th className="px-3 py-2 text-left min-w-[120px]">Date of Auditing</th>
                    <th className="px-3 py-2 text-left min-w-[140px]">Agenda</th>
                    <th className="px-3 py-2 text-left min-w-[140px]">Audit Report</th>
                    <th className="px-3 py-2 text-left min-w-[160px]">Issues tagged Departments</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Existing rows */}
                  {rows.map(row => {
                    const d = dirty[row.id] || {};
                    const v = f => d[f] !== undefined ? d[f] : (row[f] ?? '');
                    const ch = f => val => handleCell(row.id, f, val);
                    const isDirty = !!dirty[row.id];
                    return (
                      <tr key={row.id} className={isDirty ? 'bg-indigo-50/40' : 'hover:bg-gray-50/50'}>
                        <td className="px-3 py-2 text-xs text-gray-500 font-medium whitespace-nowrap">Audit report</td>
                        <td className="px-2 py-2 border-l border-blue-50"><Cell value={v('month')} onChange={ch('month')} placeholder="e.g. April 2025" /></td>
                        <td className="px-2 py-2"><Cell value={v('dept_planned')} onChange={ch('dept_planned')} placeholder="Department" /></td>
                        <td className="px-2 py-2"><Cell value={v('agenda_planned')} onChange={ch('agenda_planned')} placeholder="Agenda" wide /></td>
                        <td className="px-2 py-2"><Cell value={v('timeline')} onChange={ch('timeline')} placeholder="Timeline" /></td>
                        <td className="px-2 py-2"><Cell value={v('designation_planned')} onChange={ch('designation_planned')} placeholder="Designation" /></td>
                        <td className="px-2 py-2 border-l border-slate-100"><Cell value={v('auditor_name')} onChange={ch('auditor_name')} placeholder="Name" /></td>
                        <td className="px-2 py-2"><Cell value={v('erp')} onChange={ch('erp')} placeholder="ERP" /></td>
                        <td className="px-2 py-2"><Cell value={v('designation_executed')} onChange={ch('designation_executed')} placeholder="Designation" /></td>
                        <td className="px-2 py-2"><Cell value={v('dept_executed')} onChange={ch('dept_executed')} placeholder="Department" /></td>
                        <td className="px-2 py-2"><Cell value={v('date_of_auditing')} onChange={ch('date_of_auditing')} type="date" /></td>
                        <td className="px-2 py-2"><Cell value={v('agenda_executed')} onChange={ch('agenda_executed')} placeholder="Agenda" wide /></td>
                        <td className="px-2 py-2"><Cell value={v('audit_report')} onChange={ch('audit_report')} placeholder="Report" wide /></td>
                        <td className="px-2 py-2"><Cell value={v('issues_tagged')} onChange={ch('issues_tagged')} placeholder="Departments" wide /></td>
                        <td className="px-2 py-2">
                          <button onClick={() => handleDeleteExisting(row.id)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* New unsaved rows */}
                  {newRows.map((nr, idx) => {
                    const ch = f => val => handleNewCell(idx, f, val);
                    return (
                      <tr key={`new-${idx}`} className="bg-green-50/40">
                        <td className="px-3 py-2 text-xs text-gray-500 font-medium whitespace-nowrap">Audit report</td>
                        <td className="px-2 py-2 border-l border-blue-50"><Cell value={nr.month} onChange={ch('month')} placeholder="e.g. April 2025" /></td>
                        <td className="px-2 py-2"><Cell value={nr.dept_planned} onChange={ch('dept_planned')} placeholder="Department" /></td>
                        <td className="px-2 py-2"><Cell value={nr.agenda_planned} onChange={ch('agenda_planned')} placeholder="Agenda" wide /></td>
                        <td className="px-2 py-2"><Cell value={nr.timeline} onChange={ch('timeline')} placeholder="Timeline" /></td>
                        <td className="px-2 py-2"><Cell value={nr.designation_planned} onChange={ch('designation_planned')} placeholder="Designation" /></td>
                        <td className="px-2 py-2 border-l border-slate-100"><Cell value={nr.auditor_name} onChange={ch('auditor_name')} placeholder="Name" /></td>
                        <td className="px-2 py-2"><Cell value={nr.erp} onChange={ch('erp')} placeholder="ERP" /></td>
                        <td className="px-2 py-2"><Cell value={nr.designation_executed} onChange={ch('designation_executed')} placeholder="Designation" /></td>
                        <td className="px-2 py-2"><Cell value={nr.dept_executed} onChange={ch('dept_executed')} placeholder="Department" /></td>
                        <td className="px-2 py-2"><Cell value={nr.date_of_auditing} onChange={ch('date_of_auditing')} type="date" /></td>
                        <td className="px-2 py-2"><Cell value={nr.agenda_executed} onChange={ch('agenda_executed')} placeholder="Agenda" wide /></td>
                        <td className="px-2 py-2"><Cell value={nr.audit_report} onChange={ch('audit_report')} placeholder="Report" wide /></td>
                        <td className="px-2 py-2"><Cell value={nr.issues_tagged} onChange={ch('issues_tagged')} placeholder="Departments" wide /></td>
                        <td className="px-2 py-2">
                          <button onClick={() => removeNewRow(idx)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {rows.length === 0 && newRows.length === 0 && (
                    <tr>
                      <td colSpan={15} className="px-4 py-12 text-center text-gray-400 text-sm">
                        No audit entries yet. Click "Add Row" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedSchool && !schoolsLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16 text-gray-400">
          <ShieldCheck size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a school to view audit entries</p>
        </div>
      )}
    </div>
  );
}
