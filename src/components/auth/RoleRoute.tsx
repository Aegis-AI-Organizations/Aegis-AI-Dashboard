import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/AuthStore";

interface RoleRouteProps {
  allowedRoles: string[];
}

/**
 * Role-Based Route Protection Component
 *
 * Restricts access to routes based on the user's role.
 * If the user is not authenticated, redirects to /login.
 * If the user's role is not in the allowedRoles list, redirects to home (or a 403 page).
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isHydrating } = useAuthStore();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to landing dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
