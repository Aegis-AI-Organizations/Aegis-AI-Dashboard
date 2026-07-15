import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Vulnerabilities } from "./pages/Vulnerabilities";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { Agents } from "./pages/Agents";
import { Billing } from "./pages/Billing";
import { Audit } from "./pages/Audit";
import { Topology } from "./pages/Topology";
import { Login } from "./pages/Login";
import { SetupPassword } from "./pages/SetupPassword";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
import { AuthHydrator } from "./components/auth/AuthHydrator";

function App() {
  return (
    <AuthHydrator>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SetupPassword />} />
        <Route path="/setup-password" element={<SetupPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/monitoring/:scanId" element={<Dashboard />} />

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                    "technicien",
                    "support",
                    "owner",
                    "operateur",
                  ]}
                />
              }
            >
              <Route path="/topology" element={<Topology />} />
            </Route>

            {/* Management Routes */}
            <Route
              element={
                <RoleRoute allowedRoles={["superadmin", "admin", "owner"]} />
              }
            >
              <Route path="/agents" element={<Agents />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={["admin", "superadmin", "owner"]} />
              }
            >
              <Route path="/users" element={<Users />} />
            </Route>

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                    "billing_aegis",
                    "owner",
                  ]}
                />
              }
            >
              <Route path="/billing" element={<Billing />} />
            </Route>

            <Route
              element={<RoleRoute allowedRoles={["superadmin", "owner"]} />}
            >
              <Route path="/audit" element={<Audit />} />
            </Route>

            {/* All except Viewer for Settings */}
            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "superadmin",
                    "owner",
                    "operateur",
                    "viewer",
                  ]}
                />
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
