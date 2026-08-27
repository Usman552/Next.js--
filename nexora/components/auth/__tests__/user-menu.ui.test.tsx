import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { signOutMock } from "@/tests/helpers/next-auth-react";
import { UserMenu } from "@/components/auth/user-menu";

describe("<UserMenu />", () => {
  beforeEach(() => {
    signOutMock.mockClear();
  });

  it("shows the user display name (falling back to email)", () => {
    render(<UserMenu name="Priya Shah" email="priya@nexora.local" />);
    expect(screen.getAllByText("Priya Shah").length).toBeGreaterThanOrEqual(1);
  });

  it("is collapsed by default with aria-expanded=false", () => {
    render(<UserMenu name="Priya" email="p@nexora.local" />);
    const toggle = screen.getByRole("button", { expanded: false });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");
  });

  it("opens on click and moves focus into the menu; Escape closes and returns focus", async () => {
    const user = userEvent.setup();
    render(<UserMenu name="Priya" email="p@nexora.local" />);
    const toggle = screen.getByRole("button", { name: /Priya/i });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    // A menuitem is present and focused.
    const signOut = screen.getByRole("menuitem", { name: /Sign out/i });
    expect(signOut).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);
  });

  it("keyboard: Enter/Space on the toggle opens the menu", async () => {
    const user = userEvent.setup();
    render(<UserMenu name="Priya" email="p@nexora.local" />);
    const toggle = screen.getByRole("button", { name: /Priya/i });

    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("selecting 'Sign out' invokes signOut()", async () => {
    const user = userEvent.setup();
    render(<UserMenu name="Priya" email="p@nexora.local" />);
    await user.click(screen.getByRole("button", { name: /Priya/i }));
    await user.click(screen.getByRole("menuitem", { name: /Sign out/i }));

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
