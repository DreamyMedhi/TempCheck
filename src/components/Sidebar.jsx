import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ROLE_LABELS } from "../lib/constants";
import {
  LayoutDashboard,
  Thermometer,
  Stethoscope,
  UserPlus,
  LogOut,
  ClipboardList,
  Activity,
  BedDouble,
  DoorOpen,
  CalendarCheck,
  Users as UsersIcon,
} from "lucide-react";

const NAV_BY_ROLE = {
  nurse: [
    { to: "/nurse", label: "Temperature Queue", icon: Thermometer },
    { to: "/patients", label: "All Patients", icon: UsersIcon },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
  ],
  doctor: [
    { to: "/doctor", label: "Visit Queue", icon: Stethoscope },
    { to: "/patients", label: "All Patients", icon: UsersIcon },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
    { to: "/discharge-queue", label: "Discharge Queue", icon: DoorOpen },
  ],
  admin: [
    { to: "/admin", label: "Admissions & Discharge", icon: ClipboardList },
    { to: "/admin/new", label: "Admit New Patient", icon: UserPlus },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
  ],
  head_doctor: [
    { to: "/dashboard", label: "Facility Dashboard", icon: LayoutDashboard },
    { to: "/patients", label: "All Patients", icon: UsersIcon },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
    { to: "/dashboard/staff", label: "Staff Activity", icon: Activity },
    { to: "/discharge-queue", label: "Discharge Queue", icon: DoorOpen },
    {
      to: "/dashboard/staffing",
      label: "Today's Staffing",
      icon: CalendarCheck,
    },
  ],
};

export default function Sidebar() {
  const { currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[currentUser?.role] || [];

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
            Q
          </div>
          <div>
            <div className="font-display text-xl leading-none text-slate-900">
              TempCheck
            </div>
            <div className="text-[11px] text-slate-500 tracking-wide uppercase mt-0.5">
              Facility Ops
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
            {currentUser?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {currentUser?.name}
            </div>
            <div className="text-xs text-slate-500">
              {ROLE_LABELS[currentUser?.role]}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
