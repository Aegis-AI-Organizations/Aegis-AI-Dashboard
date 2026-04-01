import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Vulnerabilities } from "./pages/Vulnerabilities";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthHydrator } from "./components/auth/AuthHydrator";

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
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/monitoring/:scanId" element={<Dashboard />} />

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
