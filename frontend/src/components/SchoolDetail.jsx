import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';
import { ArrowLeft, Pencil, CheckCircle, XCircle, Clock, Save, X } from 'lucide-react';

const STATUS_OPTIONS = ['Yes', 'No', 'In Future'];

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkChanges, setBulkChanges] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.getSchoolOfferings(id);
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { school, offerings, summary } = data;

  // Group offerings by category
  const grouped = offerings.reduce((acc, off) => {
    if (!acc[off.category_name]) acc[off.category_name] = [];
    acc[off.category_name].push(off);
    return acc;
  }, {});

  const startEdit = (off) => {
    setEditingId(off.offering_id);
    setEditValues({ status: off.status, condition_notes: off.condition_notes || '' });
  };

  const saveEdit = async (off) => {
    setSaving(true);
    try {
      await api.updateOffering(id, off.offering_id, editValues);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const saveBulk = async () => {
    if (!Object.keys(bulkChanges).length) { setBulkMode(false); return; }
    setSaving(true);
    try {
      const payload = Object.entries(bulkChanges).map(([offering_id, vals]) => ({
        offering_id: Number(offering_id),
        ...vals,
      }));
      await api.bulkUpdateOfferings(id, payload);
      setBulkMode(false);
      setBulkChanges({});
      load();
    } finally {
      setSaving(false);
    }
  };

  const getBulkStatus = (off) =>
    bulkChanges[off.offering_id]?.status ?? off.status;

  return (
    <div>
      <button onClick={() => navigate('/schools')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={15} /> All Schools
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{school.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {school.code} · {[school.city, school.state].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            {bulkMode ? (
              <>
                <button onClick={() => { setBulkMode(false); setBulkChanges({}); }} className="btn-secondary text-sm flex items-center gap-1">
                  <X size={14} /> Cancel
                </button>
                <button onClick={saveBulk} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
                  <Save size={14} /> {saving ? 'Saving...' : `Save Changes (${Object.keys(bulkChanges).length})`}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setBulkMode(true)} className="btn-secondary text-sm">Bulk Edit</button>
                <Link to={`/schools/${id}/edit`} className="btn-primary text-sm flex items-center gap-1.5">
                  <Pencil size={14} /> Edit School
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 mt-4">
          <Pill icon={CheckCircle} value={summary.yes} label="Available" color="text-green-600" bg="bg-green-50" />
          <Pill icon={XCircle} value={summary.no} label="Not Available" color="text-red-600" bg="bg-red-50" />
          <Pill icon={Clock} value={summary.in_future} label="In Future" color="text-amber-600" bg="bg-amber-50" />
        </div>
      </div>

      {/* Offerings grouped by category */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([catName, offs]) => (
          <div key={catName} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
              <h3 className="font-semibold text-indigo-800 text-sm">{catName}</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {offs.map(off => (
                  <tr key={off.offering_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-700 w-1/3">{off.offering_name}</td>

                    {bulkMode ? (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {STATUS_OPTIONS.map(s => (
                              <button
                                key={s}
                                onClick={() => setBulkChanges(prev => ({
                                  ...prev,
                                  [off.offering_id]: {
                                    status: s,
                                    condition_notes: prev[off.offering_id]?.condition_notes ?? off.condition_notes ?? '',
                                  },
                                }))}
                                className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-all ${
                                  getBulkStatus(off) === s
                                    ? s === 'Yes' ? 'border-green-500 bg-green-100 text-green-700'
                                      : s === 'No' ? 'border-red-500 bg-red-100 text-red-700'
                                      : 'border-amber-500 bg-amber-100 text-amber-700'
                                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={bulkChanges[off.offering_id]?.condition_notes ?? off.condition_notes ?? ''}
                            onChange={e => setBulkChanges(prev => ({
                              ...prev,
                              [off.offering_id]: {
                                status: prev[off.offering_id]?.status ?? off.status,
                                condition_notes: e.target.value,
                              },
                            }))}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            placeholder="Notes..."
                          />
                        </td>
                      </>
                    ) : editingId === off.offering_id ? (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {STATUS_OPTIONS.map(s => (
                              <button
                                key={s}
                                onClick={() => setEditValues(v => ({ ...v, status: s }))}
                                className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-all ${
                                  editValues.status === s
                                    ? s === 'Yes' ? 'border-green-500 bg-green-100 text-green-700'
                                      : s === 'No' ? 'border-red-500 bg-red-100 text-red-700'
                                      : 'border-amber-500 bg-amber-100 text-amber-700'
                                    : 'border-gray-200 text-gray-400'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={editValues.condition_notes}
                            onChange={e => setEditValues(v => ({ ...v, condition_notes: e.target.value }))}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            placeholder="Notes..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(off)} disabled={saving}
                              className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                              {saving ? '...' : 'Save'}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="text-xs border border-gray-200 px-2 py-1 rounded hover:bg-gray-100">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <StatusBadge status={off.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{off.condition_notes || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => startEdit(off)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto">
                            <Pencil size={11} /> Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ icon: Icon, value, label, color, bg }) {
  return (
    <div className={`${bg} flex items-center gap-2 px-3 py-1.5 rounded-xl`}>
      <Icon size={15} className={color} />
      <span className={`font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
    </div>
  );
}
