import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Audit } from "../pages/Audit";

vi.mock("../components/AuditTrail", () => ({
  AuditTrail: () => <div data-testid="audit-trail">Audit Trail</div>,
}));

describe("Audit Page", () => {
  it("renders the audit page with title and trail component", () => {
    render(<Audit />);
    expect(screen.getByText("Logs d'Audit")).toBeInTheDocument();
    expect(screen.getByTestId("audit-trail")).toBeInTheDocument();
  });
});
