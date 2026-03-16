import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("../pages/Dashboard", () => ({
  Dashboard: () => <div>dashboard-page</div>,
}));
vi.mock("../pages/Vulnerabilities", () => ({
  Vulnerabilities: () => <div>vulnerabilities-page</div>,
}));
vi.mock("../pages/Users", () => ({ Users: () => <div>users-page</div> }));
vi.mock("../pages/Settings", () => ({
  Settings: () => <div>settings-page</div>,
}));

describe("App routes", () => {
  it.each([
    ["/", "dashboard-page"],
    ["/vulnerabilities", "vulnerabilities-page"],
    ["/users", "users-page"],
    ["/settings", "settings-page"],
    ["/monitoring/scan-1", "dashboard-page"],
  ])("renders %s", (entry, expectedText) => {
    render(
      <MemoryRouter initialEntries={[entry]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});
