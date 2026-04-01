import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/AuthStore";

/**
 * ProtectedRoute
 *
 * Checks the authentication state of the user.
 * If the user is authenticated, it renders the child routes.
 * If the user is not authenticated, it redirects to the login page
 * while preserving the original location in the router state.
 */
export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const location = useLocation();

  // Show nothing while the session is still being restored.
  // This prevents the 'flicker' where a user is briefly shown the login page
  // before being authenticated.
  if (isHydrating) {
    return null; // Or a full-page loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to login, but keep the current location in state
    // so we can redirect the user back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
