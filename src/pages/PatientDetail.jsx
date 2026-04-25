import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import TempChart from "../components/TempChart";
import {
  formatDate,
  consecutiveFeverFreeDays,
  isFever,
  daysBetween,
  todayStr,
} from "../lib/clinical";
import { FEVER_FREE_DAYS_REQUIRED } from "../lib/constants";
import { ArrowLeft, FileText, Calendar, MapPin, User } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients } = useApp();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <Layout title="Patient not found">
        <button onClick={() => navigate(-1)} className="btn-secondary">
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

  return (
    <Layout
      title={patient.name}
      subtitle={`${patient.id} · Room ${patient.room} · Age ${patient.age}`}
      actions={
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
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
      <div className="mb-6">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <section className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              Temperature history
            </h3>
            <TempChart temps={patient.temps} />
          </section>

          {/* Reading log */}
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

          {/* Notes */}
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
    </Layout>
  );
}
