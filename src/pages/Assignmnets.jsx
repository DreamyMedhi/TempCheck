import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import { formatDate } from "../lib/clinical";
import { Search, Users as UsersIcon, AlertTriangle } from "lucide-react";

export default function Assignments() {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("nurse"); // 'nurse' | 'doctor' | 'patient'

  const admitted = useMemo(
    () => patients.filter((p) => p.status === "admitted"),
    [patients],
  );

  // Detect unassigned patients — these are problems the head doctor needs to see
  const unassigned = admitted.filter(
    (p) => !p.assignedNurse || !p.assignedDoctor,
  );

  // Group by nurse or doctor
  const grouped = useMemo(() => {
    if (groupBy === "patient") return null;
    const key = groupBy === "nurse" ? "assignedNurse" : "assignedDoctor";
    const map = {};
    admitted.forEach((p) => {
      const staff = p[key] || "Unassigned";
      if (!map[staff]) map[staff] = [];
      map[staff].push(p);
    });
    return map;
  }, [admitted, groupBy]);

  const filteredAdmitted = useMemo(() => {
    if (!search) return admitted;
    const q = search.toLowerCase();
    return admitted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.room.toLowerCase().includes(q) ||
        (p.assignedNurse || "").toLowerCase().includes(q) ||
        (p.assignedDoctor || "").toLowerCase().includes(q),
    );
  }, [admitted, search]);

  return (
    <Layout
      title="Assignments"
      subtitle={`${admitted.length} admitted patients · auto-assigned at start of each shift`}
    >
      {/* Algorithm note */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Auto-assignment.</span>{" "}
        Patients are assigned to nurses and doctors using the Balanced Acuity
        Assignment algorithm — optimizing for even workload distribution while
        keeping high-acuity patients spread across staff. Re-runs at every shift
        change.
      </div>

      {/* Unassigned warnings */}
      {unassigned.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-amber-900 mb-1">
              {unassigned.length} patient{unassigned.length === 1 ? "" : "s"}{" "}
              not fully assigned
            </div>
            <div className="text-sm text-amber-900">
              {unassigned.map((p) => p.name).join(", ")} — please run the
              assignment algorithm or assign manually.
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by patient, staff, or room"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { key: "nurse", label: "By Nurse" },
            { key: "doctor", label: "By Doctor" },
            { key: "patient", label: "By Patient" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGroupBy(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                groupBy === key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped views */}
      {groupBy !== "patient" && grouped && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([staffName, staffPatients]) => {
            const visiblePatients = search
              ? staffPatients.filter(
                  (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.id.toLowerCase().includes(search.toLowerCase()) ||
                    p.room.toLowerCase().includes(search.toLowerCase()) ||
                    staffName.toLowerCase().includes(search.toLowerCase()),
                )
              : staffPatients;
            if (visiblePatients.length === 0) return null;

            const initials = staffName
              .replace(/^Dr\.\s+/, "")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2);

            return (
              <section key={staffName} className="card overflow-hidden">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {staffName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {staffPatients.length} patient
                        {staffPatients.length === 1 ? "" : "s"} assigned
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                        <th className="px-5 py-3">Patient</th>
                        <th className="px-5 py-3">Room</th>
                        <th className="px-5 py-3">
                          {groupBy === "nurse" ? "Doctor" : "Nurse"}
                        </th>
                        <th className="px-5 py-3">Admitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visiblePatients.map((p) => (
                        <tr
                          key={p.id}
                          className="text-sm hover:bg-slate-50 cursor-pointer"
                          onClick={() => navigate(`/patient/${p.id}`)}
                        >
                          <td className="px-5 py-3">
                            <div className="font-medium text-slate-900">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {p.id}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-700">{p.room}</td>
                          <td className="px-5 py-3 text-slate-700">
                            {groupBy === "nurse"
                              ? p.assignedDoctor || (
                                  <span className="text-amber-700">
                                    Unassigned
                                  </span>
                                )
                              : p.assignedNurse || (
                                  <span className="text-amber-700">
                                    Unassigned
                                  </span>
                                )}
                          </td>
                          <td className="px-5 py-3 text-slate-700">
                            {formatDate(p.admittedOn)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Patient view */}
      {groupBy === "patient" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Assigned Nurse</th>
                  <th className="px-5 py-3">Assigned Doctor</th>
                  <th className="px-5 py-3">Admitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmitted.map((p) => (
                  <tr
                    key={p.id}
                    className="text-sm hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/patient/${p.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {p.id}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{p.room}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {p.assignedNurse || (
                        <span className="text-amber-700">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {p.assignedDoctor || (
                        <span className="text-amber-700">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {formatDate(p.admittedOn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
