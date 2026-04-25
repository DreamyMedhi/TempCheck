import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import { BED_CAPACITY } from "../lib/constants";
import { formatDate, daysBetween, todayStr } from "../lib/clinical";
import { Users, BedDouble, DoorOpen, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const { patients, executeDischarge, showToast } = useApp();
  const admitted = patients.filter((p) => p.status === "admitted");
  const flagged = admitted.filter((p) => p.dischargeFlagged);
  const occupancy = admitted.length;
  const occupancyPct = Math.round((occupancy / BED_CAPACITY) * 100);

  const handleDischarge = (p) => {
    executeDischarge(p.id);
    showToast(`${p.name} discharged · Bed ${p.room} now available`, "success");
  };

  return (
    <Layout
      title="Admissions & Discharge"
      subtitle="Manage patient intake and execute doctor-flagged discharges"
      actions={
        <Link to="/admin/new" className="btn-primary">
          <Users className="w-4 h-4" />
          Admit new patient
        </Link>
      }
    >
      {/* Capacity overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Current occupancy
            </div>
            <BedDouble className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="font-display text-3xl text-slate-900">
              {occupancy}
            </div>
            <div className="text-slate-400">/ {BED_CAPACITY}</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${occupancyPct >= 95 ? "bg-critical" : "bg-primary-600"}`}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {BED_CAPACITY - occupancy} beds available
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Pending discharges
            </div>
            <DoorOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-display text-3xl text-slate-900">
            {flagged.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Flagged by doctors</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Admitted today
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-display text-3xl text-slate-900">
            {admitted.filter((p) => p.admittedOn === todayStr()).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">New patients</div>
        </div>
      </div>

      {/* Capacity warning */}
      {occupancyPct >= 95 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-critical" />
          <div>
            <div className="font-medium">Facility near capacity</div>
            <div className="mt-0.5">
              Only {BED_CAPACITY - occupancy} bed(s) left. Prioritize
              discharging eligible patients.
            </div>
          </div>
        </div>
      )}

      {/* Flagged for discharge */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Flagged for discharge · {flagged.length}
        </h2>
        {flagged.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">
            No patients flagged for discharge yet.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Room</th>
                    <th className="px-5 py-3">Flagged by</th>
                    <th className="px-5 py-3">Stay length</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flagged.map((p) => (
                    <tr key={p.id} className="text-sm">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {p.id}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{p.room}</td>
                      <td className="px-5 py-4">
                        <div className="text-slate-700">
                          {p.dischargeFlaggedBy}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(p.dischargeFlaggedOn)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {daysBetween(p.admittedOn, todayStr())} days
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="btn-primary"
                          onClick={() => handleDischarge(p)}
                        >
                          <DoorOpen className="w-4 h-4" />
                          Discharge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Currently admitted */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Currently admitted · {admitted.length}
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Age</th>
                <th className="px-5 py-3">Admitted</th>
                <th className="px-5 py-3">Stay length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admitted.map((p) => (
                <tr key={p.id} className="text-sm hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {p.id}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{p.room}</td>
                  <td className="px-5 py-4 text-slate-700">{p.age}</td>
                  <td className="px-5 py-4 text-slate-700">
                    {formatDate(p.admittedOn)}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {daysBetween(p.admittedOn, todayStr())} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
