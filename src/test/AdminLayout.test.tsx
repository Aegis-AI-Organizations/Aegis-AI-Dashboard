import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AdminLayout } from "../components/layout/AdminLayout";

describe("AdminLayout", () => {
  it("renders shell navigation and nested content", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<div>nested-dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Dashboard")[0]).toBeInTheDocument();
    expect(screen.getByText("nested-dashboard")).toBeInTheDocument();

    const aside = screen.getByRole("complementary");
    fireEvent.mouseEnter(aside);
    expect(screen.getByText("Tableau de Bord")).toBeInTheDocument();
    expect(screen.getByText("Administrateur")).toBeInTheDocument();
  });

  it("handles image error in Sidebar", () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>,
    );

    const logo = screen.getByAltText("Aegis AI Logo");
    fireEvent.error(logo);
    expect(logo).toHaveAttribute("src", "/logo.png");
  });

  it("performs logout from Sidebar", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>LoginPage</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Sidebar logout button is visible when expanded or in the bottom when collapsed
    // Let's expand it first
    const aside = screen.getByRole("complementary");
    fireEvent.mouseEnter(aside);

    const logoutButtons = screen.getAllByTitle("Déconnexion");
    fireEvent.click(logoutButtons[0]);

    expect(screen.getByText("Se déconnecter")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Se déconnecter"));

    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("performs logout from Topbar", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>LoginPage</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const topbar = screen.getByRole("banner");
    const logoutButton = topbar.querySelector('button[title="Déconnexion"]');
    fireEvent.click(logoutButton!);

    fireEvent.click(screen.getByText("Se déconnecter"));
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });
});
