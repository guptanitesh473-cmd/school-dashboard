import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

export default function AddSchoolForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', code: '', location: '', city: '', state: 'Tamil Nadu', acquired_date: '', status: 'active',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.getSchool(id).then(s => setForm({
        name: s.name || '',
        code: s.code || '',
        location: s.location || '',
        city: s.city || '',
        state: s.state || 'Tamil Nadu',
        acquired_date: s.acquired_date || '',
        status: s.status || 'active',
      }));
    }
  }, [id, isEdit]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.updateSchool(id, form);
        navigate(`/schools/${id}`);
      } else {
        const school = await api.createSchool(form);
        navigate(`/schools/${school.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit School' : 'Add New School'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEdit ? 'Update school details.' : 'All offerings will be initialized as "No" — update them in the matrix.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="School Name *" required>
              <input value={form.name} onChange={set('name')} required placeholder="e.g. OIS Coimbatore"
                className="input" />
            </Field>
            <Field label="School Code *" required>
              <input value={form.code} onChange={set('code')} required placeholder="e.g. OIS-CBE"
                className="input uppercase" />
            </Field>
          </div>

          <Field label="Location / Area">
            <input value={form.location} onChange={set('location')} placeholder="e.g. Anna Nagar"
              className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input value={form.city} onChange={set('city')} placeholder="e.g. Coimbatore"
                className="input" />
            </Field>
            <Field label="State">
              <select value={form.state} onChange={set('state')} className="input">
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Acquired Date">
              <input type="date" value={form.acquired_date} onChange={set('acquired_date')} className="input" />
            </Field>
            {isEdit && (
              <Field label="Status">
                <select value={form.status} onChange={set('status')} className="input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5">
              <Save size={15} />
              {saving ? 'Saving...' : isEdit ? 'Update School' : 'Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
