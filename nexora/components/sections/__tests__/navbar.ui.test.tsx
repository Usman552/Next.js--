import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    ...rest
  }: {
    alt: string;
    src: string;
    width?: number;
    height?: number;
  }) => {
    const {
      width: _w,
      height: _h,
      ...safeRest
    } = rest as Record<string, unknown>;
    void _w;
    void _h;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...(safeRest as object)} />;
  },
}));

import { Navbar } from "@/components/sections/navbar";

describe("<Navbar /> — default (marketing) right-side controls", () => {
  it("renders 'Sign in' as a link to /auth/signin?callbackUrl=/app (NOT a scroll anchor)", () => {
    render(<Navbar />);
    const links = screen.getAllByRole("link", { name: /^Sign in$/ });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link.getAttribute("href")).toBe("/auth/signin?callbackUrl=/app");
    }
    // Regression guard: no scroll-anchor CTA survives.
    expect(document.body.innerHTML).not.toContain('href="#final-cta"');
  });

  it("renders 'Get started' as a link to /auth/signup?callbackUrl=/app", () => {
    render(<Navbar />);
    const links = screen.getAllByRole("link", { name: /^Get started$/ });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link.getAttribute("href")).toBe("/auth/signup?callbackUrl=/app");
    }
  });

  it("renders the rightSlot in place of the default pair when provided", () => {
    render(
      <Navbar
        rightSlot={
          <button type="button" data-testid="custom-slot">
            Custom
          </button>
        }
      />
    );
    expect(screen.getAllByTestId("custom-slot").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("link", { name: /^Get started$/ })).toBeNull();
  });

  it("preserves the primary nav landmark and mobile toggle button", () => {
    render(<Navbar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open menu|Close menu/i })
    ).toBeInTheDocument();
  });
});
