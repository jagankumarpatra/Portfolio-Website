import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayProvider, useOverlay } from "@/context/OverlayContext";
import AIOverlay from "@/components/AIOverlay";
import FloatingAIButton from "@/components/FloatingAIButton";
import type { QAEntry } from "@/lib/qa";

const entries: QAEntry[] = [
  { id: "q01", question: "How many years of experience do you have?", keywords: ["years", "experience"], answer: "2+ years.", followUps: ["q02", "q03"], href: "/experience", sourceLabel: "Experience" },
  { id: "q02", question: "What is your tech stack?", keywords: ["stack", "tech"], answer: "Node.js and TypeScript.", followUps: ["q01", "q03"], href: "/cv", sourceLabel: "CV" },
  { id: "q03", question: "Where can I see your résumé?", keywords: ["resume", "cv"], answer: "On the CV page.", followUps: ["q01", "q02"], href: "/cv", sourceLabel: "CV" },
];
const FALLBACK = "I don't have a verified answer for that yet.";

function Opener({ q }: { q?: string }) {
  const { openOverlay } = useOverlay();
  return <button onClick={() => openOverlay("ai", q)}>open-ai</button>;
}
function Menu() {
  const { openOverlay, overlayOpen } = useOverlay();
  return (
    <>
      <button onClick={() => openOverlay("menu")}>open-menu</button>
      <span data-testid="state">{String(overlayOpen)}</span>
    </>
  );
}
const setup = (extra?: React.ReactNode) =>
  render(
    <OverlayProvider>
      {extra}
      <Opener />
      <FloatingAIButton />
      <AIOverlay entries={entries} fallback={FALLBACK} welcome="welcome text" />
    </OverlayProvider>,
  );

describe("AI overlay", () => {
  it("opens from the floating button and hides that button while open", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /open portfolio q&a/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open portfolio q&a/i })).not.toBeInTheDocument();
  });

  it("disables Send for empty input and shows the helper", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText("open-ai"));
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    expect(screen.getByText(/type a question to enable send/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/your question/i), "   ");
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("answers a matching question with a source link and two follow-ups", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText("open-ai"));
    await user.type(screen.getByLabelText(/your question/i), "years of experience{Enter}");
    expect(screen.getByText("2+ years.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "/experience");
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByRole("button", { name: /tech stack/i }).length).toBeGreaterThan(0);
  });

  it("returns the fallback text when nothing matches", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText("open-ai"));
    await user.type(screen.getByLabelText(/your question/i), "favourite pizza topping{Enter}");
    expect(screen.getByText(FALLBACK)).toBeInTheDocument();
  });

  it("answers a greeting without showing the fallback", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText("open-ai"));
    await user.type(screen.getByLabelText(/your question/i), "hi{Enter}");
    expect(screen.getByText(/published portfolio notes/i)).toBeInTheDocument();
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument();
  });

  it("notes when a question was shortened", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText("open-ai"));
    const long = "years experience ".repeat(30);
    await user.click(screen.getByLabelText(/your question/i));
    await user.paste(long);
    await user.keyboard("{Enter}");
    expect(screen.getByText("Question shortened")).toBeInTheDocument();
  });

  it("closes on Escape and shows the button again", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText("open-ai"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open portfolio q&a/i })).toBeInTheDocument();
  });

  it("hides the floating button while any other overlay (menu) is open", async () => {
    const user = userEvent.setup();
    setup(<Menu />);
    expect(screen.getByRole("button", { name: /open portfolio q&a/i })).toBeInTheDocument();
    await user.click(screen.getByText("open-menu"));
    expect(screen.getByTestId("state")).toHaveTextContent("true");
    expect(screen.queryByRole("button", { name: /open portfolio q&a/i })).not.toBeInTheDocument();
  });

  it("answers a question passed from the compact box when it opens", async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Opener q="what is your tech stack" />
        <AIOverlay entries={entries} fallback={FALLBACK} welcome="w" />
      </OverlayProvider>,
    );
    await user.click(screen.getByText("open-ai"));
    expect(await screen.findByText("Node.js and TypeScript.")).toBeInTheDocument();
  });
});
