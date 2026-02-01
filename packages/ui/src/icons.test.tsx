import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CheckIcon } from "./icons";

describe("icons", () => {
  test("CheckIcon is exported and renders as svg", () => {
    const { container } = render(<CheckIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  test("CheckIcon accepts className", () => {
    const { container } = render(<CheckIcon className="icon-class" />);
    const svg = container.querySelector("svg.icon-class");
    expect(svg).toBeInTheDocument();
  });
});
