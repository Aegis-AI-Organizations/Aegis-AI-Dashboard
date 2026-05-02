import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Settings } from "../pages/Settings";
import { Users } from "../pages/Users";
import { MemoryRouter } from "react-router-dom";

// Mock the AuthStore to provide a default user for rendering
vi.mock("../store/AuthStore", () => ({
  useAuthStore: (fn?: any) => {
    const state = {
      user: { name: "Test User", email: "test@example.com", role: "admin" },
      accessToken: "fake-token",
    };
    return fn ? fn(state) : state;
  },
}));

describe("static pages", () => {
  it("renders users page", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.getByText("Équipes")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gérez vos entités clientes et les comptes collaborateurs directement depuis ce portail centralisé.",
      ),
    ).toBeInTheDocument();
  });

  it("renders settings page", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(
        "Gérez votre identité numérique, sécurisez votre accès et configurez vos préférences Aegis AI.",
      ),
    ).toBeInTheDocument();
  });
});
