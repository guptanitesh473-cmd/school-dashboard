import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Eye, Pencil, Trash2, MapPin, Calendar } from 'lucide-react';
import { useIsSchool } from '../contexts/UserContext';

export default function SchoolsList() {
  const isSchool = useIsSchool();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => api.getSchools().then(setSchools).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (school) => {
    if (!confirm(`Delete "${school.name}"? This will remove all associated offering data.`)) return;
    await api.deleteSchool(school.id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Schools ({schools.length})</h2>
        {!isSchool && (
          <Link to="/schools/new" className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={15} /> Add School
          </Link>
        )}
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-3">No schools added yet.</p>
          <Link to="/schools/new" className="btn-primary text-sm">Add your first school</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map(school => (
            <div key={school.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{school.name}</h3>
                  <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
                    {school.code}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {school.status}
                </span>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                {(school.city || school.state) && (
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {[school.city, school.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {school.acquired_date && (
                  <p className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    Acquired: {new Date(school.acquired_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/schools/${school.id}`)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs btn-secondary py-1.5"
                >
                  <Eye size={13} /> View
                </button>
                {!isSchool && (
                  <>
                    <button
                      onClick={() => navigate(`/schools/${school.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs btn-secondary py-1.5"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(school)}
                      className="flex items-center justify-center gap-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
