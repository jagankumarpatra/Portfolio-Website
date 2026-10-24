import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// jsdom has no matchMedia; default to a desktop viewport. Tests can override it.
vi.stubGlobal("matchMedia", (q: string) => ({
  matches: false, media: q, addEventListener() {}, removeEventListener() {},
}));
