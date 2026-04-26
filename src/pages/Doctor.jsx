import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PatientCard from "../components/PatientCard";
import TempChart from "../components/TempChart";
import {
  hasTempToday,
  hasVisitToday,
  consecutiveFeverFreeDays,
  isDischargeEligible,
  daysUntilEligible,
  formatDate,
} from "../lib/clinical";
import { FEVER_FREE_DAYS_REQUIRED } from "../lib/constants";
import {
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  FileText,
} from "lucide-react";

export default function DoctorPage() {
  const { patients, markVisitComplete, addNote, flagForDischarge, showToast } =
    useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const admitted = patients.filter(
    (p) =>
      p.status === "admitted" && !p.dischargeFlagged && !isDischargeEligible(p),
  );
  const readyForVisit = admitted.filter(
    (p) => hasTempToday(p) && !hasVisitToday(p),
  );
  const visited = admitted.filter((p) => hasVisitToday(p));
  const blocked = admitted.filter((p) => !hasTempToday(p) && !hasVisitToday(p));

  const handleMarkVisit = (p) => {
    if (!hasTempToday(p)) {
      showToast(
        "Temperature must be recorded before a visit can be logged",
        "error",
      );
      return;
    }
    markVisitComplete(p.id);
    showToast(`Visit logged for ${p.name}`, "success");
  };

  const handleFlagDischarge = (p) => {
    if (!isDischargeEligible(p)) {
      showToast(
        `Patient needs ${daysUntilEligible(p)} more fever-free day(s) before discharge`,
        "error",
      );
      return;
    }
    flagForDischarge(p.id);
    showToast(
      `${p.name} flagged for discharge. Admin has been notified.`,
      "success",
    );
    setSelected(null);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote(selected.id, note.trim());
    setNote("");
    showToast("Note added to patient record", "success");
  };

  return (
    <Layout
      title="Visit Queue"
      subtitle={`${readyForVisit.length} ready for visit · ${blocked.length} awaiting temperature · ${visited.length} completed`}
    >
      {/* Ready for visit */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary-500" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Ready for visit · {readyForVisit.length}
          </h2>
        </div>
        {readyForVisit.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">
            No patients ready. Temperatures must be recorded first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {readyForVisit.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                onClick={() => setSelected(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Blocked: no temp yet */}
      {blocked.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Awaiting temperature · {blocked.length}
            </h2>
          </div>
          <div className="card bg-amber-50/50 border-amber-200 p-4 mb-3 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="text-amber-900">
              These patients have not yet had their temperature recorded today.
              Visits cannot be logged until a nurse records it.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {blocked.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                onClick={() => setSelected(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {visited.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-success" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Visited today · {visited.length}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visited.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                onClick={() => setSelected(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Doctor patient drawer (modal) */}
      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setNote("");
        }}
        title={selected ? `${selected.name} — Clinical Review` : ""}
        footer={
          selected && (
            <>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/patient/${selected.id}`)}
              >
                Full record
              </button>
              {isDischargeEligible(selected) && !selected.dischargeFlagged && (
                <button
                  className="btn-primary"
                  onClick={() => handleFlagDischarge(selected)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Flag for discharge
                </button>
              )}
              {!hasVisitToday(selected) && hasTempToday(selected) && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    handleMarkVisit(selected);
                    setSelected(null);
                  }}
                >
                  <Stethoscope className="w-4 h-4" />
                  Mark visit complete
                </button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Room
                </div>
                <div className="font-medium mt-0.5">{selected.room}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Admitted
                </div>
                <div className="font-medium mt-0.5">
                  {formatDate(selected.admittedOn)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Fever-free streak
                </div>
                <div className="font-medium mt-0.5">
                  {consecutiveFeverFreeDays(selected)} /{" "}
                  {FEVER_FREE_DAYS_REQUIRED} days
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                Temperature trend
              </div>
              <TempChart temps={selected.temps} />
            </div>

            {/* Constraint: no temp today */}
            {!hasTempToday(selected) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning" />
                <div>
                  <div className="font-medium">
                    Temperature not yet recorded today
                  </div>
                  <div className="mt-0.5">
                    Per facility protocol, visits cannot be logged until a nurse
                    records today's temperature.
                  </div>
                </div>
              </div>
            )}

            {/* Discharge eligibility */}
            {isDischargeEligible(selected) && !selected.dischargeFlagged && (
              <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 flex gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-primary-600" />
                <div>
                  <div className="font-medium">Eligible for discharge</div>
                  <div className="mt-0.5">
                    Patient has completed {FEVER_FREE_DAYS_REQUIRED} consecutive
                    fever-free days.
                  </div>
                </div>
              </div>
            )}

            {selected.dischargeFlagged && (
              <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900">
                <div className="font-medium">Flagged for discharge</div>
                <div className="mt-0.5">
                  By {selected.dischargeFlaggedBy} on{" "}
                  {formatDate(selected.dischargeFlaggedOn)}. Awaiting admin
                  action.
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                Clinical notes
              </div>
              {selected.notes.length === 0 ? (
                <div className="text-sm text-slate-400 italic">
                  No notes yet.
                </div>
              ) : (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {selected.notes.map((n, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <FileText className="w-3 h-3" />
                        {n.doctor} · {formatDate(n.date)}
                      </div>
                      <div className="text-slate-700">{n.text}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Add a clinical note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                />
                <button
                  className="btn-secondary"
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
