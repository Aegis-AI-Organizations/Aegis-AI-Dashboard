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

    // Sidebar queries should be robust to expanded/collapsed state
    // getByRole with name works because it looks at both inner text and title attribute
    expect(
      screen.getByRole("link", { name: "Tableau de Bord" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Gestion & Audit" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Facturation" }),
    ).toBeInTheDocument();
  });

  it("highlights active link", () => {
    useAuthStore.getState().setAuth("token", { role: "superadmin" } as any);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    const dashboardLink = screen.getByRole("link", { name: "Tableau de Bord" });
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
