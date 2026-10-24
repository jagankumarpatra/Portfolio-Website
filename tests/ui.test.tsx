import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkList from "@/components/WorkList";
import CopyButton from "@/components/CopyButton";
import StaticDiagram from "@/components/StaticDiagram";
import { OverlayProvider } from "@/context/OverlayContext";
import Header from "@/components/Header";
import ThemeShell from "@/components/ThemeShell";

const items = [
  { slug: "a", title: "Alpha", impact: "i", tags: ["x"], categories: ["Production", "AI Features"], draft: false },
  { slug: "b", title: "Bravo", impact: "i", tags: ["y"], categories: ["Production"], draft: false },
];

describe("WorkList filters", () => {
  it("shows everything by default and filters by category", async () => {
    const user = userEvent.setup();
    render(<WorkList items={items} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "AI Features" }));
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Bravo")).toBeInTheDocument();
  });
});

describe("CopyButton", () => {
  it("copies text to the clipboard and confirms", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="hello" label="Copy Email Address" />);
    await user.click(screen.getByRole("button", { name: "Copy Email Address" }));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe("hello");
  });
  it("uses the textarea fallback when the clipboard API fails", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="hello" label="Copy Template Text" />);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockRejectedValue(new Error("no")) }, configurable: true });
    document.execCommand = vi.fn().mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Copy Template Text" }));
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});

describe("StaticDiagram", () => {
  it("renders every node label and an accessible name", () => {
    render(<StaticDiagram system={{ id: "s", title: "Sys", nodes: [{ id: "a", label: "Node A", x: 0, y: 0 }, { id: "b", label: "Node B", x: 300, y: 0 }], edges: [["a", "b"]] }} />);
    expect(screen.getByRole("img", { name: /architecture diagram: sys/i })).toBeInTheDocument();
    expect(screen.getByText("Node A")).toBeInTheDocument();
    expect(screen.getByText("Node B")).toBeInTheDocument();
  });
});

describe("Header mobile menu", () => {
  it("opens a full-screen menu, and closes it when a link is clicked", async () => {
    const user = userEvent.setup();
    render(<OverlayProvider><ThemeShell><Header name="Jagan Kumar Patra" /></ThemeShell></OverlayProvider>);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(menu).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Case studies" }));
    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
  });
  it("closes the menu with Escape", async () => {
    const user = userEvent.setup();
    render(<OverlayProvider><ThemeShell><Header name="Jagan Kumar Patra" /></ThemeShell></OverlayProvider>);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
  });
});
