import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Layout from "../components/Layout";
import { BED_CAPACITY } from "../lib/constants";
import {
  hasTempToday,
  hasVisitToday,
  isFever,
  daysBetween,
  todayStr,
  formatDate,
} from "../lib/clinical";
import { BedDouble, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

// Generate all 74 room IDs in the same format the seed data uses (e.g. "12A")
// The facility is laid out across 5 wings (A–E) with rooms numbered 01-15 per wing,
// minus a few utility rooms — totalling 74.
const ALL_ROOMS = (() => {
  const rooms = [];
  const wings = ["A", "B", "C", "D"];
  for (const wing of wings) {
    for (let n = 1; n <= 18; n++) {
      if (rooms.length >= BED_CAPACITY) break;
      rooms.push(`${String(n).padStart(2, "0")}${wing}`);
    }
  }
  return rooms.slice(0, BED_CAPACITY);
})();

export default function Rooms() {
  const { patients, currentUser } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'occupied' | 'available'

  const admitted = patients.filter((p) => p.status === "admitted");
  const roomToPatient = useMemo(() => {
    const map = {};
    admitted.forEach((p) => {
      map[p.room] = p;
    });
    return map;
  }, [admitted]);

  const occupiedCount = admitted.length;
  const availableCount = BED_CAPACITY - occupiedCount;
  const occupancyPct = Math.round((occupiedCount / BED_CAPACITY) * 100);

  const filteredRooms = useMemo(() => {
    return ALL_ROOMS.filter((room) => {
      const patient = roomToPatient[room];
      if (filter === "occupied" && !patient) return false;
      if (filter === "available" && patient) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchesRoom = room.toLowerCase().includes(q);
        const matchesPatient =
          patient &&
          (patient.name.toLowerCase().includes(q) ||
            patient.id.toLowerCase().includes(q));
        if (!matchesRoom && !matchesPatient) return false;
      }
      return true;
    });
  }, [search, filter, roomToPatient]);

  // Allow click-through to patient detail only for clinical roles
  const canViewPatientDetail = [
    "nurse",
    "doctor",
    "head_doctor",
    "admin",
  ].includes(currentUser?.role);

  const handleRoomClick = (room) => {
    const patient = roomToPatient[room];
    if (patient && canViewPatientDetail) {
      navigate(`/patient/${patient.id}`);
    }
  };

  return (
    <Layout
      title="Rooms"
      subtitle={`${occupiedCount} occupied · ${availableCount} available · ${BED_CAPACITY} total`}
    >
      {/* Capacity overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryTile
          icon={BedDouble}
          label="Total capacity"
          value={BED_CAPACITY}
          tone="neutral"
        />
        <SummaryTile
          icon={AlertTriangle}
          label="Currently occupied"
          value={`${occupiedCount} (${occupancyPct}%)`}
          tone={occupancyPct >= 95 ? "critical" : "neutral"}
          progress={occupancyPct}
        />
        <SummaryTile
          icon={CheckCircle2}
          label="Available beds"
          value={availableCount}
          tone={availableCount === 0 ? "critical" : "success"}
        />
      </div>

      {/* Capacity warning */}
      {occupancyPct >= 95 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-critical" />
          <div>
            <div className="font-medium">Facility near capacity</div>
            <div className="mt-0.5">
              Only {availableCount} bed{availableCount === 1 ? "" : "s"}{" "}
              remaining. Prioritize discharging eligible patients.
            </div>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by room number or patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { key: "all", label: `All (${BED_CAPACITY})` },
            { key: "occupied", label: `Occupied (${occupiedCount})` },
            { key: "available", label: `Available (${availableCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filter === key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-5 mb-4 text-xs text-slate-500 flex-wrap">
        <LegendDot color="bg-slate-100 border-slate-200" label="Available" />
        <LegendDot color="bg-primary-50 border-primary-200" label="Occupied" />
        <LegendDot
          color="bg-amber-50 border-amber-300"
          label="Action needed today"
        />
        <LegendDot color="bg-red-50 border-red-300" label="Fever today" />
      </div>

      {/* Room grid */}
      {filteredRooms.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          No rooms match your search.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
          {filteredRooms.map((room) => (
            <RoomCell
              key={room}
              room={room}
              patient={roomToPatient[room]}
              onClick={() => handleRoomClick(room)}
              clickable={!!roomToPatient[room] && canViewPatientDetail}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}

// ---------- Sub-components ----------

function SummaryTile({ icon: Icon, label, value, tone, progress }) {
  const toneClass = {
    success: "text-success",
    critical: "text-critical",
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
      {progress !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progress >= 95 ? "bg-critical" : "bg-primary-600"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function RoomCell({ room, patient, onClick, clickable }) {
  const isOccupied = !!patient;
  const latestTemp = patient?.temps[patient.temps.length - 1];

  // Determine the cell's state
  let cellClass = "bg-slate-50 border-slate-200 hover:bg-slate-100"; // available
  let topRowClass = "text-slate-400";
  let statusLabel = "Available";
  let statusClass = "text-slate-500";

  if (isOccupied) {
    if (latestTemp && isFever(latestTemp.value)) {
      cellClass = "bg-red-50 border-red-300 hover:border-red-400";
      topRowClass = "text-critical";
      statusLabel = `${latestTemp.value}°F`;
      statusClass = "text-critical font-semibold";
    } else if (!hasTempToday(patient) || !hasVisitToday(patient)) {
      cellClass = "bg-amber-50 border-amber-300 hover:border-amber-400";
      topRowClass = "text-warning";
      statusLabel = !hasTempToday(patient) ? "Temp pending" : "Visit pending";
      statusClass = "text-warning font-medium";
    } else {
      cellClass = "bg-primary-50 border-primary-200 hover:border-primary-400";
      topRowClass = "text-primary-700";
      statusLabel = latestTemp ? `${latestTemp.value}°F` : "Stable";
      statusClass = "text-success font-semibold";
    }
  }

  const Tag = clickable ? "button" : "div";

  return (
    <Tag
      onClick={clickable ? onClick : undefined}
      className={`relative aspect-square rounded-lg border-2 ${cellClass} p-2 flex flex-col justify-between text-left transition ${clickable ? "cursor-pointer" : "cursor-default"}`}
      title={
        isOccupied
          ? `${patient.name} · ${patient.id}`
          : `Room ${room} — Available`
      }
    >
      <div className={`text-xs font-bold ${topRowClass}`}>{room}</div>

      {isOccupied ? (
        <div className="space-y-0.5 min-w-0">
          <div
            className="text-[11px] font-medium text-slate-900 truncate"
            title={patient.name}
          >
            {patient.name.split(" ")[0]}
          </div>
          <div className={`text-[10px] ${statusClass} truncate`}>
            {statusLabel}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-slate-400">Available</div>
      )}
    </Tag>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
