import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Administration } from "../pages/Administration";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("Administration Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the onboarding form initially", () => {
    render(<Administration />);
    expect(screen.getByText("Administration")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("ex: Global CyberSec Inc."),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jean Dupont")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("client@entreprise.com"),
    ).toBeInTheDocument();
  });

  it("handles successful onboarding submission", async () => {
    const mockResponse = {
      data: {
        company_id: "comp-123",
        owner_id: "user-456",
        deployment_token: "token-secret",
      },
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    render(<Administration />);

    fireEvent.change(screen.getByPlaceholderText("ex: Global CyberSec Inc."), {
      target: { value: "Aegis AI" },
    });
    fireEvent.change(screen.getByPlaceholderText("Jean Dupont"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("client@entreprise.com"), {
      target: { value: "john@aegis.ai" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Finaliser l'Onboarding/i }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Onboarding Réussi !")).toBeInTheDocument();
      expect(screen.getByText("comp-123")).toBeInTheDocument();
      expect(screen.getByText("token-secret")).toBeInTheDocument();
    });

    // Test "Create another client" button
    fireEvent.click(screen.getByText("Créer un autre Client"));
    expect(screen.getByText("Administration")).toBeInTheDocument();
  });

  it("handles onboarding error", async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { error: "Name already exists" } },
    });

    render(<Administration />);

    fireEvent.change(screen.getByPlaceholderText("ex: Global CyberSec Inc."), {
      target: { value: "Aegis AI" },
    });
    fireEvent.change(screen.getByPlaceholderText("Jean Dupont"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("client@entreprise.com"), {
      target: { value: "john@aegis.ai" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Finaliser l'Onboarding/i }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Name already exists")).toBeInTheDocument();
    });
  });
});
