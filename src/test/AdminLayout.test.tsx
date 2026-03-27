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

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("nested-dashboard")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    const aside = screen.getByRole("complementary");
    fireEvent.mouseEnter(aside);
    expect(screen.getByText("Tableau de Bord")).toBeInTheDocument();
    expect(screen.getByText("Admin Sys")).toBeInTheDocument();
  });
});
