import {
  Thermometer,
  Stethoscope,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DoorOpen,
} from "lucide-react";
import {
  hasTempToday,
  hasVisitToday,
  consecutiveFeverFreeDays,
  isDischargeEligible,
  isFever,
  formatDate,
} from "../lib/clinical";
import { FEVER_FREE_DAYS_REQUIRED } from "../lib/constants";

export default function PatientCard({ patient, onClick, highlight }) {
  const latest = patient.temps[patient.temps.length - 1];
  const streak = consecutiveFeverFreeDays(patient);
  const eligible = isDischargeEligible(patient);
  const isAdmitted = patient.status === "admitted";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card hover:shadow-card-hover transition p-5 ${
        highlight ? "ring-2 ring-primary-400 ring-offset-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-400">
              {patient.id}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Room {patient.room}</span>
          </div>
          <h3 className="font-semibold text-slate-900 truncate">
            {patient.name}
          </h3>
          <div className="text-xs text-slate-500 mt-0.5">
            Age {patient.age} · Admitted {formatDate(patient.admittedOn)}
          </div>
        </div>

        {/* Latest temp — only show for admitted patients with readings */}
        {isAdmitted && latest && (
          <div
            className={`flex items-baseline gap-0.5 ${isFever(latest.value) ? "text-critical" : "text-success"}`}
          >
            <span className="font-display text-2xl leading-none">
              {latest.value}
            </span>
            <span className="text-xs font-medium">°F</span>
          </div>
        )}
      </div>

      {/* Status badges — different sets for admitted vs. closed cases */}
      <div className="flex items-center flex-wrap gap-2 mt-4">
        {isAdmitted ? (
          <>
            {/* Today's temp status */}
            <span
              className={`badge ${hasTempToday(patient) ? "bg-green-50 text-success" : "bg-amber-50 text-warning"}`}
            >
              <Thermometer className="w-3 h-3" />
              {hasTempToday(patient) ? "Temp logged today" : "Temp pending"}
            </span>

            {/* Today's visit status */}
            <span
              className={`badge ${hasVisitToday(patient) ? "bg-green-50 text-success" : "bg-slate-100 text-slate-600"}`}
            >
              <Stethoscope className="w-3 h-3" />
              {hasVisitToday(patient) ? "Visited" : "Visit pending"}
            </span>

            {/* Discharge streak */}
            {eligible ? (
              <span className="badge bg-primary-50 text-primary-700">
                <CheckCircle2 className="w-3 h-3" />
                Discharge eligible
              </span>
            ) : streak > 0 ? (
              <span className="badge bg-slate-100 text-slate-600">
                <Clock className="w-3 h-3" />
                {streak}/{FEVER_FREE_DAYS_REQUIRED} fever-free days
              </span>
            ) : null}

            {patient.dischargeFlagged && (
              <span className="badge bg-primary-100 text-primary-800">
                <AlertTriangle className="w-3 h-3" />
                Flagged for discharge
              </span>
            )}
          </>
        ) : patient.status === "discharged" ? (
          <span className="badge bg-green-50 text-success">
            <DoorOpen className="w-3 h-3" />
            Discharged on {formatDate(patient.dischargedOn)}
          </span>
        ) : patient.status === "deceased" ? (
          <span className="badge bg-red-50 text-critical">
            <AlertTriangle className="w-3 h-3" />
            Deceased on {formatDate(patient.deceasedOn)}
          </span>
        ) : null}
      </div>
    </button>
  );
}
