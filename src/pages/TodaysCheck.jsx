import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PatientCard from "../components/PatientCard";

import { MIN_TEMP, MAX_TEMP, FEVER_THRESHOLD } from "../lib/constants";
import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";
import {
  hasTempToday,
  isFever,
  todayStr,
  isDischargeEligible,
} from "../lib/clinical";
export default function TodaysCheck() {
  const { patients, currentUser, recordTemperature, showToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [tempInput, setTempInput] = useState("");
  const [overrideConfirm, setOverrideConfirm] = useState(false);

  const myPatients = useMemo(() => {
    return patients.filter(
      (p) =>
        p.status === "admitted" &&
        p.assignedNurse === currentUser?.name &&
        !p.dischargeFlagged && // skip flagged patients
        !isDischargeEligible(p), // skip eligible patients
    );
  }, [patients, currentUser]);

  const pending = myPatients.filter((p) => !hasTempToday(p));
  const done = myPatients.filter((p) => hasTempToday(p));

  const handleSubmit = () => {
    const val = parseFloat(tempInput);
    if (isNaN(val)) {
      showToast("Please enter a valid number", "error");
      return;
    }
    if (val < MIN_TEMP || val > MAX_TEMP) {
      showToast(
        `Temperature must be between ${MIN_TEMP}°F and ${MAX_TEMP}°F`,
        "error",
      );
      return;
    }
    const existing = selected.temps.find((t) => t.date === todayStr());
    if (existing && !overrideConfirm) {
      setOverrideConfirm(true);
      return;
    }
    recordTemperature(selected.id, val, !!existing);
    showToast(`Temperature recorded for ${selected.name}`, "success");
    setSelected(null);
    setTempInput("");
    setOverrideConfirm(false);
  };

  return (
    <Layout
      title="Today's Check"
      subtitle={`${myPatients.length} patient${myPatients.length === 1 ? "" : "s"} assigned to you · ${pending.length} pending`}
    >
      {/* Context banner */}
      <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50/40 px-4 py-3 flex gap-3 text-sm">
        <ClipboardList className="w-5 h-5 flex-shrink-0 text-primary-600" />
        <div className="text-primary-900">
          These are the patients assigned to you for today's shift. Once you
          record a temperature, the patient is automatically queued for their
          assigned doctor's review.
        </div>
      </div>

      {/* Empty state */}
      {myPatients.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-slate-400" />
          </div>
          <div className="font-display text-xl text-slate-900 mb-1">
            No patients assigned today
          </div>
          <div className="text-sm text-slate-500 max-w-md mx-auto">
            Either you're not on shift today, or the assignment system hasn't
            run yet. Contact the Head Doctor if this seems wrong.
          </div>
        </div>
      ) : (
        <>
          {/* Pending */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Pending today · {pending.length}
              </h2>
            </div>
            {pending.length === 0 ? (
              <div className="card p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
                <div className="font-medium text-slate-900">All caught up</div>
                <div className="text-sm text-slate-500 mt-1">
                  Every patient assigned to you has had their temperature
                  recorded today.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pending.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Done */}
          {done.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-success" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  Completed today · {done.length}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {done.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Record modal */}
      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setTempInput("");
          setOverrideConfirm(false);
        }}
        title={selected ? `Record temperature — ${selected.name}` : ""}
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setSelected(null);
                setTempInput("");
                setOverrideConfirm(false);
              }}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {overrideConfirm ? "Override & save" : "Save reading"}
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-slate-500">
                  Room {selected.room} · Age {selected.age}
                </div>
                <div className="font-mono text-xs text-slate-400 mt-0.5">
                  {selected.id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Today's date</div>
                <div className="font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
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
                onChange={(e) => {
                  setTempInput(e.target.value);
                  setOverrideConfirm(false);
                }}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Valid range: {MIN_TEMP}°F – {MAX_TEMP}°F · Fever threshold:{" "}
                {FEVER_THRESHOLD}°F
              </p>
            </div>

            {tempInput &&
              !isNaN(parseFloat(tempInput)) &&
              parseFloat(tempInput) >= MIN_TEMP &&
              parseFloat(tempInput) <= MAX_TEMP && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    isFever(parseFloat(tempInput))
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-green-50 border-green-200 text-green-800"
                  }`}
                >
                  <span className="font-medium">
                    {isFever(parseFloat(tempInput))
                      ? "Fever detected"
                      : "Below fever threshold"}
                  </span>
                  {" — "}
                  {isFever(parseFloat(tempInput))
                    ? "This will reset the fever-free day counter."
                    : "This reading will count toward the 3-day discharge criterion."}
                </div>
              )}

            {overrideConfirm && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning" />
                <div>
                  <div className="font-medium">
                    Temperature already recorded today
                  </div>
                  <div className="mt-0.5">
                    A reading of{" "}
                    <b>
                      {selected.temps.find((t) => t.date === todayStr())?.value}
                      °F
                    </b>{" "}
                    was logged by{" "}
                    <b>
                      {
                        selected.temps.find((t) => t.date === todayStr())
                          ?.recordedBy
                      }
                    </b>
                    . Saving will overwrite the existing entry.
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
