import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const HOME_BY_ROLE = {
  nurse: "/nurse",
  doctor: "/doctor",
  admin: "/admin",
  head_doctor: "/dashboard",
};

/**
 * Returns a back-navigation function that's safer than `navigate(-1)`.
 *
 * Why: `navigate(-1)` walks the browser history back one step, which can
 * dump the user on the login page or an auth redirect when they arrived
 * via a direct URL or refresh. This helper falls back to the user's
 * logical home page in those cases.
 *
 * @param {string} [fallbackPath] - Optional path to return to if no app history exists.
 *   Defaults to the user's role-based home page.
 */
export function useSmartBack(fallbackPath) {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return () => {
    // window.history.length > 2 means the user has actual app history
    // (the initial entry + at least one navigation within the app)
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      const home =
        fallbackPath || HOME_BY_ROLE[currentUser?.role] || "/patients";
      navigate(home);
    }
  };
}
