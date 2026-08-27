import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

// next/link is not runnable in a jsdom test without the app router. Stub it.
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import AuthErrorPage from "@/app/auth/error/page";

async function renderErrorPage(code: string | undefined): Promise<void> {
  const searchParams = Promise.resolve(code === undefined ? {} : { code });
  // Server components can be invoked as async functions and rendered directly
  // when they only await their own inputs.
  const element = (await AuthErrorPage({ searchParams })) as ReactElement;
  render(element);
}

describe("<AuthErrorPage />", () => {
  const cases: Array<[string, string]> = [
    ["verification_failed", "verify your identity token"],
    ["upstream_error", "identity provider is having trouble"],
    ["provisioning_failed", "could not finish setting up"],
    ["unknown", "Something went wrong"],
  ];

  it.each(cases)("renders the safe message for code=%s", async (code, needle) => {
    await renderErrorPage(code);
    const message = screen.getByTestId("auth-error-message");
    expect(message.textContent?.toLowerCase()).toContain(needle.toLowerCase());
  });

  it("falls back to the generic message when code is not one of the known values", async () => {
    await renderErrorPage("totally-made-up-code-42");
    const message = screen.getByTestId("auth-error-message");
    expect(message.textContent).toContain("Something went wrong");
    // Raw code MUST NOT appear anywhere in the DOM.
    expect(document.body.textContent).not.toContain("totally-made-up-code-42");
  });

  it("falls back to the generic message when code is omitted", async () => {
    await renderErrorPage(undefined);
    const message = screen.getByTestId("auth-error-message");
    expect(message.textContent).toContain("Something went wrong");
  });
});
