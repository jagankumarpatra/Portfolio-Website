"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useOverlay } from "@/context/OverlayContext";
import { useTheme } from "@/components/ThemeShell";
import type { SearchItem } from "@/lib/portfolio";

const groups = [
  { label: "Work", links: [{ href: "/", label: "Home" }, { href: "/projects", label: "Case studies" }, { href: "/system-design", label: "System design" }] },
  { label: "Profile", links: [{ href: "/experience", label: "Experience" }, { href: "/about", label: "About" }, { href: "/skills", label: "Skills" }, { href: "/education", label: "Education" }] },
  { label: "Connect", links: [{ href: "/contact", label: "Contact" }, { href: "/cv", label: "Résumé" }] },
];

type HeaderProps = { name: string; tagline?: string; github?: string; searchItems?: SearchItem[] };

export default function Header({ name, tagline = "Backend engineer", github, searchItems = [] }: HeaderProps) {
  const pathname = usePathname();
  const { overlay, openOverlay, closeOverlay } = useOverlay();
  const { theme, toggleTheme } = useTheme();
  const menuOpen = overlay === "menu";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (overlay === "menu") closeOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlay();
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusables = menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; window.removeEventListener("keydown", onKey); };
  }, [menuOpen, closeOverlay]);

  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < 24 || currentY < previousY);
      previousY = currentY;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.clientY <= 8) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b border-line bg-bg/95 transition-transform duration-200 ${visible || menuOpen ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" title="Home" className="whitespace-nowrap text-sm font-semibold text-fg hover:text-accent">
            {name}
          </Link>
          <button type="button" onClick={() => openOverlay("search")} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-3 text-sm text-muted hover:border-accent hover:text-fg" aria-label="Search portfolio">
            <Search className="h-4 w-4" /><span className="hidden sm:inline">Search</span><kbd className="hidden rounded border border-line px-1.5 font-mono text-xs sm:inline">/</kbd>
          </button>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <Link href="/projects" className="rounded-md px-2.5 py-2 text-sm text-muted hover:text-accent">Work</Link>
          <Link href="/experience" className="rounded-md px-2.5 py-2 text-sm text-muted hover:text-accent">Experience</Link>
          <Link href="/system-design" className="rounded-md px-2.5 py-2 text-sm text-muted hover:text-accent">System design</Link>
          <Link href="/about" className="rounded-md px-2.5 py-2 text-sm text-muted hover:text-accent">About</Link>
        </nav>

        <div className="flex items-center gap-1">
          {github && <a href={github} target="_blank" rel="noopener noreferrer" className="hidden rounded-md px-2.5 py-2 text-sm text-muted hover:text-accent xl:inline-flex">GitHub</a>}
          <Link href="/contact" className="hidden rounded-md px-2.5 py-2 text-sm text-muted hover:text-accent sm:inline-flex">Contact</Link>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="button-accent hidden rounded-md px-3 py-2 text-sm font-medium hover:opacity-90 sm:inline-flex">Résumé</a>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-muted hover:text-fg"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => (menuOpen ? closeOverlay() : openOverlay("menu"))}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-line bg-bg/98 px-6 py-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center gap-3 border-b border-line pb-5">
              <span className="button-accent flex h-11 w-11 items-center justify-center rounded-full font-semibold">{name.slice(0, 1)}</span>
              <div><p className="font-semibold text-fg">{name}</p><p className="text-sm text-muted">{tagline}</p></div>
            </div>
            <nav aria-label="Portfolio navigation" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <section key={group.label} aria-labelledby={`menu-${group.label}`}>
                  <h2 id={`menu-${group.label}`} className="eyebrow mb-3">{group.label}</h2>
                  <ul className="space-y-1">
                    {group.links.map((item) => (
                      <li key={item.href}><Link href={item.href} onClick={closeOverlay} className="block rounded-lg px-3 py-2.5 text-fg hover:bg-card2 hover:text-accent">{item.label}</Link></li>
                    ))}
                    {group.label === "Work" && searchItems.filter((item) => item.type === "project").map((item) => (
                      <li key={item.id}><Link href={item.href} onClick={closeOverlay} className="block rounded-lg px-3 py-2.5 text-fg hover:bg-card2 hover:text-accent">{item.title}</Link></li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
            <button type="button" onClick={toggleTheme} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 py-2 text-sm text-fg hover:border-accent">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {theme === "dark" ? "light" : "dark"} theme
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
