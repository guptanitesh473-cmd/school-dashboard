import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function StatsView() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">School-wise Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {stats.map(s => {
          const pct = s.total ? Math.round((s.yes / s.total) * 100) : 0;
          return (
            <div key={s.school.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{s.school.name}</h3>
                  <p className="text-xs text-gray-400">{s.school.code} · {s.school.city}</p>
                </div>
                <span className="text-2xl font-bold text-indigo-600">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <StatPill icon={CheckCircle} value={s.yes} label="Available" color="text-green-600" bg="bg-green-50" />
                <StatPill icon={XCircle} value={s.no} label="Not Available" color="text-red-600" bg="bg-red-50" />
                <StatPill icon={Clock} value={s.in_future} label="In Future" color="text-amber-600" bg="bg-amber-50" />
              </div>
            </div>
          );
        })}
      </div>

      <ComparisonTable stats={stats} />
    </div>
  );
}

function StatPill({ icon: Icon, value, label, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-2`}>
      <Icon size={16} className={`${color} mx-auto mb-0.5`} />
      <div className={`font-bold text-lg leading-none ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function ComparisonTable({ stats }) {
  if (!stats.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-600" />
          Comparative Overview
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b">
              <th className="px-4 py-3 text-left">School</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center text-green-700">Available</th>
              <th className="px-4 py-3 text-center text-red-700">Not Available</th>
              <th className="px-4 py-3 text-center text-amber-700">In Future</th>
              <th className="px-4 py-3 text-center">Completion</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => {
              const pct = s.total ? Math.round((s.yes / s.total) * 100) : 0;
              return (
                <tr key={s.school.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.school.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.school.city}</td>
                  <td className="px-4 py-3 text-center">{s.total}</td>
                  <td className="px-4 py-3 text-center font-semibold text-green-700">{s.yes}</td>
                  <td className="px-4 py-3 text-center font-semibold text-red-700">{s.no}</td>
                  <td className="px-4 py-3 text-center font-semibold text-amber-700">{s.in_future}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-indigo-600">{pct}%</span>
                    </div>
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

function Spinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
    </div>
  );
}
