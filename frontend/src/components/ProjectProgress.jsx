import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Phone, FileText, Calendar, ChevronDown, ChevronUp, Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const BLA_STATUSES = ['', 'Scheduled', 'Marks Received', 'Completed', 'Pending'];
const CALLING_STATUSES = ['', 'Completed', 'In Progress', 'Pending'];

const blaColor = (s) => {
  if (s === 'Marks Received' || s === 'Completed') return 'bg-green-100 text-green-700 border-green-300';
  if (s === 'Scheduled') return 'bg-blue-100 text-blue-700 border-blue-300';
  if (s === 'Pending') return 'bg-red-100 text-red-700 border-red-300';
  return 'bg-gray-100 text-gray-400 border-gray-200';
};

const callingColor = (s) => {
  if (s === 'Completed') return 'bg-green-100 text-green-700 border-green-300';
  if (s === 'In Progress') return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-gray-100 text-gray-400 border-gray-200';
};

function fmt(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function ProjectProgress() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api.getRetention().then(setRows).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = {
    total: rows.length,
    callingDone: rows.filter(r => r.calling_status === 'Completed').length,
    marksReceived: rows.filter(r => r.bla_status === 'Marks Received' || r.bla_status === 'Completed').length,
    scheduled: rows.filter(r => r.bla_status === 'Scheduled').length,
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await api.deleteRetention(id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Project Progress</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={14} /> Add School
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SCard label="Total Schools"      value={summary.total}        color="bg-indigo-50 text-indigo-700" />
        <SCard label="Calling Completed"  value={summary.callingDone}  color="bg-green-50 text-green-700" />
        <SCard label="Marks Received"     value={summary.marksReceived} color="bg-blue-50 text-blue-700" />
        <SCard label="BLA Scheduled"      value={summary.scheduled}    color="bg-amber-50 text-amber-700" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                <th className="px-4 py-3 text-left">School</th>
                <th className="px-4 py-3 text-left">State</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-center">1st Calling</th>
                <th className="px-4 py-3 text-center">BLA Status</th>
                <th className="px-4 py-3 text-left">Exam Period</th>
                <th className="px-4 py-3 text-left">BLA Date</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Notes</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.school_name}</div>
                    {row.location && <div className="text-xs text-gray-400">{row.location}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.state || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{row.owner || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${callingColor(row.calling_status)}`}>
                      <Phone size={10} />{row.calling_status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${blaColor(row.bla_status)}`}>
                      <FileText size={10} />{row.bla_status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar size={11} className="text-gray-400" />
                      {fmt(row.exam_start_date)} – {fmt(row.exam_end_date)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {fmt(row.tentative_bla_date)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {row.notes ? (
                      <div>
                        <span className={expandedNotes[row.id] ? '' : 'line-clamp-2'}>{row.notes}</span>
                        {row.notes.length > 60 && (
                          <button
                            onClick={() => setExpandedNotes(p => ({ ...p, [row.id]: !p[row.id] }))}
                            className="text-indigo-500 flex items-center gap-0.5 mt-0.5"
                          >
                            {expandedNotes[row.id]
                              ? <><ChevronUp size={11} />Less</>
                              : <><ChevronDown size={11} />More</>}
                          </button>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      <button onClick={() => setEditRow(row)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editRow || showAdd) && (
        <ProgressModal
          row={editRow}
          onClose={() => { setEditRow(null); setShowAdd(false); }}
          onSave={async (data) => {
            if (editRow) await api.updateRetention(editRow.id, data);
            else await api.createRetention(data);
            setEditRow(null); setShowAdd(false); load();
          }}
        />
      )}
    </div>
  );
}

function SCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function ProgressModal({ row, onClose, onSave }) {
  const [form, setForm] = useState({
    school_name: row?.school_name || '',
    state: row?.state || '',
    location: row?.location || '',
    owner: row?.owner || '',
    calling_status: row?.calling_status || '',
    bla_status: row?.bla_status || '',
    exam_start_date: row?.exam_start_date || '',
    exam_end_date: row?.exam_end_date || '',
    tentative_bla_date: row?.tentative_bla_date || '',
    notes: row?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold">{row ? 'Edit Record' : 'Add School'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <F label="School Name *"><input value={form.school_name} onChange={set('school_name')} className="input" /></F>
            <F label="Owner"><input value={form.owner} onChange={set('owner')} className="input" /></F>
            <F label="Location"><input value={form.location} onChange={set('location')} className="input" /></F>
            <F label="State"><input value={form.state} onChange={set('state')} className="input" /></F>
            <F label="1st Calling Status">
              <select value={form.calling_status} onChange={set('calling_status')} className="input">
                {CALLING_STATUSES.map(s => <option key={s} value={s}>{s || 'Select...'}</option>)}
              </select>
            </F>
            <F label="BLA Status">
              <select value={form.bla_status} onChange={set('bla_status')} className="input">
                {BLA_STATUSES.map(s => <option key={s} value={s}>{s || 'Select...'}</option>)}
              </select>
            </F>
            <F label="Exam Start Date"><input type="date" value={form.exam_start_date} onChange={set('exam_start_date')} className="input" /></F>
            <F label="Exam End Date"><input type="date" value={form.exam_end_date} onChange={set('exam_end_date')} className="input" /></F>
            <F label="Tentative BLA Date"><input type="date" value={form.tentative_bla_date} onChange={set('tentative_bla_date')} className="input" /></F>
          </div>
          <F label="Notes">
            <textarea value={form.notes} onChange={set('notes')} rows={3} className="input resize-none" />
          </F>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
            <Save size={14} />{saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function F({ label, children }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
}

function Spinner() {
  return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}
