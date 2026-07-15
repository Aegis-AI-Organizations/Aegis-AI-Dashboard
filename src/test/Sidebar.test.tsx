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
    expect(screen.getByRole("link", { name: "Équipes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agents" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Facturation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Logs d'Audit" }),
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

  it("hides topology and billing from viewers", () => {
    useAuthStore.getState().setAuth("token", { role: "viewer" } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: "Topologie" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Facturation" }),
    ).not.toBeInTheDocument();
  });

  it("shows billing to owners", () => {
    useAuthStore.getState().setAuth("token", { role: "owner" } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Facturation" }),
    ).toBeInTheDocument();
  });

  it("shows billing to billing staff", () => {
    useAuthStore.getState().setAuth("token", { role: "billing_aegis" } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Facturation" }),
    ).toBeInTheDocument();
  });
});
