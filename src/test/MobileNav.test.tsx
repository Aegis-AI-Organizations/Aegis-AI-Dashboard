import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { MobileNav } from "../components/layout/MobileNav";
import { useAuthStore } from "../store/AuthStore";
import { NAV_ITEMS } from "../constants/navigation";

const renderAs = (role: string, path = "/") => {
  useAuthStore.getState().setAuth("token", { role } as any);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MobileNav />
    </MemoryRouter>,
  );
};

describe("MobileNav", () => {
  it("gives superadmins access to every page through the Plus menu", () => {
    renderAs("superadmin");
    fireEvent.click(screen.getByRole("button", { name: "Plus" }));
    const expected = NAV_ITEMS.filter((item) =>
      item.roles.includes("superadmin"),
    );
    for (const item of expected) {
      expect(
        screen.getByRole("link", { name: item.label }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Topologie" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Facturation" }),
    ).toBeInTheDocument();
  });

  it("shows every entry directly when they fit in the bar", () => {
    renderAs("viewer");
    expect(
      screen.queryByRole("button", { name: "Plus" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tableau de bord" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Paramètres" }),
    ).toBeInTheDocument();
  });

  it("uses the same labels as the sidebar", () => {
    renderAs("superadmin");
    expect(screen.getByRole("link", { name: "Scans" })).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
