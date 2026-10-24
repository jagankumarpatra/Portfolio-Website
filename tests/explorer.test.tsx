import { describe, expect, it, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayProvider } from "@/context/OverlayContext";
import FloatingAIButton from "@/components/FloatingAIButton";
import Explorer, { type ExplorerSystem } from "@/components/Explorer";

let nodeParam: string | null = null;
vi.mock("next/navigation", () => ({
  usePathname: () => "/system-design",
  useSearchParams: () => ({ get: (k: string) => (k === "node" ? nodeParam : null) }),
}));

beforeAll(() => {
  // jsdom lacks these browser APIs that React Flow needs.
  class RO { observe() {} unobserve() {} disconnect() {} }
  vi.stubGlobal("ResizeObserver", RO);
  class DM { m22 = 1; constructor() {} }
  vi.stubGlobal("DOMMatrixReadOnly", DM);
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: { configurable: true, get() { return 44; } },
    offsetWidth: { configurable: true, get() { return 170; } },
  });
  (SVGElement.prototype as unknown as { getBBox: () => unknown }).getBBox = () => ({ x: 0, y: 0, width: 170, height: 44 });
});

const systems: ExplorerSystem[] = [
  {
    id: "s1", title: "System One", status: "approved", caseStudyHref: "/projects/one",
    nodes: [
      { id: "a", label: "Alpha node", type: "client", x: 0, y: 0, role: "Alpha role text.", status: "approved" },
      { id: "b", label: "Beta node", type: "db", x: 300, y: 0, role: "Beta role text.", status: "approved" },
    ],
    edges: [["a", "b"]],
  },
  {
    id: "s2", title: "System Two", status: "draft", caseStudyHref: null,
    nodes: [{ id: "c", label: "Gamma node", type: "service", x: 0, y: 0, role: "Gamma role text.", status: "draft" }],
    edges: [],
  },
];

const renderExplorer = () =>
  render(
    <OverlayProvider>
      <Explorer systems={systems} />
      <FloatingAIButton />
    </OverlayProvider>,
  );

describe("Explorer", () => {
  it("renders the system tabs and the nodes of the first system", async () => {
    nodeParam = null;
    renderExplorer();
    expect(screen.getByRole("tab", { name: "System One" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /System Two/ })).toHaveAttribute("aria-selected", "false");
    expect(await screen.findByText("Alpha node")).toBeInTheDocument();
    expect(screen.getByText("Select a node to see what it does.")).toBeInTheDocument();
  });

  it("opens the deep-linked node's details and ignores an invalid node id", async () => {
    nodeParam = "b";
    const first = renderExplorer();
    expect(await screen.findByRole("heading", { name: "Beta node" })).toBeInTheDocument();
    expect(screen.getByText("Beta role text.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the case study/i })).toHaveAttribute("href", "/projects/one");
    first.unmount();

    nodeParam = "does-not-exist";
    renderExplorer();
    expect(await screen.findByText("Alpha node")).toBeInTheDocument();
    expect(screen.getByText("Select a node to see what it does.")).toBeInTheDocument();
  });

  it("deep-links into the second system and switches tabs", async () => {
    nodeParam = "c";
    renderExplorer();
    expect(await screen.findByRole("heading", { name: "Gamma node" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /System Two/ })).toHaveAttribute("aria-selected", "true");
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "System One" }));
    expect(await screen.findByText("Alpha node")).toBeInTheDocument();
    expect(screen.getByText("Select a node to see what it does.")).toBeInTheDocument();
  });

  it("uses the bottom sheet on mobile and hides the floating AI button while it is open", async () => {
    nodeParam = "a";
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("max-width: 767px"), media: q, addEventListener() {}, removeEventListener() {},
    }));
    renderExplorer();
    expect(await screen.findByRole("dialog", { name: /alpha node details/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open portfolio q&a/i })).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /close details/i }));
    expect(screen.queryByRole("dialog", { name: /alpha node details/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open portfolio q&a/i })).toBeInTheDocument();
  });
});
