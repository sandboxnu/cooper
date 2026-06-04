import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BodyLogoWhite from "~/app/_components/body-logo-white";
import BodyLogo from "~/app/_components/body-logo";
import CooperLogo from "~/app/_components/cooper-logo";

describe("logo components", () => {
  test("BodyLogo renders an image with default sizing", () => {
    render(<BodyLogo />);
    const img = screen.getByAltText("Logo Picture");
    expect(img).toBeInTheDocument();
  });

  test("BodyLogo respects an explicit width", () => {
    render(<BodyLogo width={117} />);
    const img = screen.getByAltText("Logo Picture");
    expect(img.getAttribute("width")).toBe("117");
  });

  test("BodyLogoWhite renders an image", () => {
    render(<BodyLogoWhite width={80} />);
    expect(screen.getByAltText("Logo Picture")).toBeInTheDocument();
  });

  test("CooperLogo renders an image", () => {
    render(<CooperLogo />);
    expect(screen.getByAltText("Logo Picture")).toBeInTheDocument();
  });
});
