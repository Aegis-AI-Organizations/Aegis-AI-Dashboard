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

    expect(screen.getAllByText("Tableau de Bord")[0]).toBeInTheDocument();
    expect(screen.getByText("nested-dashboard")).toBeInTheDocument();

    const aside = screen.getByRole("complementary");
    fireEvent.mouseEnter(aside);
    expect(screen.getAllByText("Tableau de Bord")[0]).toBeInTheDocument();
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

    expect(screen.getByText("Se déconnecter")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Se déconnecter"));

    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });
});
