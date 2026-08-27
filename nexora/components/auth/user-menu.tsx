"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const PANEL_ID = "user-menu-panel";

function initialsOf(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name ?? email ?? "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ name, email, image }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>("[role='menuitem']")
      ?.focus();
  }, [open]);

  const display = name?.trim() || email?.trim() || "Account";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-ring"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary"
          >
            {initialsOf(name, email)}
          </span>
        )}
        <span className="max-w-[10rem] truncate">{display}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      <div
        id={PANEL_ID}
        ref={panelRef}
        role="menu"
        aria-label="Account menu"
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
      >
        <div className="border-b border-border px-3 py-2 text-xs">
          <p className="truncate font-medium text-foreground">{display}</p>
          {email ? (
            <p className="truncate text-muted-foreground">{email}</p>
          ) : null}
        </div>
        <Button
          role="menuitem"
          variant="ghost"
          className="w-full justify-start rounded-none px-3 py-2 text-sm"
          onClick={() => {
            setOpen(false);
            void signOut({ callbackUrl: "/" });
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
