import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2, X, Save, ShieldCheck } from 'lucide-react';
import { useUser, useIsSchool } from '../contexts/UserContext';

const MONTHS = [
  'January 2025', 'February 2025', 'March 2025', 'April 2025',
  'May 2025', 'June 2025', 'July 2025', 'August 2025',
  'September 2025', 'October 2025', 'November 2025', 'December 2025',
  'January 2026', 'February 2026', 'March 2026', 'April 2026',
  'May 2026', 'June 2026', 'July 2026', 'August 2026',
  'September 2026', 'October 2026', 'November 2026', 'December 2026',
];

function Spinner() {
  return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}

function F({ label, children }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
}

const EMPTY_FORM = {
  month: '', school_name: '',
  dept_planned: '', agenda_planned: '', timeline: '', designation_planned: '',
  auditor_name: '', erp: '', designation_executed: '', dept_executed: '',
  date_of_auditing: '', agenda_executed: '', audit_report: '', issues_tagged: '',
};

export default function AuditReport() {
  const user = useUser();
  const isSchool = useIsSchool();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSchool, setFilterSchool] = useState('');

  useEffect(() => {
    if (isSchool && user?.school_name) setFilterSchool(user.school_name);
  }, [isSchool, user?.school_name]);

  const load = useCallback(() => {
    setLoading(true);
    api.getAudit().then(setRows).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await api.deleteAudit(id);
    load();
  };

  const allMonths = [...new Set(rows.map(r => r.month))].sort((a, b) => {
    const [, ya] = a.split(' '); const [, yb] = b.split(' ');
    return ya !== yb ? ya - yb : MONTHS.indexOf(a) - MONTHS.indexOf(b);
  });
  const allSchools = [...new Set(rows.map(r => r.school_name))].sort();

  const filtered = rows.filter(r =>
    (!filterMonth || r.month === filterMonth) &&
    (!filterSchool || r.school_name === filterSchool)
  );

  const grouped = {};
  for (const r of filtered) {
    if (!grouped[r.month]) grouped[r.month] = [];
    grouped[r.month].push(r);
  }

  if (loading) return <Spinner />;

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
        {!isSchool && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} /> Add Entry
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 shrink-0">Month:</label>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white min-w-[160px]"
          >
            <option value="">All Months</option>
            {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {!isSchool && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 shrink-0">School:</label>
            <select
              value={filterSchool}
              onChange={e => setFilterSchool(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white min-w-[200px]"
            >
              <option value="">All Schools</option>
              {allSchools.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        {(filterMonth || (!isSchool && filterSchool)) && (
          <button
            onClick={() => { setFilterMonth(''); if (!isSchool) setFilterSchool(''); }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16 text-gray-400">
          <ShieldCheck size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No audit entries found</p>
          {!isSchool && <p className="text-sm mt-1">Click "Add Entry" to start tracking audits.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([month, entries]) => (
            <div key={month} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                <h3 className="font-semibold text-indigo-800 text-sm">{month}</h3>
                <p className="text-xs text-indigo-500 mt-0.5">{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                      <th className="px-4 py-2 text-left" colSpan={2}>School</th>
                      {/* Audit Planning */}
                      <th className="px-3 py-2 text-left bg-blue-50 text-blue-600 border-l border-blue-100" colSpan={5}>
                        Audit Planning &amp; Timeline
                      </th>
                      {/* Audit Execution */}
                      <th className="px-3 py-2 text-left bg-amber-50 text-amber-600 border-l border-amber-100" colSpan={7}>
                        Audit Execution
                      </th>
                      <th className="px-3 py-2 w-16"></th>
                    </tr>
                    <tr className="bg-gray-50 text-[11px] text-gray-500 border-b">
                      <th className="px-4 py-2 text-left w-8">#</th>
                      <th className="px-4 py-2 text-left min-w-[150px]">School</th>
                      <th className="px-3 py-2 text-left bg-blue-50/50 border-l border-blue-100 min-w-[120px]">Department</th>
                      <th className="px-3 py-2 text-left bg-blue-50/50 min-w-[140px]">Agenda</th>
                      <th className="px-3 py-2 text-left bg-blue-50/50 min-w-[110px]">Timeline</th>
                      <th className="px-3 py-2 text-left bg-blue-50/50 min-w-[120px]">Designation</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 border-l border-amber-100 min-w-[120px]">Name</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[90px]">ERP</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[120px]">Designation</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[120px]">Department</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[120px]">Date of Auditing</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[140px]">Agenda</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[140px]">Audit Report</th>
                      <th className="px-3 py-2 text-left bg-amber-50/50 min-w-[160px]">Issues Tagged Departments</th>
                      <th className="px-3 py-2 w-16 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 text-xs">
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.school_name}</td>
                        <td className="px-3 py-3 text-gray-600 bg-blue-50/20 border-l border-blue-50">{row.dept_planned || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-blue-50/20">{row.agenda_planned || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-blue-50/20">{row.timeline || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-blue-50/20">{row.designation_planned || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20 border-l border-amber-50">{row.auditor_name || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20">{row.erp || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20">{row.designation_executed || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20">{row.dept_executed || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20 whitespace-nowrap">{row.date_of_auditing || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20">{row.agenda_executed || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20">{row.audit_report || <Dash />}</td>
                        <td className="px-3 py-3 text-gray-600 bg-amber-50/20">{row.issues_tagged || <Dash />}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 justify-center">
                            <button onClick={() => setEditRow(row)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={13} /></button>
                            {!isSchool && (
                              <button onClick={() => handleDelete(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editRow || showAdd) && (
        <AuditModal
          row={editRow}
          onClose={() => { setEditRow(null); setShowAdd(false); }}
          onSave={async (data) => {
            if (editRow) await api.updateAudit(editRow.id, data);
            else await api.createAudit(data);
            setEditRow(null); setShowAdd(false); load();
          }}
        />
      )}
    </div>
  );
}

function Dash() {
  return <span className="text-gray-300">—</span>;
}

function AuditModal({ row, onClose, onSave }) {
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(row ? { ...EMPTY_FORM, ...row } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  useEffect(() => {
    api.getSchools().then(s => setSchools(s.filter(sc => sc.status === 'active')));
  }, []);

  const handleSave = async () => {
    if (!form.month || !form.school_name) return alert('Month and school are required');
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold">{row ? 'Edit Audit Entry' : 'Add Audit Entry'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-5">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-3">
            <F label="Month *">
              <select value={form.month} onChange={set('month')} className="input">
                <option value="">Select month...</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </F>
            <F label="School *">
              <select value={form.school_name} onChange={set('school_name')} className="input">
                <option value="">Select school...</option>
                {schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </F>
          </div>

          {/* Audit Planning */}
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Audit Planning &amp; Timeline
            </p>
            <div className="grid grid-cols-2 gap-3">
              <F label="Department">
                <input value={form.dept_planned} onChange={set('dept_planned')} placeholder="e.g. Finance" className="input" />
              </F>
              <F label="Timeline">
                <input value={form.timeline} onChange={set('timeline')} placeholder="e.g. Week 2 of month" className="input" />
              </F>
              <F label="Designation">
                <input value={form.designation_planned} onChange={set('designation_planned')} placeholder="e.g. Principal" className="input" />
              </F>
              <F label="Agenda">
                <textarea value={form.agenda_planned} onChange={set('agenda_planned')} rows={2} placeholder="Audit agenda..." className="input resize-none" />
              </F>
            </div>
          </div>

          {/* Audit Execution */}
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Audit Execution
            </p>
            <div className="grid grid-cols-2 gap-3">
              <F label="Name">
                <input value={form.auditor_name} onChange={set('auditor_name')} placeholder="Auditor name" className="input" />
              </F>
              <F label="ERP">
                <input value={form.erp} onChange={set('erp')} placeholder="ERP system / ID" className="input" />
              </F>
              <F label="Designation">
                <input value={form.designation_executed} onChange={set('designation_executed')} placeholder="e.g. Auditor" className="input" />
              </F>
              <F label="Department">
                <input value={form.dept_executed} onChange={set('dept_executed')} placeholder="Department audited" className="input" />
              </F>
              <F label="Date of Auditing">
                <input type="date" value={form.date_of_auditing} onChange={set('date_of_auditing')} className="input" />
              </F>
              <F label="Agenda">
                <textarea value={form.agenda_executed} onChange={set('agenda_executed')} rows={2} placeholder="Execution agenda..." className="input resize-none" />
              </F>
              <F label="Audit Report">
                <textarea value={form.audit_report} onChange={set('audit_report')} rows={2} placeholder="Summary / report link..." className="input resize-none" />
              </F>
              <F label="Issues Tagged Departments">
                <textarea value={form.issues_tagged} onChange={set('issues_tagged')} rows={2} placeholder="Departments with issues..." className="input resize-none" />
              </F>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5">
            <Save size={14} />{saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
