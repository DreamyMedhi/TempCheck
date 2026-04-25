import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import PatientCard from '../components/PatientCard';
import { Search } from 'lucide-react';

export default function PatientList() {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = patients.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.room.toLowerCase().includes(q);
  });

  return (
    <Layout title="All Patients" subtitle={`${filtered.length} records`}>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, ID, or room"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'admitted', label: 'Admitted' },
            { key: 'discharged', label: 'Discharged' },
            { key: 'deceased', label: 'Deceased' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <PatientCard
            key={p.id}
            patient={p}
            onClick={() => navigate(`/patient/${p.id}`)}
          />
        ))}
      </div>
    </Layout>
  );
}
