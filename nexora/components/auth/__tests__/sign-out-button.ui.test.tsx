import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { signOutMock } from "@/tests/helpers/next-auth-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

describe("<SignOutButton />", () => {
  beforeEach(() => {
    signOutMock.mockClear();
  });

  it("renders 'Sign out' by default", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("calls signOut({ callbackUrl: '/' }) on click", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("supports a custom callbackUrl", async () => {
    const user = userEvent.setup();
    render(<SignOutButton callbackUrl="/goodbye">Log out</SignOutButton>);
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/goodbye" });
  });
});
