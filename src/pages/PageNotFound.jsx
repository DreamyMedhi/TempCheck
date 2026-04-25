import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Home, ArrowLeft, Compass } from "lucide-react";

// Where each role's "home" lives — used to send users back to the right place
const HOME_BY_ROLE = {
  nurse: "/nurse",
  doctor: "/doctor",
  admin: "/admin",
  head_doctor: "/dashboard",
};

export default function PageNotFound() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const homeRoute = currentUser ? HOME_BY_ROLE[currentUser.role] : "/";
  const homeLabel = currentUser ? "Back to dashboard" : "Back to sign in";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient background — same treatment as the login page for visual continuity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-100 blur-3xl opacity-40" />
        <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-primary-50 blur-3xl opacity-50" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl text-center">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12 justify-center">
            <div className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">
              TC
            </div>
            <div className="text-left">
              <div className="font-display text-2xl text-slate-900 leading-none">
                TempCheck
              </div>
              <div className="text-xs text-slate-500 tracking-wide uppercase mt-1">
                Facility Operations
              </div>
            </div>
          </div>

          {/* Compass icon block */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 text-primary-600 mb-6">
            <Compass className="w-9 h-9" strokeWidth={1.75} />
          </div>

          {/* Big 404 */}
          <div className="font-display text-7xl text-slate-900 leading-none mb-3">
            404
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl text-slate-900 leading-tight mb-3">
            Page not found
          </h1>

          {/* Body copy */}
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to where you can be useful.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <button onClick={() => navigate(homeRoute)} className="btn-primary">
              <Home className="w-4 h-4" />
              {homeLabel}
            </button>
          </div>

          {/* Subtle footer */}
          <p className="text-xs text-slate-400 mt-12">
            If you believe this is an error, please contact your facility
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
