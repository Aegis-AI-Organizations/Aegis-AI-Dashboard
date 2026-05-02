import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Users } from "../pages/Users";
import { useAuthStore } from "../store/AuthStore";
import { MemoryRouter } from "react-router-dom";

vi.mock("../store/AuthStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock("../hooks/useTeamsSSE", () => ({
  useTeamsSSE: vi.fn(),
}));

describe("Users Page Wrapper", () => {
  beforeEach(() => {
    (useAuthStore as any).mockReturnValue({
      user: { role: "admin" },
    });
  });

  it("renders the users page title", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.getByText("Équipes")).toBeInTheDocument();
  });
});
