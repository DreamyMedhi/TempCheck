import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import PatientCard from '../components/PatientCard';
import { hasTempToday, isFever, todayStr } from '../lib/clinical';
import { MIN_TEMP, MAX_TEMP, FEVER_THRESHOLD } from '../lib/constants';
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react';

export default function NursePage() {
  const { patients, recordTemperature, showToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [tempInput, setTempInput] = useState('');
  const [overrideConfirm, setOverrideConfirm] = useState(false);
  const [search, setSearch] = useState('');

  const admitted = patients.filter((p) => p.status === 'admitted');
  const pending = admitted.filter((p) => !hasTempToday(p));
  const done = admitted.filter((p) => hasTempToday(p));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return { pending, done };
    const match = (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.room.toLowerCase().includes(q);
    return { pending: pending.filter(match), done: done.filter(match) };
  }, [pending, done, search]);

  const openRecord = (patient) => {
    setSelected(patient);
    setTempInput('');
    setOverrideConfirm(false);
  };

  const handleSubmit = () => {
    const val = parseFloat(tempInput);
    if (isNaN(val)) {
      showToast('Please enter a valid number', 'error');
      return;
    }
    if (val < MIN_TEMP || val > MAX_TEMP) {
      showToast(`Temperature must be between ${MIN_TEMP}°F and ${MAX_TEMP}°F`, 'error');
      return;
    }
    const existing = selected.temps.find((t) => t.date === todayStr());
    if (existing && !overrideConfirm) {
      setOverrideConfirm(true);
      return;
    }
    recordTemperature(selected.id, val, !!existing);
    showToast(`Temperature recorded for ${selected.name}`, 'success');
    setSelected(null);
  };

  return (
    <Layout
      title="Temperature Queue"
      subtitle={`${pending.length} patients pending · ${done.length} completed today`}
    >
      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search by name, ID, or room"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Pending section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Pending today · {filtered.pending.length}
          </h2>
        </div>
        {filtered.pending.length === 0 ? (
          <div className="card p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
            <div className="font-medium text-slate-900">All caught up</div>
            <div className="text-sm text-slate-500 mt-1">Every admitted patient has had their temperature recorded today.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.pending.map((p) => (
              <PatientCard key={p.id} patient={p} onClick={() => openRecord(p)} />
            ))}
          </div>
        )}
      </section>

      {/* Completed section */}
      {filtered.done.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-success" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Completed today · {filtered.done.length}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.done.map((p) => (
              <PatientCard key={p.id} patient={p} onClick={() => openRecord(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Record modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Record temperature — ${selected.name}` : ''}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>
              {overrideConfirm ? 'Override & save' : 'Save reading'}
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-slate-500">Room {selected.room} · Age {selected.age}</div>
                <div className="font-mono text-xs text-slate-400 mt-0.5">{selected.id}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Today's date</div>
                <div className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            <div>
              <label className="label">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                className="input text-lg"
                placeholder="e.g. 99.2"
                value={tempInput}
                onChange={(e) => { setTempInput(e.target.value); setOverrideConfirm(false); }}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Valid range: {MIN_TEMP}°F – {MAX_TEMP}°F · Fever threshold: {FEVER_THRESHOLD}°F
              </p>
            </div>

            {/* Fever preview */}
            {tempInput && !isNaN(parseFloat(tempInput)) && parseFloat(tempInput) >= MIN_TEMP && parseFloat(tempInput) <= MAX_TEMP && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${
                isFever(parseFloat(tempInput))
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                <span className="font-medium">
                  {isFever(parseFloat(tempInput)) ? 'Fever detected' : 'Below fever threshold'}
                </span>
                {' — '}
                {isFever(parseFloat(tempInput))
                  ? 'This will reset the fever-free day counter.'
                  : 'This reading will count toward the 3-day discharge criterion.'}
              </div>
            )}

            {/* Duplicate warning */}
            {overrideConfirm && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning" />
                <div>
                  <div className="font-medium">Temperature already recorded today</div>
                  <div className="mt-0.5">
                    A reading of <b>{selected.temps.find((t) => t.date === todayStr())?.value}°F</b> was logged by{' '}
                    <b>{selected.temps.find((t) => t.date === todayStr())?.recordedBy}</b>. Saving will overwrite the existing entry
                    and log a correction.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}
