import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ROLE_LABELS } from "../lib/constants";
import {
  Thermometer,
  Stethoscope,
  ClipboardList,
  LayoutDashboard,
  ArrowLeft,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";

const ROLE_META = {
  nurse: {
    icon: Thermometer,
    desc: "Record patient temperatures",
    route: "/nurse",
  },
  doctor: {
    icon: Stethoscope,
    desc: "Review patients and flag discharges",
    route: "/doctor",
  },
  admin: {
    icon: ClipboardList,
    desc: "Admit and discharge patients",
    route: "/admin",
  },
  head_doctor: {
    icon: LayoutDashboard,
    desc: "Monitor facility performance",
    route: "/dashboard",
  },
};

const DEMO_CREDENTIALS = {
  nurse: { id: "NUR-001", password: "demo1234" },
  doctor: { id: "DOC-001", password: "demo1234" },
  admin: { id: "ADM-001", password: "demo1234" },
  head_doctor: { id: "HD-001", password: "demo1234" },
};

export default function Login() {
  const { users, setCurrentUser, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep("credentials");
    setError("");
    setEmployeeId("");
    setPassword("");
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRole(null);
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!employeeId.trim() || !password.trim()) {
      setError("Please enter both Employee ID and password");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const expected = DEMO_CREDENTIALS[selectedRole];
      if (employeeId.trim() !== expected.id || password !== expected.password) {
        setError("Invalid Employee ID or password. Please try again.");
        setSubmitting(false);
        return;
      }

      const user = users.find((u) => u.role === selectedRole);
      setCurrentUser(user);
      showToast("Logged in successfully", "success");
      navigate(ROLE_META[selectedRole].route);
    }, 450);
  };

  // Both brand + content share the SAME container width so they left-align with each other
  const containerWidth = step === "role" ? "max-w-3xl" : "max-w-md";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-100 blur-3xl opacity-50" />
        <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-primary-50 blur-3xl opacity-60" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className={`w-full ${containerWidth}`}>
          {/* Brand — left-aligned inside the container, so it aligns with content below */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">
              TC
            </div>
            <div>
              <div className="font-display text-2xl text-slate-900 leading-none">
                TempCheck
              </div>
              <div className="text-xs text-slate-500 tracking-wide uppercase mt-1">
                Facility Operations
              </div>
            </div>
          </div>

          {/* Step content */}
          {step === "role" ? (
            <RoleStep onSelect={handleRoleSelect} />
          ) : (
            <CredentialsStep
              role={selectedRole}
              employeeId={employeeId}
              setEmployeeId={setEmployeeId}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              submitting={submitting}
              onBack={handleBack}
              onSubmit={handleLogin}
            />
          )}

          <p className="text-xs text-slate-400 mt-8 text-center">
            Prototype built for FactWise TPM assessment · All data is simulated
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleStep({ onSelect }) {
  return (
    <>
      <div className="mb-10">
        <h1 className="font-display text-4xl text-slate-900 leading-tight">
          Sign in to continue
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Choose your role to begin. You'll be asked to enter your Employee ID
          and password next.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(ROLE_META).map(([roleKey, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={roleKey}
              onClick={() => onSelect(roleKey)}
              className="card p-5 text-left hover:shadow-card-hover hover:border-primary-300 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 group-hover:bg-primary-100 transition">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-base">
                    {ROLE_LABELS[roleKey]}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{meta.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function CredentialsStep({
  role,
  employeeId,
  setEmployeeId,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  submitting,
  onBack,
  onSubmit,
}) {
  const Icon = ROLE_META[role].icon;
  const demo = DEMO_CREDENTIALS[role];

  return (
    <>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Change role
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 leading-tight">
          Enter your credentials
        </h1>
        <p className="text-slate-500 mt-2">
          Sign in to the {ROLE_LABELS[role]} workspace.
        </p>
      </div>

      <div className="card p-4 mb-5 flex items-center gap-3 bg-primary-50/50 border-primary-200">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700">
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <div className="text-xs text-primary-700 uppercase tracking-wide font-medium">
            Signing in as
          </div>
          <div className="font-semibold text-slate-900">
            {ROLE_LABELS[role]}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label" htmlFor="employeeId">
            Employee ID
          </label>
          <input
            id="employeeId"
            type="text"
            className="input"
            placeholder="e.g. DOC-001"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            autoComplete="username"
            autoFocus
            disabled={submitting}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input pr-10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign in
            </>
          )}
        </button>

        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1.5">
            Demo credentials
          </div>
          <div className="text-xs text-slate-500">
            ID: <span className="font-mono text-slate-700">{demo.id}</span>
            {" · "}
            Password:{" "}
            <span className="font-mono text-slate-700">{demo.password}</span>
          </div>
        </div>
      </form>
    </>
  );
}
