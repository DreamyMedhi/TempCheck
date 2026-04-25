import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useSmartBack } from "../lib/useSmartBack";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import TempChart from "../components/TempChart";
import {
  formatDate,
  consecutiveFeverFreeDays,
  isFever,
  daysBetween,
  todayStr,
} from "../lib/clinical";
import { FEVER_FREE_DAYS_REQUIRED } from "../lib/constants";
import {
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  User,
  DoorOpen,
  CheckCircle2,
} from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleBack = useSmartBack("/patients");
  const { patients, currentUser, executeDischarge, showToast } = useApp();
  const patient = patients.find((p) => p.id === id);

  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);

  if (!patient) {
    return (
      <Layout title="Patient not found">
        <button onClick={handleBack} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </Layout>
    );
  }

  const streak = consecutiveFeverFreeDays(patient);
  const stayLength = daysBetween(
    patient.admittedOn,
    patient.dischargedOn || patient.deceasedOn || todayStr(),
  );
  const sortedTemps = [...patient.temps].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  // Authorization: doctors, head doctors, and admin can discharge a flagged patient.
  const canDischarge =
    ["doctor", "head_doctor", "admin"].includes(currentUser?.role) &&
    patient.dischargeFlagged &&
    patient.status === "admitted";

  const handleDischarge = () => {
    executeDischarge(patient.id);
    showToast(
      `${patient.name} discharged · Bed ${patient.room} now available`,
      "success",
    );
    setShowDischargeConfirm(false);
    navigate("/patients");
  };

  return (
    <Layout
      title={patient.name}
      subtitle={`${patient.id} · Room ${patient.room} · Age ${patient.age}`}
      actions={
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleBack}
            className="btn-secondary flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {canDischarge && (
            <button
              onClick={() => setShowDischargeConfirm(true)}
              className="btn-primary flex-1 sm:flex-none"
            >
              <DoorOpen className="w-4 h-4" />
              Discharge
            </button>
          )}
        </div>
      }
    >
      {/* Status banner */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span
          className={`badge text-sm px-3 py-1 ${
            patient.status === "admitted"
              ? "bg-primary-50 text-primary-700"
              : patient.status === "discharged"
                ? "bg-green-50 text-success"
                : "bg-red-50 text-critical"
          }`}
        >
          {patient.status === "admitted"
            ? "Currently admitted"
            : patient.status === "discharged"
              ? `Discharged on ${formatDate(patient.dischargedOn)}`
              : `Deceased on ${formatDate(patient.deceasedOn)}`}
        </span>
        {patient.dischargeFlagged && patient.status === "admitted" && (
          <span className="badge bg-primary-100 text-primary-800 text-sm px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Flagged for discharge by {patient.dischargeFlaggedBy} on{" "}
            {formatDate(patient.dischargeFlaggedOn)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              Temperature history
            </h3>
            <TempChart temps={patient.temps} />
          </section>

          <section className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              Reading log
            </h3>
            {sortedTemps.length === 0 ? (
              <div className="text-sm text-slate-400 italic">
                No readings recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 -mx-6">
                {sortedTemps.map((t, i) => (
                  <div
                    key={i}
                    className="px-6 py-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {formatDate(t.date)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.recordedBy} · {t.time}
                      </div>
                    </div>
                    <div
                      className={`font-display text-xl ${isFever(t.value) ? "text-critical" : "text-success"}`}
                    >
                      {t.value}°F
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              Clinical notes
            </h3>
            {patient.notes.length === 0 ? (
              <div className="text-sm text-slate-400 italic">No notes yet.</div>
            ) : (
              <div className="space-y-3">
                {patient.notes.map((n, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="font-medium">{n.doctor}</span>
                      <span>·</span>
                      <span>{formatDate(n.date)}</span>
                    </div>
                    <div className="text-sm text-slate-700">{n.text}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500">Age</dt>
                  <dd className="font-medium">{patient.age}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500">Room</dt>
                  <dd className="font-medium">{patient.room}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500">Admitted</dt>
                  <dd className="font-medium">
                    {formatDate(patient.admittedOn)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Clinical status
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">Fever-free streak</div>
                <div className="font-display text-2xl text-slate-900">
                  {streak}
                  <span className="text-base text-slate-400">
                    {" "}
                    / {FEVER_FREE_DAYS_REQUIRED} days
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Length of stay</div>
                <div className="font-display text-2xl text-slate-900">
                  {stayLength}
                  <span className="text-base text-slate-400"> days</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total readings</div>
                <div className="font-display text-2xl text-slate-900">
                  {patient.temps.length}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Discharge confirmation modal */}
      <Modal
        open={showDischargeConfirm}
        onClose={() => setShowDischargeConfirm(false)}
        title="Confirm discharge"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setShowDischargeConfirm(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleDischarge}>
              <DoorOpen className="w-4 h-4" />
              Confirm discharge
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to discharge <b>{patient.name}</b> from Room{" "}
            <b>{patient.room}</b>?
          </p>
          <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Length of stay</span>
              <span className="font-medium text-slate-900">
                {stayLength} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fever-free streak</span>
              <span className="font-medium text-slate-900">{streak} days</span>
            </div>
            {patient.dischargeFlaggedBy && (
              <div className="flex justify-between">
                <span className="text-slate-500">Flagged by</span>
                <span className="font-medium text-slate-900">
                  {patient.dischargeFlaggedBy}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This action will free up Room {patient.room} immediately and cannot
            be undone.
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
