import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Vulnerabilities } from "./pages/Vulnerabilities";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleRoute } from "./components/auth/RoleRoute";

function App() {
  return (
    <AuthHydrator>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/monitoring/:scanId" element={<Dashboard />} />

            {/* Admin & SuperAdmin Only */}
            <Route
              element={<RoleRoute allowedRoles={["admin", "superadmin"]} />}
            >
              <Route path="/users" element={<Users />} />
            </Route>

            {/* All except Viewer for Settings */}
            <Route
              element={
                <RoleRoute allowedRoles={["admin", "superadmin", "operator"]} />
              }
            >
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback for AUTHENTICATED users inside the layout */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        {/* Global Fallback for UNAUTHENTICATED users outside the protected group */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthHydrator>
  );
}

export default App;
