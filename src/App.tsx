import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
import { AuthHydrator } from "./components/auth/AuthHydrator";
import { LoadingPage } from "./components/ui/LoadingPage";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Vulnerabilities = lazy(() =>
  import("./pages/Vulnerabilities").then((module) => ({
    default: module.Vulnerabilities,
  })),
);
const Users = lazy(() =>
  import("./pages/Users").then((module) => ({ default: module.Users })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((module) => ({ default: module.Settings })),
);
const Agents = lazy(() =>
  import("./pages/Agents").then((module) => ({ default: module.Agents })),
);
const Billing = lazy(() =>
  import("./pages/Billing").then((module) => ({ default: module.Billing })),
);
const Audit = lazy(() =>
  import("./pages/Audit").then((module) => ({ default: module.Audit })),
);
const Topology = lazy(() =>
  import("./pages/Topology").then((module) => ({ default: module.Topology })),
);
const CompanySettings = lazy(() =>
  import("./pages/CompanySettings").then((module) => ({
    default: module.CompanySettings,
  })),
);
const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const SetupPassword = lazy(() =>
  import("./pages/SetupPassword").then((module) => ({
    default: module.SetupPassword,
  })),
);

function App() {
  return (
    <AuthHydrator>
      <Suspense fallback={<LoadingPage message="Chargement" />}>
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

              <Route element={<RoleRoute allowedRoles={["owner"]} />}>
                <Route path="/company-settings" element={<CompanySettings />} />
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
      </Suspense>
    </AuthHydrator>
  );
}

export default App;
