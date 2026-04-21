import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Billing } from "../pages/Billing";

describe("Billing Page", () => {
  it("renders the billing information correctly", () => {
    render(<Billing />);

    // Check for title
    expect(screen.getByText("Facturation")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gérez votre abonnement, vos factures et vos méthodes de paiement.",
      ),
    ).toBeInTheDocument();

    // Check for plan details
    expect(screen.getByText("Plan Actuel")).toBeInTheDocument();
    expect(screen.getByText("Premium Enterprise")).toBeInTheDocument();
    expect(
      screen.getByText("Votre abonnement se renouvelle le 12 Mai 2026."),
    ).toBeInTheDocument();

    // Check for metrics
    expect(screen.getByText("Usage Mensuel")).toBeInTheDocument();
    expect(screen.getByText("1,248")).toBeInTheDocument();
    expect(screen.getByText("/ 5,000 scans")).toBeInTheDocument();

    // Check for payment method
    expect(screen.getByText("Méthode de Paiement")).toBeInTheDocument();
    expect(screen.getByText("•••• •••• •••• 4242")).toBeInTheDocument();
    expect(screen.getByText("Visa")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<Billing />);
    expect(
      screen.getByRole("button", { name: /Changer de Plan/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Historique des Paiements/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Modifier la Carte/i }),
    ).toBeInTheDocument();
  });
});
