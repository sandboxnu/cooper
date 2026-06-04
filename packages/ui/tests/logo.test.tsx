import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    onError,
  }: {
    src: string;
    alt: string;
    onError?: () => void;
  }) => <img src={src} alt={alt} onError={onError} />,
}));

import Logo from "../src/logo";

const company = {
  id: "c1",
  name: "Acme Corp",
  website: "https://acme.com",
} as unknown as ComponentProps<typeof Logo>["company"];

describe("Logo", () => {
  test("builds the logo URL from the company website without protocol", () => {
    render(<Logo company={company} />);
    const img = screen.getByAltText("Logo of Acme Corp");
    expect(img.getAttribute("src")).toContain("acme.com");
    expect(img.getAttribute("src")).not.toContain("https://acme.com");
  });

  test("falls back to a name-based domain when no website is set", () => {
    render(<Logo company={{ ...company, website: "" }} />);
    const img = screen.getByAltText("Logo of Acme Corp");
    // Spaces stripped: "AcmeCorp.com"
    expect(img.getAttribute("src")).toContain("AcmeCorp.com");
  });

  test("renders an initial-letter fallback when the image errors", () => {
    render(<Logo company={company} />);
    fireEvent.error(screen.getByAltText("Logo of Acme Corp"));
    expect(screen.queryByAltText("Logo of Acme Corp")).not.toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
