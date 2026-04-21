import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { RoleRoute } from "../components/auth/RoleRoute";
import { useAuthStore } from "../store/AuthStore";

describe("RoleRoute", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setHydrating(false);
  });

  it("should show loader while hydrating session", () => {
    useAuthStore.getState().setHydrating(true);
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<div>Admin Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.queryByText("Admin Page")).toBeNull();
    // Check for the spinner div (it doesn't have text, but we can check the presence)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should redirect to /login when unauthenticated", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<div>Admin Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should redirect to / when role is not authorized", () => {
    useAuthStore
      .getState()
      .setAuth("token", { email: "user@aegis.ai", role: "viewer" } as any);
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<div>Admin Page</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("should allow access when role is authorized", () => {
    useAuthStore
      .getState()
      .setAuth("token", { email: "admin@aegis.ai", role: "admin" } as any);
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<div>Admin Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Admin Page")).toBeInTheDocument();
  });
});
