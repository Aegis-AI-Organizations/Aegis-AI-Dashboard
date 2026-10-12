import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, vi } from "vitest";

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const quietPatterns = [
  /^🔌 /,
  /^Team update received:/,
  /^SSE Error/,
  /^Erreur lors de la récupération/,
  /^No routes matched location/,
  /^The tag <.*> is unrecognized in this browser\./,
];

const shouldSuppress = (args: unknown[]) => {
  const message = args.map(String).join(" ");
  return quietPatterns.some((pattern) => pattern.test(message));
};

console.log = (...args: unknown[]) => {
  if (!shouldSuppress(args)) originalConsoleLog(...args);
};

console.error = (...args: unknown[]) => {
  if (!shouldSuppress(args)) originalConsoleError(...args);
};

console.warn = (...args: unknown[]) => {
  if (!shouldSuppress(args)) originalConsoleWarn(...args);
};

afterEach(() => {
  cleanup();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock EventSource for Vitest/jsdom
if (typeof window !== "undefined") {
  (window as any).EventSource = vi.fn().mockImplementation(() => ({
    onmessage: null,
    onerror: null,
    close: vi.fn(),
  }));
}
