"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/**
 * Default right-side controls when no `rightSlot` is passed (i.e. the
 * marketing landing). "Sign in" navigates to the branded sign-in page which
 * exposes OAuth (Google/GitHub) + email/password. "Get started" navigates to
 * the sign-up page. Both are real routes — NOT scroll anchors.
 */
function DefaultAuthCTAs() {
  return (
    <>
      <Button variant="ghost" asChild>
        <Link href="/auth/signin?callbackUrl=/app">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup?callbackUrl=/app">Get started</Link>
      </Button>
    </>
  );
}

const MOBILE_PANEL_ID = "mobile-nav-panel";

type NavbarProps = {
  /**
   * Optional right-side controls. When omitted, defaults to the marketing
   * "Sign in / Get started" pair. Consumers can pass `<NavAuthSlot />` to
   * render auth-aware controls (user menu when signed in).
   */
  rightSlot?: React.ReactNode;
};

export function Navbar({ rightSlot }: NavbarProps = {}) {
  const [open, setOpen] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Escape closes the panel and returns focus to the toggle.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // When opening, move focus into the first link in the panel.
  React.useEffect(() => {
    if (!open) return;
    const firstLink = panelRef.current?.querySelector<HTMLElement>(
      "a, button"
    );
    firstLink?.focus();
  }, [open]);

  // Lock body scroll while the mobile panel is open.
  React.useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const closePanel = React.useCallback(() => setOpen(false), []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md text-foreground focus-ring"
            aria-label={`${siteConfig.name} home`}
          >
            <Image
              src="/logo-mark.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-base font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {siteConfig.nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex md:items-center md:gap-2">
            {rightSlot ?? <DefaultAuthCTAs />}
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-ring md:hidden"
            aria-expanded={open}
            aria-controls={MOBILE_PANEL_ID}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile panel */}
      <div
        id={MOBILE_PANEL_ID}
        ref={panelRef}
        hidden={!open}
        className={cn(
          "border-t border-border bg-background md:hidden",
          open && "shadow-lg"
        )}
      >
        <Container>
          <nav aria-label="Mobile primary" className="flex flex-col gap-1 py-4">
            {siteConfig.nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closePanel}
                className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent focus-ring"
              >
                {link.label}
              </Link>
            ))}
            <div
              className="mt-2 flex flex-col gap-2 border-t border-border pt-4"
              onClick={closePanel}
            >
              {rightSlot ?? <DefaultAuthCTAs />}
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
}
