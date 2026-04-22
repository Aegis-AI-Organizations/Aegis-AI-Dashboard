import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "../components/layout/Sidebar";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

describe("Sidebar Component", () => {
  it("renders navigation links", async () => {
    useAuthStore.getState().setAuth("token", { role: "superadmin" } as any);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    // Sidebar needs to be expanded or we need to find by title since labels are hidden when collapsed
    expect(screen.getByTitle("Tableau de Bord")).toBeInTheDocument();
    expect(screen.getByTitle("Équipe")).toBeInTheDocument();
    expect(screen.getByTitle("Administration")).toBeInTheDocument();
  });

  it("highlights active link", () => {
    useAuthStore.getState().setAuth("token", { role: "superadmin" } as any);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    const dashboardLink = screen.getByTitle("Tableau de Bord").closest("a");
    expect(dashboardLink).toHaveClass("text-cyan-400");
  });

  it("handles logout", async () => {
    const clearAuthSpy = vi.spyOn(useAuthStore.getState(), "clearAuth");
    useAuthStore.getState().setAuth("token", { role: "superadmin" } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    // Click logout in the collapsed view (bottom button)
    const logoutButtons = screen.getAllByTitle("Déconnexion");
    fireEvent.click(logoutButtons[logoutButtons.length - 1]);

    expect(
      screen.getByText(/Êtes-vous sûr de vouloir vous déconnecter/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));
    expect(clearAuthSpy).toHaveBeenCalled();
  });
});
