import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PatientCard from "../components/PatientCard";
import {
  formatDate,
  consecutiveFeverFreeDays,
  daysBetween,
  todayStr,
} from "../lib/clinical";
import {
  Search,
  AlertTriangle,
  DoorOpen,
  CheckCircle2,
  Eye,
} from "lucide-react";

export default function FlaggedForDischarge() {
  const { patients, executeDischarge, showToast } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);

  const flagged = useMemo(
    () => patients.filter((p) => p.dischargeFlagged && p.status === "admitted"),
    [patients],
  );

  const filtered = useMemo(() => {
    if (!search) return flagged;
    const q = search.toLowerCase();
    return flagged.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.room.toLowerCase().includes(q),
    );
  }, [flagged, search]);

  const handleDischarge = () => {
    if (!confirmTarget) return;
    executeDischarge(confirmTarget.id);
    showToast(
      `${confirmTarget.name} discharged · Bed ${confirmTarget.room} now available`,
      "success",
    );
    setConfirmTarget(null);
  };

  return (
    <Layout
      title="Flagged for Discharge"
      subtitle={`${flagged.length} patient${flagged.length === 1 ? "" : "s"} ready to be discharged`}
    >
      {/* Context banner */}
      <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50/40 px-4 py-3 flex gap-3 text-sm">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-primary-600" />
        <div className="text-primary-900">
          These patients have completed 3 consecutive fever-free days and have
          been flagged for discharge. Review each record before confirming
          discharge — once executed, the bed is freed immediately.
        </div>
      </div>

      {/* Search */}
      {flagged.length > 0 && (
        <div className="relative max-w-md mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, ID, or room"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Empty state */}
      {flagged.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-slate-400" />
          </div>
          <div className="font-display text-xl text-slate-900 mb-1">
            No pending discharges
          </div>
          <div className="text-sm text-slate-500 max-w-md mx-auto">
            No patients are currently flagged for discharge. Patients are
            flagged automatically once they meet the 3-day fever-free criterion
            and are confirmed by a doctor.
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          No flagged patients match your search.
        </div>
      ) : (
        <>
          {/* Detailed table view — better than card grid for action-oriented work */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Stay length</th>
                  <th className="px-5 py-3">Fever-free streak</th>
                  <th className="px-5 py-3">Flagged by</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="text-sm hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {p.id} · Age {p.age}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{p.room}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {daysBetween(p.admittedOn, todayStr())} days
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge bg-green-50 text-success">
                        {consecutiveFeverFreeDays(p)} days
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-700">
                        {p.dischargeFlaggedBy}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(p.dischargeFlaggedOn)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="btn-secondary text-xs px-3 py-1.5"
                          onClick={() => navigate(`/patient/${p.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          className="btn-primary text-xs px-3 py-1.5"
                          onClick={() => setConfirmTarget(p)}
                        >
                          <DoorOpen className="w-3.5 h-3.5" />
                          Discharge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirmation modal */}
      <Modal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title="Confirm discharge"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setConfirmTarget(null)}
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
        {confirmTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to discharge <b>{confirmTarget.name}</b>{" "}
              from Room <b>{confirmTarget.room}</b>?
            </p>
            <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Length of stay</span>
                <span className="font-medium text-slate-900">
                  {daysBetween(confirmTarget.admittedOn, todayStr())} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fever-free streak</span>
                <span className="font-medium text-slate-900">
                  {consecutiveFeverFreeDays(confirmTarget)} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flagged by</span>
                <span className="font-medium text-slate-900">
                  {confirmTarget.dischargeFlaggedBy}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                This action will free up Room {confirmTarget.room} immediately
                and cannot be undone.
              </span>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
