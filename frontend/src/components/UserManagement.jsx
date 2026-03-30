import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2, X, Save, Users, Eye, EyeOff, ShieldCheck, School } from 'lucide-react';

function Spinner() {
  return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" /></div>;
}

function F({ label, children }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterRole, setFilterRole] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    try {
      await api.deleteUser(u.id);
      load();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const schoolCount = users.filter(u => u.role === 'school').length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" /> User Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage login accounts for admin and school users</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Users" value={users.length} color="bg-indigo-600" />
        <StatCard label="Admin Users" value={adminCount} color="bg-purple-600" icon={<ShieldCheck size={18} />} />
        <StatCard label="School Users" value={schoolCount} color="bg-green-600" icon={<School size={18} />} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filter by role:</span>
        {['', 'admin', 'school'].map(r => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterRole === r
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Name / School</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 font-semibold">{u.username}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.name}</div>
                    {u.school_name && u.role === 'school' && (
                      <div className="text-xs text-gray-400 mt-0.5">{u.school_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {u.role === 'admin' ? <ShieldCheck size={11} /> : <School size={11} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Default password note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>Default password for all school accounts:</strong> <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">School@123</span>
        &nbsp;— Share with each school and ask them to contact admin to change it.
      </div>

      {(editUser || showAdd) && (
        <UserModal
          user={editUser}
          onClose={() => { setEditUser(null); setShowAdd(false); }}
          onSave={async (data) => {
            if (editUser) await api.updateUser(editUser.id, data);
            else await api.createUser(data);
            setEditUser(null); setShowAdd(false); load();
          }}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    name: user?.name || '',
    role: user?.role || 'school',
    school_name: user?.school_name || '',
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.username) return setError('Username is required');
    if (!user && !form.password) return setError('Password is required for new users');
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't overwrite if blank on edit
      await onSave(payload);
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold">{user ? 'Edit User' : 'Add User'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {error && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          <F label="Username *">
            <input
              value={form.username}
              onChange={set('username')}
              disabled={!!user}
              placeholder="e.g. ois-ark"
              className={inputCls + (user ? ' bg-gray-50 text-gray-400' : '')}
            />
          </F>
          <F label={user ? 'New Password (leave blank to keep)' : 'Password *'}>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder={user ? 'Leave blank to keep current' : 'Enter password'}
                className={inputCls + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </F>
          <F label="Display Name">
            <input value={form.name} onChange={set('name')} placeholder="Full name or school name" className={inputCls} />
          </F>
          <F label="Role">
            <select value={form.role} onChange={set('role')} className={inputCls}>
              <option value="school">School</option>
              <option value="admin">Admin</option>
            </select>
          </F>
          {form.role === 'school' && (
            <F label="School Name (for display)">
              <input value={form.school_name} onChange={set('school_name')} placeholder="e.g. OIS Arkere" className={inputCls} />
            </F>
          )}
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

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`${color} text-white rounded-2xl p-4 flex items-center gap-3`}>
      {icon && <div className="opacity-80">{icon}</div>}
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs opacity-75">{label}</div>
      </div>
    </div>
  );
}
