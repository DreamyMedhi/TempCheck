import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { BED_CAPACITY } from '../lib/constants';
import { AlertTriangle, UserPlus } from 'lucide-react';

export default function AdmitNew() {
  const { patients, admitPatient, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', age: '', room: '' });

  const admitted = patients.filter((p) => p.status === 'admitted');
  const atCapacity = admitted.length >= BED_CAPACITY;
  const occupiedRooms = new Set(admitted.map((p) => p.room));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (atCapacity) {
      showToast('Facility at full capacity. Discharge a patient first.', 'error');
      return;
    }
    if (!form.name.trim() || !form.age || !form.room.trim()) {
      showToast('Please complete all required fields', 'error');
      return;
    }
    if (occupiedRooms.has(form.room.trim())) {
      showToast(`Room ${form.room} is already occupied. Please assign a different room.`, 'error');
      return;
    }
    const age = parseInt(form.age, 10);
    if (isNaN(age) || age < 0 || age > 120) {
      showToast('Please enter a valid age', 'error');
      return;
    }
    const newId = admitPatient({ ...form, age });
    showToast(`Patient admitted · ID ${newId}`, 'success');
    navigate('/admin');
  };

  return (
    <Layout title="Admit New Patient" subtitle="Register a new patient into the facility">
      <div className="max-w-xl">
        {atCapacity && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-critical" />
            <div>
              <div className="font-medium">Facility is at full capacity</div>
              <div className="mt-0.5">
                All {BED_CAPACITY} beds are occupied. You cannot admit new patients until at least one is discharged.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="label">Full name <span className="text-critical">*</span></label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Arjun Kumar"
              disabled={atCapacity}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age <span className="text-critical">*</span></label>
              <input
                type="number"
                className="input"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 32"
                disabled={atCapacity}
              />
            </div>
            <div>
              <label className="label">Room assignment <span className="text-critical">*</span></label>
              <input
                className="input"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. 14C"
                disabled={atCapacity}
              />
              <p className="text-xs text-slate-500 mt-1.5">Must be a vacant room</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {admitted.length} / {BED_CAPACITY} beds occupied
            </div>
            <button type="submit" className="btn-primary" disabled={atCapacity}>
              <UserPlus className="w-4 h-4" />
              Admit patient
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
