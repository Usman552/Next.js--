import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

describe("jsdom smoke test", () => {
  it("renders a heading with jest-dom matchers loaded", () => {
    render(<h1>Nexora</h1>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Nexora"
    );
  });
});
