import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("does not render the removed logout button", () => {
    useAuthStore.getState().setAuth("token", { role: "superadmin" } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.queryByTitle("Déconnexion")).not.toBeInTheDocument();
  });
});
