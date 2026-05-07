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
        const { data } = await api.post("/auth/refresh");

        if (data.access_token) {
          // If we got a token but no user, try to get the user context
          if (!data.user) {
            try {
              const userResponse = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${data.access_token}` },
              });
              setAuth(data.access_token, userResponse.data);
            } catch (userErr) {
              // Fallback to basic auth state if /me fails but refresh worked
              useAuthStore.setState({
                accessToken: data.access_token,
                isAuthenticated: true,
              });
            }
          } else {
            setAuth(data.access_token, data.user);
          }
        }
      } catch (err) {
        // Suppress expected 401s during hydration
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
