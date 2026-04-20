import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Settings } from "../pages/Settings";
import { Users } from "../pages/Users";

describe("static pages", () => {
  it("renders users page", () => {
    render(<Users />);
    expect(
      screen.getByText(
        "Gérez les accès à la plateforme, les rôles et les permissions des utilisateurs.",
      ),
    ).toBeInTheDocument();
  });

  it("renders settings page", () => {
    render(<Settings />);
    expect(
      screen.getByText("Gérez votre compte et vos préférences de sécurité."),
    ).toBeInTheDocument();
  });
});
