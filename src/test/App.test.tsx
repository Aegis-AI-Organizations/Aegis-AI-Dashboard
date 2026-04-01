import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../App";
import { useAuthStore } from "../store/AuthStore";

vi.mock("../pages/Dashboard", () => ({
  Dashboard: () => <div>dashboard-page</div>,
}));
vi.mock("../pages/Vulnerabilities", () => ({
  Vulnerabilities: () => <div>vulnerabilities-page</div>,
}));
vi.mock("../pages/Users", () => ({ Users: () => <div>users-page</div> }));
vi.mock("../pages/Settings", () => ({
  Settings: () => <div>settings-page</div>,
}));
vi.mock("../pages/Login", () => ({
  Login: () => <div>login-page</div>,
}));

// Mock AuthHydrator to be a transparent passthrough
vi.mock("../components/auth/AuthHydrator", () => ({
  AuthHydrator: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("App routes", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setHydrating(false);
  });

  it("should redirect to login when unauthenticated", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });

  it.each([
    ["/", "dashboard-page"],
    ["/vulnerabilities", "vulnerabilities-page"],
    ["/users", "users-page"],
    ["/settings", "settings-page"],
    ["/monitoring/scan-1", "dashboard-page"],
  ])("renders %s when authenticated", (entry, expectedText) => {
    // Set authenticated state
    useAuthStore
      .getState()
      .setAuth("fake-token", { email: "test@aegis.ai" } as any);

    render(
      <MemoryRouter initialEntries={[entry]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});
