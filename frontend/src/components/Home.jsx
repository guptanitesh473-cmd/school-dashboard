import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Building2, Construction, School, MapPin } from 'lucide-react';

export default function Home() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getSchools().then(setSchools).finally(() => setLoading(false));
  }, []);

  const handleUpdate = useCallback(async (id, field, value) => {
    // Optimistic update first
    setSchools(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    try {
      const updated = await api.updateSchool(id, { [field]: value });
      setSchools(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    } catch (err) {
      console.error('Save failed:', err);
      // Revert is handled by re-fetching
      api.getSchools().then(setSchools);
    }
  }, []);

  if (loading) return <Spinner />;

  const total = schools.length;
  const newBuilding = schools.filter(s => s.school_type === 'new_building').length;
  const existing = schools.filter(s => s.school_type !== 'new_building').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Summary across all acquired schools</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Building2} color="bg-indigo-600" value={total} label="Total Schools" />
        <StatCard icon={Construction} color="bg-amber-500" value={newBuilding} label="New Building Schools" />
        <StatCard icon={School} color="bg-green-600" value={existing} label="Existing (Taken Over)" />
      </div>

      {/* Schools table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <MapPin size={16} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-800">All Schools</h3>
          <span className="ml-1 text-xs text-gray-400">— click Principal or ZBH to edit</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[180px]">Branch Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[160px]">
                  Principal Name <span className="text-indigo-400 font-normal">✎</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[130px]">
                  ZBH Name <span className="text-indigo-400 font-normal">✎</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Academic Start</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[150px]">
                  SPOC Teacher Training <span className="text-indigo-400 font-normal">✎</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">
                  SPOC Clicker <span className="text-indigo-400 font-normal">✎</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[120px]">
                  CoD-1 <span className="text-indigo-400 font-normal">✎</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[120px]">
                  CoD-2 <span className="text-indigo-400 font-normal">✎</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schools.map((school, idx) => (
                <SchoolRow
                  key={school.id}
                  idx={idx}
                  school={school}
                  onUpdate={handleUpdate}
                  onNavigate={() => navigate(`/schools/${school.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SchoolRow({ idx, school, onUpdate, onNavigate }) {
  const [type, setType] = useState(school.school_type || 'existing');
  const [month, setMonth] = useState(school.academic_start_month || 'June');

  // Sync if parent updates (e.g. after server confirms)
  useEffect(() => { setType(school.school_type || 'existing'); }, [school.school_type]);
  useEffect(() => { setMonth(school.academic_start_month || 'June'); }, [school.academic_start_month]);

  const handleType = (e) => {
    const val = e.target.value;
    setType(val);
    onUpdate(school.id, 'school_type', val);
  };

  const handleMonth = (e) => {
    const val = e.target.value;
    setMonth(val);
    onUpdate(school.id, 'academic_start_month', val);
  };

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
      <td
        className="px-4 py-2.5 font-medium text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
        onClick={onNavigate}
      >
        {school.name}
      </td>
      <td className="px-4 py-2.5 text-gray-600">{school.city || school.location || '—'}</td>

      {/* Type */}
      <td className="px-4 py-2.5">
        <select
          value={type}
          onChange={handleType}
          className={`text-xs border rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer font-medium ${
            type === 'new_building'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          <option value="existing">Existing</option>
          <option value="new_building">New Building</option>
        </select>
      </td>

      {/* Principal */}
      <td className="px-4 py-2.5">
        <InlineText
          value={school.principal_name}
          placeholder="Add principal…"
          onSave={val => onUpdate(school.id, 'principal_name', val)}
        />
      </td>

      {/* ZBH */}
      <td className="px-4 py-2.5">
        <InlineText
          value={school.zbh_name}
          placeholder="Add ZBH…"
          onSave={val => onUpdate(school.id, 'zbh_name', val)}
        />
      </td>

      {/* Academic Start */}
      <td className="px-4 py-2.5">
        <select
          value={month}
          onChange={handleMonth}
          className={`text-xs border rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer font-medium ${
            month === 'April'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-gray-50 text-gray-600'
          }`}
        >
          <option value="April">April</option>
          <option value="June">June</option>
        </select>
      </td>

      {/* SPOC Teacher Training */}
      <td className="px-4 py-2.5">
        <InlineText
          value={school.spoc_teacher_training}
          placeholder="Add SPOC…"
          onSave={val => onUpdate(school.id, 'spoc_teacher_training', val)}
        />
      </td>

      {/* SPOC Clicker */}
      <td className="px-4 py-2.5">
        <InlineText
          value={school.spoc_clicker}
          placeholder="Add SPOC…"
          onSave={val => onUpdate(school.id, 'spoc_clicker', val)}
        />
      </td>

      {/* CoD-1 */}
      <td className="px-4 py-2.5">
        <InlineText
          value={school.cod1}
          placeholder="Add CoD-1…"
          onSave={val => onUpdate(school.id, 'cod1', val)}
        />
      </td>

      {/* CoD-2 */}
      <td className="px-4 py-2.5">
        <InlineText
          value={school.cod2}
          placeholder="Add CoD-2…"
          onSave={val => onUpdate(school.id, 'cod2', val)}
        />
      </td>
    </tr>
  );
}

function InlineText({ value, placeholder, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(value || '');
  }, [value, editing]);

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft(value || '');
    setEditing(true);
    // Focus on next tick after re-render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== (value || '').trim()) onSave(trimmed);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { setEditing(false); setDraft(value || ''); }
        }}
        onClick={e => e.stopPropagation()}
        className="w-full text-sm border border-indigo-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      className={`block w-full cursor-text rounded px-2 py-1 border border-transparent hover:border-gray-200 hover:bg-white transition-all select-none ${
        value ? 'text-gray-700' : 'text-gray-300 italic'
      }`}
    >
      {value || placeholder}
    </span>
  );
}

function StatCard({ icon: Icon, color, value, label }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{label}</div>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}
