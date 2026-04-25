import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import {
  hasTempToday,
  hasVisitToday,
  todayStr,
  formatDate,
} from "../lib/clinical";
import {
  Thermometer,
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function StaffActivity() {
  const { patients } = useApp();
  const today = todayStr();

  // ---------- Aggregate today's activity ----------
  const stats = useMemo(() => {
    const admitted = patients.filter((p) => p.status === "admitted");

    // Count temperatures recorded today, grouped by nurse
    const tempsByNurse = {};
    admitted.forEach((p) => {
      const todayTemp = p.temps.find((t) => t.date === today);
      if (todayTemp) {
        const nurse = todayTemp.recordedBy;
        if (!tempsByNurse[nurse])
          tempsByNurse[nurse] = { count: 0, lastTime: "" };
        tempsByNurse[nurse].count += 1;
        if (todayTemp.time > tempsByNurse[nurse].lastTime) {
          tempsByNurse[nurse].lastTime = todayTemp.time;
        }
      }
    });

    // Count visits today (we don't have per-doctor records in the seed, so we
    // attribute all of today's visits to the on-shift doctor — in production this
    // would be tracked per-visit)
    const visitsToday = admitted.filter(hasVisitToday).length;

    // Patients still missing temp / visit today (the "what's blocking us" list)
    const missingTemp = admitted.filter((p) => !hasTempToday(p));
    const missingVisit = admitted.filter(
      (p) => hasTempToday(p) && !hasVisitToday(p),
    );

    // Notes added today, by doctor
    const notesByDoctor = {};
    admitted.forEach((p) => {
      p.notes
        .filter((n) => n.date === today)
        .forEach((n) => {
          notesByDoctor[n.doctor] = (notesByDoctor[n.doctor] || 0) + 1;
        });
    });

    // Discharges flagged today, by doctor
    const dischargesByDoctor = {};
    admitted.forEach((p) => {
      if (p.dischargeFlagged && p.dischargeFlaggedOn === today) {
        dischargesByDoctor[p.dischargeFlaggedBy] =
          (dischargesByDoctor[p.dischargeFlaggedBy] || 0) + 1;
      }
    });

    return {
      admitted,
      tempsByNurse,
      visitsToday,
      missingTemp,
      missingVisit,
      notesByDoctor,
      dischargesByDoctor,
      totalTempsToday: Object.values(tempsByNurse).reduce(
        (s, n) => s + n.count,
        0,
      ),
    };
  }, [patients, today]);

  const tempCompletion =
    stats.admitted.length > 0
      ? Math.round((stats.totalTempsToday / stats.admitted.length) * 100)
      : 100;
  const visitCompletion =
    stats.admitted.length > 0
      ? Math.round((stats.visitsToday / stats.admitted.length) * 100)
      : 100;

  return (
    <Layout
      title="Staff Activity"
      subtitle={`Today's clinical operations · ${formatDate(today)}`}
    >
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icon={Thermometer}
          label="Temperatures recorded"
          value={`${stats.totalTempsToday} / ${stats.admitted.length}`}
          sub={`${tempCompletion}% completion`}
          tone={tempCompletion >= 80 ? "positive" : "warning"}
        />
        <KpiCard
          icon={Stethoscope}
          label="Doctor visits completed"
          value={`${stats.visitsToday} / ${stats.admitted.length}`}
          sub={`${visitCompletion}% completion`}
          tone={visitCompletion >= 80 ? "positive" : "warning"}
        />
        <KpiCard
          icon={Clock}
          label="Awaiting temperature"
          value={stats.missingTemp.length}
          sub="Patients still in pending queue"
          tone={stats.missingTemp.length === 0 ? "positive" : "warning"}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Awaiting visit"
          value={stats.missingVisit.length}
          sub="Temp logged, doctor not yet visited"
          tone={stats.missingVisit.length === 0 ? "positive" : "warning"}
        />
      </div>

      {/* Two-column layout: nurses | doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Nursing activity */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-slate-900">
                Nursing activity
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Temperatures recorded today
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>

          {Object.keys(stats.tempsByNurse).length === 0 ? (
            <div className="text-sm text-slate-400 italic py-4">
              No temperatures recorded yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.tempsByNurse)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([nurse, data]) => (
                  <StaffRow
                    key={nurse}
                    name={nurse}
                    primaryStat={`${data.count} ${data.count === 1 ? "reading" : "readings"}`}
                    secondaryStat={`Last: ${data.lastTime}`}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Doctor activity */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-slate-900">
                Doctor activity
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Notes and discharge flags today
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          {Object.keys(stats.notesByDoctor).length === 0 &&
          Object.keys(stats.dischargesByDoctor).length === 0 ? (
            <div className="text-sm text-slate-400 italic py-4">
              No doctor activity recorded yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Combine the two metrics into one row per doctor */}
              {Array.from(
                new Set([
                  ...Object.keys(stats.notesByDoctor),
                  ...Object.keys(stats.dischargesByDoctor),
                ]),
              ).map((doctor) => (
                <StaffRow
                  key={doctor}
                  name={doctor}
                  primaryStat={`${stats.notesByDoctor[doctor] || 0} note${(stats.notesByDoctor[doctor] || 0) === 1 ? "" : "s"}`}
                  secondaryStat={`${stats.dischargesByDoctor[doctor] || 0} discharge flag${(stats.dischargesByDoctor[doctor] || 0) === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Action-needed lists — patients still blocking the day from closing out */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionList
          title="Awaiting temperature"
          subtitle="Nurses should prioritize these patients"
          icon={Thermometer}
          patients={stats.missingTemp}
          emptyMessage="All admitted patients have had their temperature recorded today."
          accentColor="warning"
        />
        <ActionList
          title="Awaiting doctor visit"
          subtitle="Temperature is logged — ready for clinical review"
          icon={Stethoscope}
          patients={stats.missingVisit}
          emptyMessage="All patients with logged temperatures have been visited."
          accentColor="primary"
        />
      </div>

      {/* End-of-day summary preview — the head doctor's takeaway */}
      <section className="mt-8 card p-6 bg-slate-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary-600 shadow-card flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg text-slate-900 mb-1">
              End-of-day summary
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {stats.missingTemp.length === 0 &&
              stats.missingVisit.length === 0 ? (
                <>
                  All {stats.admitted.length} admitted patients have had their
                  temperature recorded and been visited today. The facility is
                  fully on top of clinical operations.
                </>
              ) : (
                <>
                  {stats.missingTemp.length > 0 && (
                    <>
                      <b>{stats.missingTemp.length}</b> patient
                      {stats.missingTemp.length === 1 ? "" : "s"}{" "}
                      {stats.missingTemp.length === 1 ? "is" : "are"} still
                      awaiting temperature recording.{" "}
                    </>
                  )}
                  {stats.missingVisit.length > 0 && (
                    <>
                      <b>{stats.missingVisit.length}</b> patient
                      {stats.missingVisit.length === 1 ? "" : "s"}{" "}
                      {stats.missingVisit.length === 1 ? "has" : "have"} a
                      temperature logged but no doctor visit yet.{" "}
                    </>
                  )}
                  Clearing these before end-of-shift ensures no patient stays an
                  extra day due to missed checks.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// ---------- Sub-components ----------

function KpiCard({ icon: Icon, label, value, sub, tone }) {
  const valueClass = {
    positive: "text-success",
    warning: "text-warning",
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
      <div className={`font-display text-3xl ${valueClass}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function StaffRow({ name, primaryStat, secondaryStat }) {
  const initials = name
    .replace(/^(N|Dr)\.\s+/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          {name}
        </div>
        <div className="text-xs text-slate-500">{secondaryStat}</div>
      </div>
      <div className="text-sm font-semibold text-slate-900 flex-shrink-0">
        {primaryStat}
      </div>
    </div>
  );
}

function ActionList({
  title,
  subtitle,
  icon: Icon,
  patients,
  emptyMessage,
  accentColor,
}) {
  const accentBg =
    accentColor === "warning"
      ? "bg-amber-50 text-warning"
      : "bg-primary-50 text-primary-700";

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${accentBg} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-success py-2">
          <CheckCircle2 className="w-4 h-4" />
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {p.name}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {p.id} · Room {p.room}
                </div>
              </div>
              <div className="text-xs text-slate-500 flex-shrink-0 ml-3">
                Admitted {formatDate(p.admittedOn)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
