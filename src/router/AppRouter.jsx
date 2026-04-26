import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

import Login from "../pages/Login";
import Nurse from "../pages/Nurse";
import Doctor from "../pages/Doctor";
import Admin from "../pages/Admin";
import AdmitNew from "../pages/AdmitNew";
import Dashboard from "../pages/Dashboard";
import StaffActivity from "../pages/StaffActivity";
import TodaysStaffing from "../pages/TodaysStaffing";
import PatientList from "../pages/PatientList";
import PatientDetail from "../pages/PatientDetail";
import Rooms from "../pages/Rooms";
import PageNotFound from "../pages/PageNotFound";
import FlaggedForDischarge from "../pages/FlaggedForDischarge";
import Assignments from "../pages/Assignmnets";
import TodaysCheck from "../pages/TodaysCheck";
import MyPatientsToday from "../pages/MyPatientsToday";

function RequireAuth({ roles, children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (roles && !roles.includes(currentUser.role))
    return <Navigate to="/" replace />;
  return children;
}

const ROUTES = [
  // Public
  { path: "/", element: <Login />, public: true },
  { path: "/todays-check", element: <TodaysCheck /> },
  // Role-specific dashboards
  { path: "/nurse", element: <Nurse />, roles: ["nurse"] },
  { path: "/doctor", element: <Doctor />, roles: ["doctor"] },
  { path: "/my-patients", element: <MyPatientsToday />, roles: ["doctor"] },
  { path: "/admin", element: <Admin />, roles: ["admin"] },
  { path: "/admin/new", element: <AdmitNew />, roles: ["admin"] },
  { path: "/dashboard", element: <Dashboard />, roles: ["head_doctor"] },
  {
    path: "/dashboard/staff",
    element: <StaffActivity />,
    roles: ["head_doctor"],
  },
  {
    path: "/discharge-queue",
    element: <FlaggedForDischarge />,
    roles: ["doctor", "head_doctor"],
  },
  {
    path: "/dashboard/staffing",
    element: <TodaysStaffing />,
    roles: ["head_doctor"],
  },

  {
    path: "/assignments",
    element: <Assignments />,
    roles: ["admin", "head_doctor"],
  },

  // Shared (any signed-in user)
  { path: "/patients", element: <PatientList />, roles: null },
  { path: "/patient/:id", element: <PatientDetail />, roles: null },
  { path: "/rooms", element: <Rooms />, roles: null },
];

// ---------- Router component ----------
export default function AppRouter() {
  return (
    <Routes>
      {ROUTES.map(({ path, element, public: isPublic, roles }) => (
        <Route
          key={path}
          path={path}
          element={
            isPublic ? (
              element
            ) : (
              <RequireAuth roles={roles}>{element}</RequireAuth>
            )
          }
        />
      ))}

      {/* Catch-all — must remain last */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
