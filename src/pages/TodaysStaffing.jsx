import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import { STAFFING_TODAY, STAFFING_BENCHMARKS } from "../lib/staffing";
import { formatDate } from "../lib/clinical";
import {
  Users,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  UserX,
} from "lucide-react";

export default function TodaysStaffing() {
  const { patients } = useApp();
  const admittedCount = patients.filter((p) => p.status === "admitted").length;

  // ---------- Aggregate roster ----------
  const summary = useMemo(() => {
    const roster = STAFFING_TODAY.roster;
    const nursesOn = roster.filter(
      (s) => s.role === "nurse" && s.status === "on_shift",
    );
    const doctorsOn = roster.filter(
      (s) => s.role === "doctor" && s.status === "on_shift",
    );
    const offToday = roster.filter((s) => s.status === "off_today");
    const onLeave = roster.filter((s) => s.status === "on_leave");

    // Group on-shift staff by shift window for the timeline view
    const shiftBuckets = { Day: [], Evening: [], Night: [] };
    [...nursesOn, ...doctorsOn].forEach((s) => {
      if (shiftBuckets[s.shift]) shiftBuckets[s.shift].push(s);
    });

    return { nursesOn, doctorsOn, offToday, onLeave, shiftBuckets };
  }, []);

  // ---------- Ratios ----------
  const nurseRatio =
    summary.nursesOn.length > 0
      ? admittedCount / summary.nursesOn.length
      : Infinity;
  const doctorRatio =
    summary.doctorsOn.length > 0
      ? admittedCount / summary.doctorsOn.length
      : Infinity;

  const nurseRatioTone = ratioTone(
    nurseRatio,
    STAFFING_BENCHMARKS.patientsPerNurse,
  );
  const doctorRatioTone = ratioTone(
    doctorRatio,
    STAFFING_BENCHMARKS.patientsPerDoctor,
  );

  // ---------- Coverage gaps ----------
  const coverageWarnings = [];
  if (
    summary.shiftBuckets.Night.filter((s) => s.role === "doctor").length === 0
  ) {
    coverageWarnings.push(
      "No doctor on Night shift — escalations during 23:00–07:00 will need to be paged in.",
    );
  }
  if (summary.shiftBuckets.Night.filter((s) => s.role === "nurse").length < 2) {
    coverageWarnings.push(
      "Night shift has fewer than 2 nurses on duty — minimum safe staffing not met.",
    );
  }
  if (nurseRatioTone === "critical") {
    coverageWarnings.push(
      `Patient-to-nurse ratio is ${nurseRatio.toFixed(1)} — well above the safe benchmark of ${STAFFING_BENCHMARKS.patientsPerNurse}.`,
    );
  }

  return (
    <Layout
      title="Today's Staffing"
      subtitle={`Operational view of who's on the floor · ${formatDate(STAFFING_TODAY.date)}`}
    >
      {/* Disclaimer — this is a read-only view */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Read-only view.</span>{" "}
        Roster data is sourced from the facility's HR system. To update shifts
        or approve leave, use the staffing portal.
      </div>

      {/* KPI ratios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <RatioCard
          icon={Users}
          label="Patient-to-nurse ratio"
          ratio={nurseRatio}
          benchmark={STAFFING_BENCHMARKS.patientsPerNurse}
          tone={nurseRatioTone}
          context={`${admittedCount} patients · ${summary.nursesOn.length} nurses`}
        />
        <RatioCard
          icon={Stethoscope}
          label="Patient-to-doctor ratio"
          ratio={doctorRatio}
          benchmark={STAFFING_BENCHMARKS.patientsPerDoctor}
          tone={doctorRatioTone}
          context={`${admittedCount} patients · ${summary.doctorsOn.length} doctors`}
        />
        <CountCard
          icon={CheckCircle2}
          label="On shift now"
          value={summary.nursesOn.length + summary.doctorsOn.length}
          sub={`${summary.nursesOn.length} nurses · ${summary.doctorsOn.length} doctors`}
          tone="positive"
        />
        <CountCard
          icon={UserX}
          label="Unavailable today"
          value={summary.offToday.length + summary.onLeave.length}
          sub={`${summary.offToday.length} rest day · ${summary.onLeave.length} on leave`}
          tone="neutral"
        />
      </div>

      {/* Coverage warnings */}
      {coverageWarnings.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-amber-900 mb-1">
              Coverage warnings
            </div>
            <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
              {coverageWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Shift timeline */}
      <section className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl text-slate-900">
              Shift coverage
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Who is on duty across the 24-hour cycle
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-5">
          <ShiftBlock
            label="Day shift · 07:00 – 15:00"
            staff={summary.shiftBuckets.Day}
            isCurrent={isCurrentShift("Day")}
          />
          <ShiftBlock
            label="Evening shift · 15:00 – 23:00"
            staff={summary.shiftBuckets.Evening}
            isCurrent={isCurrentShift("Evening")}
          />
          <ShiftBlock
            label="Night shift · 23:00 – 07:00"
            staff={summary.shiftBuckets.Night}
            isCurrent={isCurrentShift("Night")}
          />
        </div>
      </section>

      {/* Two-column: on-shift detail + unavailable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On shift now */}
        <section className="card p-6">
          <h2 className="font-display text-xl text-slate-900 mb-4">
            On shift now
          </h2>
          {[...summary.nursesOn, ...summary.doctorsOn].length === 0 ? (
            <div className="text-sm text-slate-400 italic py-4">
              No staff currently on shift.
            </div>
          ) : (
            <div className="space-y-2">
              {[...summary.nursesOn, ...summary.doctorsOn].map((s) => (
                <StaffRow key={s.id} staff={s} showShift />
              ))}
            </div>
          )}
        </section>

        {/* Unavailable today */}
        <section className="card p-6">
          <h2 className="font-display text-xl text-slate-900 mb-4">
            Unavailable today
          </h2>
          {summary.offToday.length + summary.onLeave.length === 0 ? (
            <div className="text-sm text-slate-400 italic py-4">
              All staff are on duty today.
            </div>
          ) : (
            <div className="space-y-2">
              {[...summary.offToday, ...summary.onLeave].map((s) => (
                <StaffRow key={s.id} staff={s} showReason />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Diagnostic insight */}
      <section className="mt-8 card p-6 bg-slate-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary-600 shadow-card flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg text-slate-900 mb-1">
              Diagnostic insight
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {nurseRatioTone === "critical" ||
              doctorRatioTone === "critical" ? (
                <>
                  Current staffing ratios are above the safe benchmark. If
                  today's daily checks fall behind, the cause is likely{" "}
                  <b>insufficient staffing</b> rather than process failure —
                  consider calling in additional staff or escalating to facility
                  administration.
                </>
              ) : nurseRatioTone === "warning" ||
                doctorRatioTone === "warning" ? (
                <>
                  Staffing ratios are within tolerance but on the higher side.
                  Monitor today's completion rates on the Staff Activity page
                  closely — if completion drops below 80%, capacity is the
                  likely culprit.
                </>
              ) : (
                <>
                  Staffing ratios are within safe benchmarks. If completion
                  rates are lagging today, the issue is likely <b>workflow</b>,
                  not headcount — review the Staff Activity page to identify
                  bottlenecks.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// ---------- Helpers ----------

function ratioTone(ratio, benchmark) {
  if (ratio <= benchmark) return "positive";
  if (ratio <= benchmark * 1.4) return "warning";
  return "critical";
}

function isCurrentShift(shift) {
  const hour = new Date().getHours();
  if (shift === "Day") return hour >= 7 && hour < 15;
  if (shift === "Evening") return hour >= 15 && hour < 23;
  return hour >= 23 || hour < 7; // Night
}

// ---------- Sub-components ----------

function RatioCard({ icon: Icon, label, ratio, benchmark, tone, context }) {
  const toneClass = {
    positive: "text-success",
    warning: "text-warning",
    critical: "text-critical",
  }[tone];

  const display = ratio === Infinity ? "—" : ratio.toFixed(1);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className={`font-display text-3xl ${toneClass}`}>
        {display}
        <span className="text-base text-slate-400 font-sans"> : 1</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{context}</div>
      <div className="text-xs text-slate-400 mt-0.5">
        Safe benchmark: ≤ {benchmark} : 1
      </div>
    </div>
  );
}

function CountCard({ icon: Icon, label, value, sub, tone }) {
  const toneClass = {
    positive: "text-success",
    neutral: "text-slate-900",
  }[tone];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className={`font-display text-3xl ${toneClass}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function ShiftBlock({ label, staff, isCurrent }) {
  return (
    <div
      className={`rounded-lg border p-4 ${isCurrent ? "border-primary-300 bg-primary-50/40" : "border-slate-200 bg-white"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`text-sm font-semibold ${isCurrent ? "text-primary-800" : "text-slate-900"}`}
          >
            {label}
          </div>
          {isCurrent && (
            <span className="badge bg-primary-600 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Current
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {staff.filter((s) => s.role === "nurse").length} nurse
          {staff.filter((s) => s.role === "nurse").length === 1 ? "" : "s"}
          {" · "}
          {staff.filter((s) => s.role === "doctor").length} doctor
          {staff.filter((s) => s.role === "doctor").length === 1 ? "" : "s"}
        </div>
      </div>
      {staff.length === 0 ? (
        <div className="text-sm text-warning flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> No staff scheduled for this
          shift
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {staff.map((s) => (
            <div
              key={s.id}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs font-medium text-slate-700">
                {s.name}
              </span>
              <span className="text-[10px] text-slate-400 uppercase">
                {s.role === "doctor" ? "Dr" : "Nrs"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StaffRow({ staff, showShift, showReason }) {
  const initials = staff.name
    .replace(/^Dr\.\s+/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  const statusBadge = {
    on_shift: { label: "On shift", className: "bg-green-50 text-success" },
    off_today: { label: "Off today", className: "bg-slate-100 text-slate-600" },
    on_leave: { label: "On leave", className: "bg-amber-50 text-warning" },
  }[staff.status];

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          {staff.name}
        </div>
        <div className="text-xs text-slate-500">
          {staff.role === "doctor" ? "Doctor" : "Nurse"}
          {showShift && staff.status === "on_shift" && (
            <>
              {" "}
              · {staff.shift} ({staff.start} – {staff.end})
            </>
          )}
          {showReason && staff.reason && <> · {staff.reason}</>}
        </div>
      </div>
      <span className={`badge ${statusBadge.className} flex-shrink-0`}>
        {statusBadge.label}
      </span>
    </div>
  );
}
