import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Topbar } from "../components/layout/Topbar";
import { useAuthStore } from "../store/AuthStore";

const renderTopbar = (role = "superadmin") => {
  useAuthStore.getState().setAuth("token", { role } as any);
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Topbar />
      <Routes>
        <Route path="/" element={<div>home-page</div>} />
        <Route path="/topology" element={<div>topology-page</div>} />
        <Route path="/audit" element={<div>audit-page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("CommandPalette", () => {
  it("opens with Ctrl+K and navigates with the keyboard", () => {
    renderTopbar();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const input = screen.getByRole("combobox", { name: "Rechercher une page" });
    fireEvent.change(input, { target: { value: "topo" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("topology-page")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ignores accents when searching", () => {
    renderTopbar();
    fireEvent.click(screen.getByRole("button", { name: /Aller à une page/ }));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "journal d'audit" },
    });
    fireEvent.click(screen.getByRole("option", { name: "Journal d'audit" }));
    expect(screen.getByText("audit-page")).toBeInTheDocument();
  });

  it("only lists pages the role can open", () => {
    renderTopbar("viewer");
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(
      screen.queryByRole("option", { name: "Facturation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Paramètres" }),
    ).toBeInTheDocument();
  });

  it("closes with Escape and shows an empty state", () => {
    renderTopbar();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText(/Aucune page ne correspond/)).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("no longer shows a notification bell", () => {
    renderTopbar();
    expect(screen.queryByRole("button", { name: /notification/i })).toBeNull();
  });
});
