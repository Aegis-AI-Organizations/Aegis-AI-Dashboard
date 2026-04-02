import { useEffect, useRef } from "react";
import { useAuthStore } from "../../store/AuthStore";
import { api } from "../../api/Axios";
import { LoadingPage } from "../ui/LoadingPage";

interface AuthHydratorProps {
  children: React.ReactNode;
}

/**
 * AuthHydrator
 *
 * Attempts to restore the user session on app startup by calling '/auth/refresh'.
 * Uses the shared 'api' instance for consistent baseURL and withCredentials.
 */
export const AuthHydrator: React.FC<AuthHydratorProps> = ({ children }) => {
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const hydrate = async () => {
      try {
        // Attempt to refresh the token using the HTTP-only cookie.
        // If the cookie is missing or expired, this will naturally fail.
        const { data } = await api.post("/auth/refresh");

        if (data.access_token && data.user) {
          setAuth(data.access_token, data.user);
        }
      } catch (err) {
        // We suppress the error log here because a 401/404 is EXPECTED
        // if the user is simply not logged in yet.
      } finally {
        setHydrating(false);
      }
    };

    hydrate();
  }, [setAuth, setHydrating]);

  if (isHydrating) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};
