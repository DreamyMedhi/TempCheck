import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Users as UsersIcon,
  BedDouble,
  CalendarCheck,
  DoorOpen,
  Menu,
  X,
  ListChecks,
  UserCheck,
} from "lucide-react";

const NAV_BY_ROLE = {
  nurse: [
    { to: "/todays-check", label: "My Patients Today", icon: ListChecks },
    { to: "/nurse", label: "All Temperatures", icon: Thermometer },
    { to: "/patients", label: "All Patients", icon: UsersIcon },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
  ],
  doctor: [
    { to: "/my-patients", label: "My Patients Today", icon: ListChecks },
    { to: "/doctor", label: "All Visits", icon: Stethoscope },
    { to: "/discharge-queue", label: "Discharge Queue", icon: DoorOpen },
    { to: "/patients", label: "All Patients", icon: UsersIcon },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
  ],
  admin: [
    { to: "/admin", label: "Admissions & Discharge", icon: ClipboardList },
    { to: "/admin/new", label: "Admit New Patient", icon: UserPlus },
    { to: "/assignments", label: "Assignments", icon: UserCheck },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
  ],
  head_doctor: [
    { to: "/dashboard", label: "Facility Dashboard", icon: LayoutDashboard },
    { to: "/assignments", label: "Assignments", icon: UserCheck },
    { to: "/discharge-queue", label: "Discharge Queue", icon: DoorOpen },
    { to: "/patients", label: "All Patients", icon: UsersIcon },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
    { to: "/dashboard/staff", label: "Staff Activity", icon: Activity },
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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const nav = NAV_BY_ROLE[currentUser?.role] || [];

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <>
      {/* Mobile top bar — only visible below lg */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
            TC
          </div>
          <div>
            <div className="font-display text-lg leading-none text-slate-900">
              TempCheck
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — desktop persistent, mobile drawer */}
      <aside
        className={`
          bg-white border-r border-slate-200 flex flex-col z-50
          lg:w-64 lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen
          fixed top-0 left-0 h-screen w-72 transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header (logo) */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              TC
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
          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-100"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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

        {/* User block */}
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
    </>
  );
}
