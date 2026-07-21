import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompanySettings } from "../pages/CompanySettings";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const company = {
  id: "company-1",
  name: "Tenant Corp",
  owner_email: "owner@test.com",
  member_count: 4,
  org_size: "ORGANIZATION_SIZE_11_50",
  org_type: "ORGANIZATION_TYPE_SOFTWARE_DEVELOPMENT",
  token_balance: 42,
};

describe("CompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: company });
  });

  it("loads the current company", async () => {
    render(<CompanySettings />);

    expect(await screen.findByDisplayValue("Tenant Corp")).toBeInTheDocument();
    expect(screen.getByText("owner@test.com")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/companies/me");
  });

  it("saves editable company fields", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({
      data: { ...company, name: "Tenant Updated" },
    });

    render(<CompanySettings />);

    fireEvent.change(await screen.findByLabelText("Nom de l'entreprise"), {
      target: { value: "Tenant Updated" },
    });
    fireEvent.change(screen.getByLabelText("Taille"), {
      target: { value: "ORGANIZATION_SIZE_51_200" },
    });
    fireEvent.change(screen.getByLabelText("Secteur"), {
      target: { value: "ORGANIZATION_TYPE_FINANCIAL_SERVICES" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sauvegarder/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/companies/me", {
        name: "Tenant Updated",
        org_size: "ORGANIZATION_SIZE_51_200",
        org_type: "ORGANIZATION_TYPE_FINANCIAL_SERVICES",
      });
      expect(screen.getByText("Entreprise mise à jour.")).toBeInTheDocument();
    });
  });

  it("requires a company name before saving", async () => {
    render(<CompanySettings />);

    fireEvent.change(await screen.findByLabelText("Nom de l'entreprise"), {
      target: { value: " " },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sauvegarder/i }));

    expect(
      await screen.findByText("Le nom est obligatoire."),
    ).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
});
